import { auth } from "../config/firebase";

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export const apiCall = async (path: string, options: RequestInit = {}): Promise<any> => {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let errorMsg = "Request failed";
    try {
      const errorData = await res.json();
      errorMsg = errorData.error ?? errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
};
