"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const ingredients_module_1 = require("./ingredients/ingredients.module");
const menus_module_1 = require("./menus/menus.module");
const transactions_module_1 = require("./transactions/transactions.module");
const auth_module_1 = require("./auth/auth.module");
const expenses_module_1 = require("./expenses/expenses.module");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const discounts_module_1 = require("./discounts/discounts.module");
const shifts_module_1 = require("./shifts/shifts.module");
const settings_module_1 = require("./settings/settings.module");
const customers_module_1 = require("./customers/customers.module");
const inventory_logs_module_1 = require("./inventory-logs/inventory-logs.module");
const outlets_module_1 = require("./outlets/outlets.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const public_order_module_1 = require("./public-order/public-order.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, ingredients_module_1.IngredientsModule, menus_module_1.MenusModule, transactions_module_1.TransactionsModule, expenses_module_1.ExpensesModule, users_module_1.UsersModule, categories_module_1.CategoriesModule, discounts_module_1.DiscountsModule, shifts_module_1.ShiftsModule, settings_module_1.SettingsModule, customers_module_1.CustomersModule, inventory_logs_module_1.InventoryLogsModule, outlets_module_1.OutletsModule, suppliers_module_1.SuppliersModule, purchase_orders_module_1.PurchaseOrdersModule, public_order_module_1.PublicOrderModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map