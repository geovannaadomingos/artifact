import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import ts from "../node_modules/typescript/lib/typescript.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.resolve(rootDir, "dist-test");

const filesToTranspile = [
  "src/server/errors/task.errors.ts",
  "src/server/schemas/task.schema.ts",
  "src/server/repositories/task.repository.ts",
  "src/server/services/task.service.ts",
  "src/server/trpc/init.ts",
  "src/server/trpc/routers/task.router.ts",
  "src/server/trpc/router.ts",
  "tests/task.test.ts",
];

for (const relPath of filesToTranspile) {
  const fullPath = path.resolve(rootDir, relPath);
  const source = fs.readFileSync(fullPath, "utf-8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });

  const destPath = path.resolve(outDir, relPath.replace(/\.ts$/, ".js"));
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, output.outputText, "utf-8");
}

console.log("Transpilation successful. Running test suite...");
try {
  execSync(`node --test "${path.resolve(outDir, "tests/task.test.js")}"`, {
    stdio: "inherit",
  });
} catch (err) {
  process.exit(err.status ?? 1);
}

