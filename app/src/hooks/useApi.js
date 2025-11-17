import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { Api } from "../services/api";

export function useApi() {
  const { session } = useAuth();
  const token = session?.access_token;

  return useMemo(
    () => ({
      // Fungsi publik
      getSensorReadings: (page = 1) => Api.getSensorReadings(page),

      // Fungsi terproteksi
      getThresholds: () => {
        if (!token) return Promise.reject(new Error("You must be logged in."));
        return Api.getThresholds(token);
      },
      createThreshold: (payload) => {
        if (!token) return Promise.reject(new Error("You must be logged in."));
        return Api.createThreshold(payload, token);
      },
    }),
    [token]
  );
}
