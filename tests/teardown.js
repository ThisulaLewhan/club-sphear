// tests/teardown.js
// Runs once after all tests. Kills the dev server if we spawned it.

const path = require("path");
const fs   = require("fs");

const PID_FILE = path.join(__dirname, ".server.pid");

module.exports = async function globalTeardown() {
  if (!fs.existsSync(PID_FILE)) return;

  const pidContent = fs.readFileSync(PID_FILE, "utf-8").trim();
  fs.unlinkSync(PID_FILE);

  // Server was already running externally — leave it alone
  if (pidContent === "EXTERNAL") {
    console.log("\n[Teardown] Dev server was external — leaving it running.");
    return;
  }

  const pid = parseInt(pidContent, 10);
  if (!pid || isNaN(pid)) return;

  try {
    if (process.platform === "win32") {
      const { execSync } = require("child_process");
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
    }
    console.log(`\n[Teardown] Stopped dev server (PID ${pid})`);
  } catch {
    console.log(`\n[Teardown] Dev server (PID ${pid}) already stopped.`);
  }
};
