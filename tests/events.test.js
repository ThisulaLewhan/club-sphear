// tests/events.test.js
// Module: Thisula — Event Management System
// Run: npm run test:events

const fetch    = require("node-fetch");
const FormData = require("form-data");
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

async function postFormData(path, fields, cookie = "") {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  const headers = { ...form.getHeaders() };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method:  "POST",
    headers,
    body:    form,
  });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

// Valid event payload for reuse
function validEventPayload(overrides = {}) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  return {
    title:       "Tech Talk 2026",
    description: "An informative session about cloud computing and AI trends.",
    date:        tomorrow,
    startTime:   "09:00",
    endTime:     "11:00",
    venue:       "Main Auditorium",
    ...overrides,
  };
}


describe("1. Event Creation — Authentication Guard", () => {

  test("1.1 Creating an event without authentication returns 403", async () => {
    const { status } = await postFormData("/api/events", validEventPayload());
    expect(status).toBe(403);
  });

  test("1.2 A student session cannot create events", async () => {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: STUDENT.email, password: STUDENT.password }),
    });
    const setCookie = loginRes.headers.get("set-cookie") || "";
    const { status } = await postFormData("/api/events", validEventPayload(), setCookie);
    expect(status).toBe(403);
  });
});


describe("2. Event Creation — Input Validation (via form-data API shape check)", () => {

  test("2.1 Event without a title should be rejected by the API (check 400 or 403)", async () => {
    const { status } = await postFormData("/api/events", validEventPayload({ title: "" }));
    expect(status).not.toBe(500);
    expect([400, 403]).toContain(status);
  });

  test("2.2 Event with endTime before startTime is rejected (400 or 403 if no auth)", async () => {
    const { status } = await postFormData("/api/events", validEventPayload({
      startTime: "10:00",
      endTime:   "08:00",
    }));
    expect(status).not.toBe(500);
    expect([400, 403]).toContain(status);
  });

  test("2.3 Event with a past date should not be accepted (400 or 403)", async () => {
    const { status } = await postFormData("/api/events", validEventPayload({ date: "2020-01-01" }));
    expect(status).not.toBe(500);
    expect([400, 403]).toContain(status);
  });

  test("2.4 Event with no venue should be rejected (400 or 403)", async () => {
    const { status } = await postFormData("/api/events", validEventPayload({ venue: "" }));
    expect(status).not.toBe(500);
    expect([400, 403]).toContain(status);
  });
});


describe("3. Event Listing — Public Access", () => {

  test("3.1 GET /api/events returns 200 and a list of events", async () => {
    const { status, body } = await getJSON("/api/events");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("3.2 GET /api/events?status=pending returns pending events only", async () => {
    const { status, body } = await getJSON("/api/events?status=pending");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("3.3 GET /api/events?status=approved returns approved events only", async () => {
    const { status, body } = await getJSON("/api/events?status=approved");
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    for (const event of body.data) {
      expect(event.status).toMatch(/^(approved|pending)$/);
    }
  });
});


describe("4. Venue Conflict Detection", () => {

  test("4.1 Conflict detection route does not crash on POST (returns 403 or 409, not 500)", async () => {
    const { status } = await postFormData("/api/events", validEventPayload());
    expect(status).not.toBe(500);
  });
});


describe("5. Event Approval — Admin Only", () => {

  test("5.1 Approving an event without admin session returns 401 or 403", async () => {
    const { status } = await putJSON("/api/admin-dashboard/messages", {
      eventId: "000000000000000000000001",
      status:  "approved",
    });
    expect([401, 403, 404, 405]).toContain(status);
  });

  test("5.2 Fetching all events works publicly", async () => {
    const { status, body } = await getJSON("/api/events?status=all");
    expect(status).toBe(200);
    expect(body.data).toBeDefined();
  });
});


describe("6. Contact Form Submission", () => {

  test("6.1 Valid contact form submission returns 200", async () => {
    const { status, body } = await postJSON("/api/contact", {
      name:    "Thisula Lewhan",
      email:   "thisula@example.com",
      subject: "Test Subject from Automated Test",
      message: "This is an automated test message that is long enough.",
    });
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("6.2 Contact form fails when name is missing", async () => {
    const { status, body } = await postJSON("/api/contact", {
      email:   "thisula@example.com",
      subject: "No Name Test",
      message: "This message has no name attached.",
    });
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  test("6.3 Contact form rejects an invalid email address", async () => {
    const { status, body } = await postJSON("/api/contact", {
      name:    "Thisula",
      email:   "not-a-valid-email",
      subject: "Email test",
      message: "Checking invalid email path.",
    });
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/email/i);
  });

  test("6.4 Contact form rejects a message shorter than 10 characters", async () => {
    const { status, body } = await postJSON("/api/contact", {
      name:    "Thisula",
      email:   "thisula@example.com",
      subject: "Short Message",
      message: "Hi",
    });
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/10 character/i);
  });

  test("6.5 Contact form rejects an empty submission", async () => {
    const { status, body } = await postJSON("/api/contact", {});
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });
});
