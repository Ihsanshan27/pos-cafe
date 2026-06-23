"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
function sanitizeUser(user) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
}
//# sourceMappingURL=user-response.util.js.map