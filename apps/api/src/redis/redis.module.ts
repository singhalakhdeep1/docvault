import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS_TOKEN = "REDIS_CLIENT";

@Global()
@Module({
    providers: [
        {
            provide: REDIS_TOKEN,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const client = new Redis(config.get("app.redisUrl") as string);
                client.on("error", (err) => console.error("[Redis]", err));
                return client;
            },
        },
    ],
    exports: [REDIS_TOKEN],
})
export class RedisModule { }
