// I used a relative path since frontend is served by the same backend
const BASE_URL = "/api";

export const apiGet = async (endpoint, token) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return await res.json();
};

export const apiPost = async (endpoint, data, token) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const apiPut = async (endpoint, data, token) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};
