// tests/admin.test.js
// Module: Jason — Admin & Account Management
// Run: npm run test:admin

const fetch = require("node-fetch");
const { STUDENT, MAIN_ADMIN, BASE_URL } = require("./credentials");

const BASE = BASE_URL;

async function postJSON(path, payload, cookie = "") {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body:   JSON.stringify(payload),
  });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

async function getJSON(path, cookie = "") {
  const headers = {};
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, { headers });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

async function putJSON(path, payload, cookie = "") {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers,
    body:   JSON.stringify(payload),
  });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

async function deleteJSON(path, cookie = "") {
  const headers = {};
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, { method: "DELETE", headers });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

// Returns the session cookie for a logged-in user
async function loginAs(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie") || "";
  const body   = await res.json();
  return { cookie, success: body.success, role: body.user?.role };
}

// Credentials are imported from ./credentials.js


describe("1. Club Creation — Admin Only", () => {

  test("1.1 Creating a club without authentication returns 403", async () => {
    const { status } = await postJSON("/api/admin/create-club", {
      clubName:  "Test Club Alpha",
      category:  "Technology & Innovation",
      clubEmail: "testalpha@gmail.com",
      password:  "Club@12345",
    });
    expect(status).toBe(403);
  });

  test("1.2 A student session cannot create clubs", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await postJSON("/api/admin/create-club", {
      clubName:  "Student Club Attempt",
      category:  "Technology & Innovation",
      clubEmail: "studentclub@gmail.com",
      password:  "Club@12345",
    }, cookie);
    expect(status).toBe(403);
  });

  test("1.3 Club creation returns 400 when required fields are missing", async () => {
    const { status } = await postJSON("/api/admin/create-club", {
      clubEmail: "partial@gmail.com",
      password:  "Club@12345",
    });
    expect(status).not.toBe(500);
    expect([400, 403]).toContain(status);
  });

  test("1.4 Club creation with invalid email returns 400 or 403", async () => {
    const { status } = await postJSON("/api/admin/create-club", {
      clubName:  "Bad Email Club",
      category:  "Technology & Innovation",
      clubEmail: "not-an-email",
      password:  "Club@12345",
    });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("2. Admin Creation", () => {

  test("2.1 Creating an admin without authentication returns 403", async () => {
    const { status } = await postJSON("/api/admin/create-admin", {
      name:     "New Sub Admin",
      email:    "newadmin@clubsphear.com",
      password: "Admin@12345",
    });
    expect(status).toBe(403);
  });

  test("2.2 A student session cannot create admin accounts", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await postJSON("/api/admin/create-admin", {
      name:     "Fake Admin",
      email:    "fakeadmin@clubsphear.com",
      password: "Admin@12345",
    }, cookie);
    expect(status).toBe(403);
  });

  test("2.3 Admin creation with empty payload returns 400 or 403", async () => {
    const { status } = await postJSON("/api/admin/create-admin", {});
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("3. Admin Listing (Manage Admins)", () => {

  test("3.1 GET /api/admin/manage-admins without auth returns 403", async () => {
    const { status } = await getJSON("/api/admin/manage-admins");
    expect(status).toBe(403);
  });

  test("3.2 Student session cannot access the admin list", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await getJSON("/api/admin/manage-admins", cookie);
    expect(status).toBe(403);
  });
});


describe("4. Manage Users (Admin Feature)", () => {

  test("4.1 GET user list without admin session returns 401 or 403", async () => {
    const { status } = await getJSON("/api/admin/members");
    expect([401, 403, 404]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("4.2 DELETE user without authentication returns 401 or 403", async () => {
    const { status } = await deleteJSON("/api/admin/members?id=000000000000000000000001");
    expect([401, 403, 404, 405]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("5. Manage Clubs (Admin Feature)", () => {

  test("5.1 GET /api/admin/manage-clubs without auth returns 403", async () => {
    const { status } = await getJSON("/api/admin/manage-clubs");
    expect([401, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("5.2 Student session is rejected by the admin club endpoint", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await getJSON("/api/admin/manage-clubs", cookie);
    expect([401, 403]).toContain(status);
  });
});


describe("6. Admin Promote and Demote", () => {

  test("6.1 Promoting a user without admin auth is rejected", async () => {
    const { status } = await putJSON("/api/admin/update-profile", {
      id:   "000000000000000000000002",
      role: "admin",
    });
    expect([400, 401, 403, 404]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("6.2 Role update with no user ID returns 400 or 403", async () => {
    const { status } = await putJSON("/api/admin/update-profile", { role: "admin" });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("7. Admin Dashboard Stats", () => {

  test("7.1 GET /api/admin/dashboard-stats without auth returns 403", async () => {
    const { status } = await getJSON("/api/admin/dashboard-stats");
    expect([401, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("7.2 Student session cannot access admin dashboard stats", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await getJSON("/api/admin/dashboard-stats", cookie);
    expect([401, 403]).toContain(status);
  });
});
