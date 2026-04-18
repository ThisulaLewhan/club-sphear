// tests/setup.js
// Runs once before all tests.
// Loads .env.local and starts the Next.js server if it's not already running.

const path      = require("path");
const fs        = require("fs");
const http      = require("http");
const { spawn } = require("child_process");

const PROJECT_ROOT       = path.resolve(__dirname, "..");
const PID_FILE           = path.join(__dirname, ".server.pid");
const PORT               = 3000;
const STARTUP_TIMEOUT_MS = 90_000;

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(PROJECT_ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("[Setup] .env.local not found");
    return;
  }
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
  console.log("[Setup] Loaded .env.local");
}

// Check if something is already listening on port 3000
function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/auth/login`, { method: "HEAD" }, () => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

// Poll until the server responds or we time out
function waitForServer(port, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server did not start within ${timeoutMs / 1000}s`));
      }
      const req = http.get(`http://localhost:${port}/`, () => resolve());
      req.on("error", () => setTimeout(check, 1000));
      req.setTimeout(3000, () => { req.destroy(); setTimeout(check, 1000); });
    };
    check();
  });
}

module.exports = async function globalSetup() {
  loadEnv();
  process.env.TEST_BASE_URL = `http://localhost:${PORT}`;

  // Skip spawning if dev server is already running
  const alreadyRunning = await isPortOpen(PORT);
  if (alreadyRunning) {
    console.log(`[Setup] Server already running on port ${PORT} — skipping spawn`);
    fs.writeFileSync(PID_FILE, "EXTERNAL");
    return;
  }

  console.log("[Setup] Starting Next.js dev server...");

  const isWindows = process.platform === "win32";
  const cmd       = isWindows ? "npx.cmd" : "npx";

  const server = spawn(cmd, ["next", "dev", "--port", String(PORT)], {
    cwd:      PROJECT_ROOT,
    stdio:    ["ignore", "pipe", "pipe"],
    env:      { ...process.env },
    detached: false,
  });

  server.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("Ready") || msg.includes("started") || msg.includes("compiled")) {
      process.stdout.write(`   [next] ${msg}\n`);
    }
  });
  server.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes("DeprecationWarning")) {
      process.stdout.write(`   [next:err] ${msg}\n`);
    }
  });

  // Save PID so teardown can kill it
  fs.writeFileSync(PID_FILE, String(server.pid));

  console.log(`[Setup] Waiting for server on port ${PORT}...`);
  try {
    await waitForServer(PORT, STARTUP_TIMEOUT_MS);
    console.log(`[Setup] Server ready at http://localhost:${PORT}\n`);
  } catch (err) {
    server.kill();
    throw new Error(`[Setup] ${err.message}`);
  }
};
