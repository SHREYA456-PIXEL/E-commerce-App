import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

//key value store [key: foo, value: bar]

//await redis.set("foo", "bar");
