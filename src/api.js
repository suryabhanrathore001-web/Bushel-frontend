const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("bushel_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  listBuyers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/buyers${qs ? `?${qs}` : ""}`);
  },
  getBuyer: (id) => request(`/buyers/${id}`),
  createBuyer: (payload) => request("/buyers", { method: "POST", body: payload, auth: true }),
  updateBuyer: (id, payload) => request(`/buyers/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteBuyer: (id) => request(`/buyers/${id}`, { method: "DELETE", auth: true }),

  listReviews: (buyerId) => request(`/buyers/${buyerId}/reviews`),
  addReview: (buyerId, payload) =>
    request(`/buyers/${buyerId}/reviews`, { method: "POST", body: payload, auth: true }),

  setToken: (token) => localStorage.setItem("bushel_token", token),
  clearToken: () => localStorage.removeItem("bushel_token"),
  getToken,
};
