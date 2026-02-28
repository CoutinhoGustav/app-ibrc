import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json, urlencoded } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    app.setGlobalPrefix('api');

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization, x-auth-token',
    });

    app.use((req, res, next) => {
        const fs = require('fs');
        const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
        fs.appendFileSync('requests.log', logLine);

        if (req.url === '/' && req.method === 'GET') {
            return res.send({ status: 'ok', message: 'Backend is running' });
        }
        console.log(logLine);
        next();
    });

    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
    console.log(`Application is running on port: ${process.env.PORT ?? 3000}`);
}
bootstrap();
