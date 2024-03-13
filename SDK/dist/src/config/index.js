"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const zod_1 = __importDefault(require("zod"));
const znv_1 = require("znv");
const createConfigFromEnvironment = (environment) => {
    const config = (0, znv_1.parseEnv)(environment, {
        NODE_ENV: zod_1.default.enum(["development", "production"]),
        LOG_LEVEL: zod_1.default
            .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
            .default("info"),
        GOERLI_RPC_URL: zod_1.default.string(),
        DKG_ADDRESS: zod_1.default.string(),
    });
    return {
        ...config,
        isDev: process.env.NODE_ENV === "development",
        isProd: process.env.NODE_ENV === "production",
    };
};
const config = createConfigFromEnvironment(process.env);
exports.default = config;
