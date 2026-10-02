/**
 * Automated Security Check Script (CI / Pre-Deploy)
 * Verifies that no sensitive files, credentials, or dangerous patterns are committed.
 */

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

console.log("🔍 Iniciando Verificação Automatizada de Segurança (AppSec)...");

let hasErrors = false;

// 1. Check that sensitive data file is NOT present or is empty
const portalDataPath = path.join(projectRoot, "src", "data", "portal-data.json");
if (fs.existsSync(portalDataPath)) {
  try {
    const raw = fs.readFileSync(portalDataPath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.clients && parsed.clients.length > 0) {
      console.error("❌ FALHA DE SEGURANÇA: portal-data.json contém clientes com dados reais/mock!");
      hasErrors = true;
    } else {
      console.log("✅ portal-data.json está limpo e sem PII.");
    }
  } catch (e) {
    console.warn("⚠️ Não foi possível ler portal-data.json.");
  }
} else {
  console.log("✅ portal-data.json não está presente ou está ignorado.");
}

// 2. Check .gitignore contains vital entries
const gitignorePath = path.join(projectRoot, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  if (!gitignoreContent.includes("portal-data.json") || !gitignoreContent.includes(".env")) {
    console.error("❌ FALHA: .gitignore deve conter portal-data.json e .env*");
    hasErrors = true;
  } else {
    console.log("✅ .gitignore configurado corretamente com proteção de arquivos sensíveis.");
  }
}

// 3. Check for hardcoded service_role keys or secrets
const forbiddenPatterns = [
  /service_role_secret/i,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/i, // JWT pattern
];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".json")) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content) && !fullPath.includes("security-check.mjs")) {
          console.error(`❌ FALHA: Segredo suspeito encontrado em ${fullPath}`);
          hasErrors = true;
        }
      }
    }
  }
}

scanDir(path.join(projectRoot, "src"));

if (hasErrors) {
  console.error("\n❌ Verificação de segurança encontrou problemas que precisam de atenção.");
  process.exit(1);
} else {
  console.log("\n🛡️ Todas as verificações de segurança passaram com sucesso!");
  process.exit(0);
}
