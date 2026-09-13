import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getStoredSessionToken } from "@/lib/session";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredSessionToken();
    const isAuthenticated = Boolean(token && token.trim());
    const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth/login");
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}
