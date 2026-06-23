"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageDir = void 0;
exports.saveOptimizedImage = saveOptimizedImage;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const sharp_1 = __importDefault(require("sharp"));
exports.imageDir = (0, path_1.join)(process.cwd(), 'img');
if (!(0, fs_1.existsSync)(exports.imageDir)) {
    (0, fs_1.mkdirSync)(exports.imageDir, { recursive: true });
}
async function saveOptimizedImage({ buffer, prefix, maxWidth = 1200, maxHeight = 1200, quality = 80, }) {
    if (!buffer || buffer.length === 0) {
        throw new common_1.BadRequestException('Image buffer is empty');
    }
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = (0, path_1.join)(exports.imageDir, filename);
    const optimized = await (0, sharp_1.default)(buffer)
        .rotate()
        .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
    })
        .webp({
        quality,
        effort: 4,
    })
        .toBuffer();
    await (0, promises_1.writeFile)(outputPath, optimized);
    return {
        filename,
        imageUrl: `/img/${filename}`,
    };
}
//# sourceMappingURL=image-upload.util.js.map