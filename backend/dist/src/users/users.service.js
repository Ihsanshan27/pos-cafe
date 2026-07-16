"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const user_response_util_1 = require("../common/user-response.util");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(actor, createUserDto) {
        this.assertRoleAssignment(actor, createUserDto.role);
        const existingUser = await this.prisma.user.findUnique({ where: { email: createUserDto.email } });
        if (existingUser)
            throw new common_1.BadRequestException('Email already in use');
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            include: {
                outlet: true,
            },
        });
        return (0, user_response_util_1.sanitizeUser)(user);
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            include: { outlet: true },
            orderBy: { createdAt: 'desc' },
        });
        return users.map((user) => (0, user_response_util_1.sanitizeUser)(user));
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({ where: { id }, include: { outlet: true } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        return (0, user_response_util_1.sanitizeUser)(user);
    }
    async update(actor, id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { id } });
        if (!existingUser)
            throw new common_1.BadRequestException('User not found');
        this.assertUserMutationAccess(actor, existingUser.role);
        this.assertRoleAssignment(actor, updateUserDto.role, existingUser.role);
        let dataToUpdate = { ...updateUserDto };
        if (updateUserDto.password) {
            dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const user = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: { outlet: true },
        });
        return (0, user_response_util_1.sanitizeUser)(user);
    }
    async remove(actor, id) {
        const existingUser = await this.prisma.user.findUnique({ where: { id } });
        if (!existingUser)
            throw new common_1.BadRequestException('User not found');
        this.assertUserMutationAccess(actor, existingUser.role);
        const user = await this.prisma.user.delete({ where: { id }, include: { outlet: true } });
        return (0, user_response_util_1.sanitizeUser)(user);
    }
    assertRoleAssignment(actor, nextRole, currentRole) {
        if (actor.role === client_1.Role.OWNER) {
            return;
        }
        if (!nextRole) {
            return;
        }
        if (nextRole === client_1.Role.OWNER || nextRole === client_1.Role.MANAGER) {
            throw new common_1.BadRequestException('Manager cannot assign owner or manager role');
        }
        if (currentRole === client_1.Role.OWNER || currentRole === client_1.Role.MANAGER) {
            throw new common_1.BadRequestException('Manager cannot modify privileged users');
        }
    }
    assertUserMutationAccess(actor, targetRole) {
        if (actor.role === client_1.Role.OWNER) {
            return;
        }
        if (targetRole === client_1.Role.OWNER || targetRole === client_1.Role.MANAGER) {
            throw new common_1.BadRequestException('Manager cannot modify privileged users');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map