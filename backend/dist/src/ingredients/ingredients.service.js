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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IngredientsService = class IngredientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createIngredientDto) {
        return this.prisma.ingredient.create({
            data: createIngredientDto,
        });
    }
    findAll() {
        return this.prisma.ingredient.findMany();
    }
    findOne(id) {
        return this.prisma.ingredient.findUnique({
            where: { id },
        });
    }
    update(id, updateIngredientDto) {
        return this.prisma.ingredient.update({
            where: { id },
            data: updateIngredientDto,
        });
    }
    remove(id) {
        return this.prisma.ingredient.delete({
            where: { id },
        });
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map