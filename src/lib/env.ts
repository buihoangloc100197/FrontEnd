export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "My Next.js App",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  appDomain: process.env.APP_DOMAIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiKey: process.env.API_KEY ?? "demo-api-key",
  databaseUrl: process.env.DATABASE_URL ?? "data/app.db",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
};
