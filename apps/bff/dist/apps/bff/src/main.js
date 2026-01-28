"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/bff');
    app.enableCors({
        origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });
    const port = process.env.BFF_PORT || 3001;
    const host = process.env.BFF_HOST || process.env.HOST || '127.0.0.1';
    await app.listen(port, host);
    console.log(`BFF is running on: http://${host}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map