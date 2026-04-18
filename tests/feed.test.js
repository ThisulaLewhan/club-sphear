// tests/feed.test.js
// Module: Lokesha — Feed & Club Interaction
// Run: npm run test:feed

const fetch = require("node-fetch");
const { STUDENT, BASE_URL } = require("./credentials");

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

async function deleteReq(path, cookie = "") {
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
  const data   = await res.json();
  return { cookie, success: data.success, userId: data.user?.id };
}


describe("1. Posts — Read (Public)", () => {

  test("1.1 GET /api/posts returns 200 with an array of posts", async () => {
    const { status, body } = await getJSON("/api/posts");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("1.2 Each post has content and clubName fields", async () => {
    const { status, body } = await getJSON("/api/posts");
    expect(status).toBe(200);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty("content");
      expect(body[0]).toHaveProperty("clubName");
    }
  });
});


describe("2. Posts — Create (Club Only)", () => {

  test("2.1 Creating a post without authentication returns 403", async () => {
    const { status, body } = await postJSON("/api/posts", { content: "Test post." });
    expect(status).toBe(403);
    expect(body.error).toMatch(/unauthorized/i);
  });

  test("2.2 A student session cannot create posts", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await postJSON("/api/posts", { content: "Student posting." }, cookie);
    expect(status).toBe(403);
  });

  test("2.3 POST with empty content returns 400 or 403", async () => {
    const { status } = await postJSON("/api/posts", { content: "" });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("3. Posts — Delete (Club Only)", () => {

  test("3.1 Deleting a post without auth returns 401 or 403", async () => {
    const { status } = await deleteReq("/api/posts/000000000000000000000001");
    expect([401, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("3.2 Student session cannot delete posts", async () => {
    const { cookie } = await loginAs(STUDENT.email, STUDENT.password);
    const { status } = await deleteReq("/api/posts/000000000000000000000001", cookie);
    expect([403, 404]).toContain(status);
  });
});


describe("4. Notices — Read (Public)", () => {

  test("4.1 GET /api/notices returns 200 with a list of notices", async () => {
    const { status, body } = await getJSON("/api/notices");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("4.2 Each notice has title, content, and club fields", async () => {
    const { body } = await getJSON("/api/notices");
    if (body.length > 0) {
      expect(body[0]).toHaveProperty("title");
      expect(body[0]).toHaveProperty("content");
      expect(body[0]).toHaveProperty("club");
    }
  });
});


describe("5. Notices — Create (Club Only)", () => {

  const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();

  test("5.1 Creating a notice without authentication returns 403", async () => {
    const { status, body } = await postJSON("/api/notices", {
      title:     "Test Notice",
      content:   "This is a test notice for automated testing.",
      priority:  "normal",
      expiresAt: futureDate,
    });
    expect(status).toBe(403);
    expect(body.error).toMatch(/unauthorized/i);
  });

  test("5.2 Notice with missing title returns 400 or 403", async () => {
    const { status } = await postJSON("/api/notices", {
      content:   "Content without title.",
      expiresAt: futureDate,
    });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("5.3 Notice without expiry date returns 400 or 403", async () => {
    const { status } = await postJSON("/api/notices", {
      title:   "Notice Without Expiry",
      content: "This notice has no expiry date.",
    });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("5.4 Notice with past expiry date is rejected", async () => {
    const { status } = await postJSON("/api/notices", {
      title:     "Expired Notice",
      content:   "This notice already expired.",
      expiresAt: "2020-01-01T00:00:00.000Z",
    });
    expect([400, 403]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("6. Notification System", () => {

  test("6.1 GET /api/notifications without session returns 401 or 403", async () => {
    const { status } = await getJSON("/api/notifications");
    expect([401, 403]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("6.2 Authenticated student can access their notifications", async () => {
    const { cookie, success } = await loginAs(STUDENT.email, STUDENT.password);
    if (!success) {
      console.warn("Student login failed — skipping notification read test");
      return;
    }
    const { status } = await getJSON("/api/notifications", cookie);
    expect([200, 204]).toContain(status);
    expect(status).not.toBe(500);
  });
});


describe("7. Profile Update", () => {

  test("7.1 Updating profile without authentication returns 401 or 403", async () => {
    const res = await fetch(`${BASE}/api/auth/me`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: "New Name" }),
    });
    expect([401, 403]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  test("7.2 GET /api/auth/me without session returns 401", async () => {
    const { status } = await getJSON("/api/auth/me");
    expect([401, 403]).toContain(status);
  });

  test("7.3 Authenticated student can fetch their own profile", async () => {
    const { cookie, success } = await loginAs(STUDENT.email, STUDENT.password);
    if (!success) {
      console.warn("Student login failed — skipping profile read test");
      return;
    }
    const { status, body } = await getJSON("/api/auth/me", cookie);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(STUDENT.email);
  });
});


describe("8. Join Club — Application Submission", () => {

  const FAKE_CLUB_ID = "000000000000000000000099";

  test("8.1 Submitting an application without auth returns 401", async () => {
    const { status, body } = await postJSON("/api/applications", {
      clubId:      FAKE_CLUB_ID,
      clubName:    "Test Club",
      studentName: "Test Student",
      reason:      "I want to join this club to learn new skills.",
    });
    expect(status).toBe(401);
    expect(body.error).toBeDefined();
  });

  test("8.2 GET /api/applications returns the list", async () => {
    const { status, body } = await getJSON("/api/applications");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("8.3 Application with empty body is rejected", async () => {
    const { status } = await postJSON("/api/applications", {});
    expect([400, 401]).toContain(status);
    expect(status).not.toBe(500);
  });

  test("8.4 GET /api/applications?clubId filters by club", async () => {
    const { status, body } = await getJSON(`/api/applications?clubId=${FAKE_CLUB_ID}`);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  test("8.5 Updating application status with no id returns 400", async () => {
    const res = await fetch(`${BASE}/api/applications`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "approved" }),
    });
    const body = await res.json().catch(() => ({}));
    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });
});
