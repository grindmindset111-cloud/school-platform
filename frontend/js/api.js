const MOCK_USERS = [
  { id: 1, name: "Amina Yusuf", role: "STUDENT", classLevel: "SS2" },
  { id: 2, name: "Tunde Adebayo", role: "STUDENT", classLevel: "JSS3" },
  { id: 3, name: "Grace Okafor", role: "ADMIN", classLevel: "-" }
];

const MOCK_ATTENDANCE = [
  { id: 1, student: "Amina Yusuf", status: "Present", date: "2026-04-27" },
  { id: 2, student: "Tunde Adebayo", status: "Absent", date: "2026-04-27" }
];

const USE_MOCK = true;
const BASE_URL = "https://school-platform-bnpo.onrender.com";

function getMockDashboardData() {
  return {
    user: { role: "admin", name: "Test User" },
    stats: { users: 120, attendance: 85 },
    data: [],
    tables: {
      users: MOCK_USERS,
      attendance: MOCK_ATTENDANCE
    }
  };
}

async function fetchRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export async function apiRequest(path = "/dashboard", options = {}) {
  if (USE_MOCK) {
    return getMockDashboardData();
  }
  return fetchRequest(path, options);
}

export const api = {
  async get(path = "/dashboard", options = {}) {
    const payload = await apiRequest(path, { ...options, method: "GET" });
    return {
      user: payload.user,
      data: {
        user: payload.user,
        stats: payload.stats,
        data: payload.data,
        tables: payload.tables
      }
    };
  },
  async post(path, body = {}) {
    if (!USE_MOCK) {
      return fetchRequest(path, {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    if (path?.includes("login")) {
      const isAdmin = String(body.email || "").toLowerCase().includes("admin");
      const role = isAdmin ? "ADMIN" : "STUDENT";
      return {
        token: "mock-token",
        user: { name: body.email || "Test User", role }
      };
    }

    if (path?.includes("register")) {
      return {
        message: "Registration successful",
        token: "mock-token",
        user: {
          name: body.name || "New User",
          role: (body.role || "STUDENT").toUpperCase()
        }
      };
    }

    return { message: "Mock request successful" };
  }
};
