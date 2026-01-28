"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.BFF_ORIGIN || 'http://localhost:3001',
        credentials: true,
    });
    const port = process.env.API_PORT || 3002;
    const host = process.env.API_HOST || process.env.HOST || '127.0.0.1';
    await app.listen(port, host);
    console.log(`Domain API is running on: http://${host}:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map