"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOrderModule = void 0;
const common_1 = require("@nestjs/common");
const public_order_controller_1 = require("./public-order.controller");
const public_order_service_1 = require("./public-order.service");
const outlets_module_1 = require("../outlets/outlets.module");
const transactions_module_1 = require("../transactions/transactions.module");
const simple_rate_limit_guard_1 = require("../common/simple-rate-limit.guard");
let PublicOrderModule = class PublicOrderModule {
};
exports.PublicOrderModule = PublicOrderModule;
exports.PublicOrderModule = PublicOrderModule = __decorate([
    (0, common_1.Module)({
        imports: [outlets_module_1.OutletsModule, transactions_module_1.TransactionsModule],
        controllers: [public_order_controller_1.PublicOrderController],
        providers: [public_order_service_1.PublicOrderService, simple_rate_limit_guard_1.PublicOrderRateLimitGuard],
    })
], PublicOrderModule);
//# sourceMappingURL=public-order.module.js.map