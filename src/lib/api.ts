import axios from "axios";
import { appConfig } from "@/lib/env";

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
