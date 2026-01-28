"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetDataError = void 0;
class WidgetDataError extends Error {
    constructor(message = 'Failed to retrieve widget data') {
        super(message);
        this.name = 'WidgetDataError';
    }
}
exports.WidgetDataError = WidgetDataError;
//# sourceMappingURL=WidgetDataError.js.map