export class EscPosEncoder {
  private buffer: number[] = [];

  initialize() {
    this.buffer.push(0x1B, 0x40); // ESC @
    return this;
  }

  text(text: string) {
    for (let i = 0; i < text.length; i++) {
      this.buffer.push(text.charCodeAt(i));
    }
    return this;
  }

  newline() {
    this.buffer.push(0x0A);
    return this;
  }

  align(align: 'left' | 'center' | 'right') {
    const val = align === 'left' ? 0 : align === 'center' ? 1 : 2;
    this.buffer.push(0x1B, 0x61, val);
    return this;
  }

  bold(bold: boolean) {
    this.buffer.push(0x1B, 0x45, bold ? 1 : 0);
    return this;
  }

  size(width: number, height: number) {
    const val = (width - 1) * 16 + (height - 1);
    this.buffer.push(0x1D, 0x21, val);
    return this;
  }

  cut() {
    this.buffer.push(0x1D, 0x56, 0x41, 0x03);
    return this;
  }

  encode() {
    return new Uint8Array(this.buffer);
  }
}

export class ThermalPrinter {
  private device: any = null;
  private writer: any = null;

  async connectSerial() {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API is not supported in this browser.');
      }
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.device = port;
      this.writer = port.writable.getWriter();
      return true;
    } catch (error) {
      console.error('Failed to connect to serial printer:', error);
      return false;
    }
  }

  async printReceipt(
    orderData: {
      customerName: string;
      orderType: string;
      items: { name: string; quantity: number; price: number }[];
      total: number;
    },
    shopName: string = 'SHN Coffee',
    paperSize: '58mm' | '80mm' = '58mm'
  ) {
    if (!this.writer) {
      throw new Error('Printer not connected');
    }

    const charWidth = paperSize === '80mm' ? 48 : 32;
    const line = '-'.repeat(charWidth);

    const encoder = new EscPosEncoder();
    encoder
      .initialize()
      .align('center')
      .bold(true)
      .size(2, 2)
      .text(shopName)
      .newline()
      .size(1, 1)
      .bold(false)
      .text('Coffee Bar - Takeaway')
      .newline()
      .text(line)
      .newline()
      .align('left')
      .text(`Pelanggan : ${orderData.customerName}`)
      .newline()
      .text(`Tipe      : ${orderData.orderType}`)
      .newline()
      .text(line)
      .newline();

    const nameWidth = charWidth - 12; // e.g. 48 - 12 = 36 or 32 - 12 = 20
    for (const item of orderData.items) {
      const name = item.name.substring(0, nameWidth).padEnd(nameWidth, ' ');
      const qtyStr = `${item.quantity}x`.padStart(3, ' ');
      const priceStr = (item.price * item.quantity).toString().padStart(7, ' ');
      encoder.text(`${name} ${qtyStr} ${priceStr}`).newline();
    }

    encoder
      .text(line)
      .newline()
      .align('right')
      .bold(true)
      .text(`TOTAL: Rp ${orderData.total.toLocaleString('id-ID')}`)
      .newline()
      .bold(false)
      .newline()
      .align('center')
      .text('Terima Kasih!')
      .newline()
      .newline()
      .newline()
      .cut();

    const data = encoder.encode();
    await this.writer.write(data);
  }

  async printCupSticker(
    orderData: {
      orderNumber: string;
      customerName: string;
      itemIndex: number;
      totalItems: number;
      menuName: string;
      modifiers?: any;
      notes?: string;
    },
    shopName: string = 'SHN Coffee',
    paperSize: '58mm' | '80mm' = '58mm'
  ) {
    if (!this.writer) {
      throw new Error('Printer not connected');
    }

    const charWidth = paperSize === '80mm' ? 48 : 32;
    const line = '-'.repeat(charWidth);

    const encoder = new EscPosEncoder();
    encoder
      .initialize()
      .align('center')
      .bold(true)
      .size(1, 1)
      .text(shopName)
      .newline()
      .bold(false)
      .text(line)
      .newline()
      .align('left')
      .text(`Order: ${orderData.orderNumber || '-'}`)
      .newline()
      .text(`Cust : ${orderData.customerName || 'Guest'}`)
      .newline()
      .text(`Cup  : ${orderData.itemIndex} of ${orderData.totalItems}`)
      .newline()
      .text(line)
      .newline()
      .bold(true)
      .size(1, 2) // Double height for menu name
      .text(orderData.menuName)
      .newline()
      .size(1, 1)
      .bold(false);

    if (orderData.modifiers && Object.keys(orderData.modifiers).length > 0) {
      encoder.newline();
      Object.entries(orderData.modifiers).forEach(([group, opts]: [string, any]) => {
        encoder.text(`* ${group}: ${opts.map((o: any) => o.name).join(', ')}`).newline();
      });
    }

    if (orderData.notes) {
      encoder.newline().text(`Note: ${orderData.notes}`).newline();
    }

    encoder
      .newline()
      .newline()
      .newline()
      .cut();

    const data = encoder.encode();
    await this.writer.write(data);
  }

  async disconnect() {
    if (this.writer) {
      await this.writer.releaseLock();
      this.writer = null;
    }
    if (this.device) {
      await this.device.close();
      this.device = null;
    }
  }
}

export const printerService = new ThermalPrinter();
