import { BACKEND_URL } from "./config.js";

async function request(path, options = {}, token = null) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Tambahkan token Otorisasi jika ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: headers,
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    // Jika 401 (Unauthorized), berikan pesan yang lebih jelas
    if (response.status === 401) {
      throw new Error("Unauthorized: Please login again.");
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const Api = {
  // Rute publik (tanpa token)
  getSensorReadings(page = 1) {
    return request(`/api/readings?page=${page}`);
  },

  // Rute terproteksi (perlu token)
  getThresholds(token) {
    return request("/api/thresholds", {}, token);
  },
  createThreshold(payload, token) {
    return request(
      "/api/thresholds",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    );
  },
};
