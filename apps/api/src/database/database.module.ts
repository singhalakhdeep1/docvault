import { Module, Global } from "@nestjs/common";
import { PrismaClient } from "@docsvault/database";

export const PRISMA_TOKEN = "PRISMA_CLIENT";

@Global()
@Module({
    providers: [
        {
            provide: PRISMA_TOKEN,
            useFactory: () => {
                const client = new PrismaClient({
                    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
                });
                client.$connect();
                return client;
            },
        },
    ],
    exports: [PRISMA_TOKEN],
})
export class DatabaseModule { }
