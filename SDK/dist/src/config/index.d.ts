/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import "dotenv/config";
declare const createConfigFromEnvironment: (environment: NodeJS.ProcessEnv) => {
    isDev: boolean;
    isProd: boolean;
    NODE_ENV: "development" | "production";
    LOG_LEVEL: "error" | "trace" | "debug" | "info" | "warn" | "fatal" | "silent";
    GOERLI_RPC_URL: string;
    DKG_ADDRESS: string;
};
export type Config = ReturnType<typeof createConfigFromEnvironment>;
declare const config: {
    isDev: boolean;
    isProd: boolean;
    NODE_ENV: "development" | "production";
    LOG_LEVEL: "error" | "trace" | "debug" | "info" | "warn" | "fatal" | "silent";
    GOERLI_RPC_URL: string;
    DKG_ADDRESS: string;
};
export default config;
//# sourceMappingURL=index.d.ts.map