import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
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

@Module({
  imports: [PrismaModule, AuthModule, IngredientsModule, MenusModule, TransactionsModule, ExpensesModule, UsersModule, CategoriesModule, DiscountsModule, ShiftsModule, SettingsModule, CustomersModule, InventoryLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
