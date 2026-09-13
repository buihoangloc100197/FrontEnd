declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    APP_DOMAIN?: string;
    API_KEY?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
  }
}

export {};
