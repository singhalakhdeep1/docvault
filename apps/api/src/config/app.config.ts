import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
    port: parseInt(process.env.PORT ?? "4000", 10),
    jwtSecret: process.env.JWT_SECRET ?? "docsvault-dev-secret-please-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    databaseUrl: process.env.DATABASE_URL ?? "postgresql://docsvault:docsvault@localhost:5432/docsvault",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    meilisearchHost: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
    meilisearchApiKey: process.env.MEILISEARCH_API_KEY ?? "meili",
    minioEndpoint: process.env.MINIO_ENDPOINT ?? "localhost",
    minioPort: parseInt(process.env.MINIO_PORT ?? "9000", 10),
    minioAccessKey: process.env.MINIO_ACCESS_KEY ?? "minio",
    minioSecretKey: process.env.MINIO_SECRET_KEY ?? "minio",
    minioBucket: process.env.MINIO_BUCKET ?? "docsvault",
    minioPublicUrl: process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000",
}));
