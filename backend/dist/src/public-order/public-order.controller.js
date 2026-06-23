"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicOrderController = void 0;
const common_1 = require("@nestjs/common");
const public_order_service_1 = require("./public-order.service");
const create_public_order_dto_1 = require("./dto/create-public-order.dto");
const simple_rate_limit_guard_1 = require("../common/simple-rate-limit.guard");
let PublicOrderController = class PublicOrderController {
    publicOrderService;
    constructor(publicOrderService) {
        this.publicOrderService = publicOrderService;
    }
    getMenu(outletSlug, tableCode) {
        return this.publicOrderService.getMenu(outletSlug, tableCode);
    }
    createOrder(outletSlug, tableCode, body) {
        return this.publicOrderService.createOrder(outletSlug, tableCode, body);
    }
};
exports.PublicOrderController = PublicOrderController;
__decorate([
    (0, common_1.Get)(':outletSlug/:tableCode'),
    __param(0, (0, common_1.Param)('outletSlug')),
    __param(1, (0, common_1.Param)('tableCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicOrderController.prototype, "getMenu", null);
__decorate([
    (0, common_1.UseGuards)(simple_rate_limit_guard_1.PublicOrderRateLimitGuard),
    (0, common_1.Post)(':outletSlug/:tableCode'),
    __param(0, (0, common_1.Param)('outletSlug')),
    __param(1, (0, common_1.Param)('tableCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_public_order_dto_1.CreatePublicOrderDto]),
    __metadata("design:returntype", void 0)
], PublicOrderController.prototype, "createOrder", null);
exports.PublicOrderController = PublicOrderController = __decorate([
    (0, common_1.Controller)('public/order'),
    __metadata("design:paramtypes", [public_order_service_1.PublicOrderService])
], PublicOrderController);
//# sourceMappingURL=public-order.controller.js.map