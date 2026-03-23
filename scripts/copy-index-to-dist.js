const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const srcPath = path.join(projectRoot, "public", "index.html");
const distDir = path.join(projectRoot, "dist");
const destPath = path.join(distDir, "index.html");

if (!fs.existsSync(srcPath)) {
  console.error(`Arquivo não encontrado: ${srcPath}`);
  process.exit(1);
}

fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(srcPath, destPath);

console.log(`index.html copiado para: ${destPath}`);

