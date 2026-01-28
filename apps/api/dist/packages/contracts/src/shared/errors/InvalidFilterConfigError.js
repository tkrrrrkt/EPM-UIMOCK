"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFilterConfigError = void 0;
class InvalidFilterConfigError extends Error {
    constructor(message = 'Invalid filter configuration') {
        super(message);
        this.name = 'InvalidFilterConfigError';
    }
}
exports.InvalidFilterConfigError = InvalidFilterConfigError;
//# sourceMappingURL=InvalidFilterConfigError.js.map