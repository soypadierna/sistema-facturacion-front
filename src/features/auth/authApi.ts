import { apiFetch } from "../../shared/api/httpClient";
import type { LoginResponse, ApiUser } from "./types";

export function login(usuario: string, clave: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: { usuario, clave },
    auth: false,
  });
}

export function me() {
  return apiFetch<ApiUser>("/auth/me");
}