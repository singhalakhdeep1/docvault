import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { VersioningType, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
        credentials: true,
    });

    app.enableVersioning({ type: VersioningType.URI });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle("DocsVault API")
        .setDescription("Notion-style realtime collaboration API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    const port = parseInt(process.env.PORT ?? "4000", 10);
    await app.listen(port, "0.0.0.0");
    console.log(`DocsVault API running on http://localhost:${port}`);
    console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
