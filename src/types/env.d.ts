declare namespace NodeJS {
    interface ProcessEnv {
        BOT_TOKEN: string;
        IS_DEV?: string;
        API_URL?: string;
    }
}
