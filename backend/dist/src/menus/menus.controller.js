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
exports.MenusController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const menus_service_1 = require("./menus.service");
const create_menu_dto_1 = require("./dto/create-menu.dto");
const update_menu_dto_1 = require("./dto/update-menu.dto");
const outlet_menu_dto_1 = require("./dto/outlet-menu.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const image_upload_util_1 = require("../common/image-upload.util");
let MenusController = class MenusController {
    menusService;
    constructor(menusService) {
        this.menusService = menusService;
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        return (0, image_upload_util_1.saveOptimizedImage)({
            buffer: file.buffer,
            prefix: 'menu',
            maxWidth: 1400,
            maxHeight: 1400,
            quality: 80,
        });
    }
    create(createMenuDto) {
        return this.menusService.create(createMenuDto);
    }
    findAll(outletId) {
        return this.menusService.findAll(outletId);
    }
    findOne(id, outletId) {
        return this.menusService.findOne(id, outletId);
    }
    update(req, id, updateMenuDto) {
        return this.menusService.update(id, updateMenuDto, req.user, req.ip);
    }
    upsertOutletOverride(req, id, updateOutletMenuDto) {
        return this.menusService.upsertOutletOverride(id, updateOutletMenuDto, req.user, req.ip);
    }
    deleteOutletOverride(req, id, outletId) {
        return this.menusService.deleteOutletOverride(id, outletId, req.user, req.ip);
    }
    remove(req, id) {
        return this.menusService.remove(id, req.user, req.ip);
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "uploadImage", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_menu_dto_1.UpdateMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Patch)(':id/outlet-override'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, outlet_menu_dto_1.UpdateOutletMenuDto]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "upsertOutletOverride", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Delete)(':id/outlet-override/:outletId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('outletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "deleteOutletOverride", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.OWNER, client_1.Role.MANAGER),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MenusController.prototype, "remove", null);
exports.MenusController = MenusController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map