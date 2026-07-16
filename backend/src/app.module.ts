import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuditInterceptor } from './common/audit.interceptor';
import { IngredientsModule } from './ingredients/ingredients.module';
import { MenusModule } from './menus/menus.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ShiftsModule } from './shifts/shifts.module';
import { SettingsModule } from './settings/settings.module';
import { CustomersModule } from './customers/customers.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';
import { OutletsModule } from './outlets/outlets.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { PublicOrderModule } from './public-order/public-order.module';
import { ModifiersModule } from './modifiers/modifiers.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, IngredientsModule, MenusModule, TransactionsModule, ExpensesModule, UsersModule, CategoriesModule, DiscountsModule, ShiftsModule, SettingsModule, CustomersModule, InventoryLogsModule, OutletsModule, SuppliersModule, PurchaseOrdersModule, PublicOrderModule, ModifiersModule, MailModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
