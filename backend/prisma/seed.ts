import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old data (except users/settings)...');
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.category.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.tableQRCode.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.customer.deleteMany();

  console.log('Creating Categories...');
  const catCoffee = await prisma.category.create({ data: { name: 'Coffee' } });
  const catTea = await prisma.category.create({ data: { name: 'Tea' } });
  const catFood = await prisma.category.create({ data: { name: 'Food' } });

  console.log('Creating Ingredients...');
  const ingCoffeeBean = await prisma.ingredient.create({
    data: { name: 'Coffee Beans', unit: 'gram', costPerUnit: 200, stockQuantity: 5000 },
  });
  const ingMilk = await prisma.ingredient.create({
    data: { name: 'Fresh Milk', unit: 'ml', costPerUnit: 15, stockQuantity: 10000 },
  });
  const ingSugar = await prisma.ingredient.create({
    data: { name: 'Liquid Sugar', unit: 'ml', costPerUnit: 10, stockQuantity: 2000 },
  });
  const ingTeaLeaf = await prisma.ingredient.create({
    data: { name: 'Jasmine Tea', unit: 'gram', costPerUnit: 150, stockQuantity: 1000 },
  });

  console.log('Creating Menus...');
  await prisma.menu.create({
    data: {
      name: 'Iced Latte',
      sellingPrice: 25000,
      categoryId: catCoffee.id,
      ingredients: {
        create: [
          { ingredientId: ingCoffeeBean.id, quantity: 18 },
          { ingredientId: ingMilk.id, quantity: 150 },
          { ingredientId: ingSugar.id, quantity: 20 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      name: 'Americano',
      sellingPrice: 18000,
      categoryId: catCoffee.id,
      ingredients: {
        create: [
          { ingredientId: ingCoffeeBean.id, quantity: 18 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      name: 'Jasmine Iced Tea',
      sellingPrice: 15000,
      categoryId: catTea.id,
      ingredients: {
        create: [
          { ingredientId: ingTeaLeaf.id, quantity: 10 },
          { ingredientId: ingSugar.id, quantity: 30 },
        ],
      },
    },
  });

  console.log('Creating Customers...');
  await prisma.customer.createMany({
    data: [
      { name: 'Andi', phone: '081234567890', email: 'andi@example.com', pointBalance: 50 },
      { name: 'Budi', phone: '081298765432', email: 'budi@example.com', pointBalance: 120 },
      { name: 'Citra', phone: '081211112222', email: 'citra@example.com', pointBalance: 15 },
    ]
  });

  console.log('Creating Users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'owner@shn.com' },
    update: { password: passwordHash, role: 'OWNER', name: 'Owner SHN' },
    create: { name: 'Owner SHN', email: 'owner@shn.com', password: passwordHash, role: 'OWNER' },
  });

  await prisma.user.upsert({
    where: { email: 'manager@shn.com' },
    update: { password: passwordHash, role: 'MANAGER', name: 'Manager SHN' },
    create: { name: 'Manager SHN', email: 'manager@shn.com', password: passwordHash, role: 'MANAGER' },
  });

  await prisma.user.upsert({
    where: { email: 'cashier@shn.com' },
    update: { password: passwordHash, role: 'CASHIER', name: 'Cashier SHN' },
    create: { name: 'Cashier SHN', email: 'cashier@shn.com', password: passwordHash, role: 'CASHIER' },
  });

  await prisma.user.upsert({
    where: { email: 'barista@shn.com' },
    update: { password: passwordHash, role: 'BARISTA', name: 'Barista SHN' },
    create: { name: 'Barista SHN', email: 'barista@shn.com', password: passwordHash, role: 'BARISTA' },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
