"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInventoryLogDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_inventory_log_dto_1 = require("./create-inventory-log.dto");
class UpdateInventoryLogDto extends (0, mapped_types_1.PartialType)(create_inventory_log_dto_1.CreateInventoryLogDto) {
}
exports.UpdateInventoryLogDto = UpdateInventoryLogDto;
//# sourceMappingURL=update-inventory-log.dto.js.map