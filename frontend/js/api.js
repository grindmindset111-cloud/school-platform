const BASE_URL = "https://school-platform-bnpo.onrender.com";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export const api = {
  get(path, options = {}) {
    return request(path, { ...options, method: "GET" });
  },
  post(path, body, options = {}) {
    return request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body)
    });
  }
};
