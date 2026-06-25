import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "..");
const source = join(root, "src", "assets", "app-icon.png");
const composeScript = join(repoRoot, "scripts", "compose_app_icon.py");
const python = join(repoRoot, ".venv", "Scripts", "python.exe");

if (!existsSync(source)) {
  console.error(`Missing app icon source: ${source}`);
  process.exit(1);
}

try {
  execFileSync(python, [composeScript], { stdio: "inherit" });
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "EBUSY") {
    console.warn(
      "Could not sync public/app-icon.png (file locked). Restart the dev server to refresh the favicon.",
    );
    process.exit(0);
  }
  throw error;
}
