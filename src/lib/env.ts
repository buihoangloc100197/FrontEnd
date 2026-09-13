export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "My Next.js App",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
  appDomain: process.env.APP_DOMAIN || process.env.NEXT_PUBLIC_SITE_URL || "",
  apiKey: process.env.API_KEY ?? "demo-api-key",
  databaseUrl: process.env.DATABASE_URL ?? "supabase",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
};
