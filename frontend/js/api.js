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
const LOGIN_PATH = "login.html";

function clearUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}

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

function parseBody(options = {}) {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch (error) {
    return {};
  }
}

function getMockResponse(path = "/dashboard", options = {}) {
  const body = parseBody(options);
  const normalizedPath = String(path || "").toLowerCase();

  if (normalizedPath.includes("/login")) {
    const isAdmin = String(body.email || "").toLowerCase().includes("admin");
    return {
      user: { name: body.email || "Test User", role: isAdmin ? "ADMIN" : "STUDENT" },
      token: "mock-token"
    };
  }

  if (normalizedPath.includes("/register")) {
    return {
      message: "Registration successful",
      user: {
        name: body.email || "New User",
        role: String(body.role || "STUDENT").toUpperCase()
      },
      token: "mock-token"
    };
  }

  if (normalizedPath.includes("/api/auth/me")) {
    return {
      user: { role: "ADMIN", name: "Test User" }
    };
  }

  return getMockDashboardData();
}

export async function apiRequest(path = "/dashboard", options = {}) {
  if (USE_MOCK) {
    return getMockResponse(path, options);
  }

  const res = await fetch(BASE_URL + path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearUser();
      window.location.href = LOGIN_PATH;
    }
    if (res.status === 403) {
      window.location.href = "dashboard.html";
    }

    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
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
    return apiRequest(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }
};
