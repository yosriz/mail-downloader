import { RedisClient } from "redis";
import { promisify } from "util";

export type RedisAsyncFunctions = {
    get(key: string): Promise<string>;
    mget(...key: string[]): Promise<string[]>;
    set(key: string, value: string): Promise<"OK">;
    setex(key: string, seconds: number, value: string): Promise<"OK">;
    del(key: string): Promise<number>;
    incrby(key: string, incValue: number): Promise<number>;
};

export type RedisAsyncClient = RedisClient & {
    async: RedisAsyncFunctions;
};

export function createRedisClient(redisConnection: string): RedisAsyncClient {
    const client = require("redis").createClient(redisConnection);
    ["get", "mget", "set", "setex", "del", "incrby"].forEach(name => {
        (client as any)[name] = promisify((client as any)[name]).bind(client);
    });
    return client;
}