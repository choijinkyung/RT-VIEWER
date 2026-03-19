const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "TEST849");
const outputDir = path.join(projectRoot, "public", "sample-data", "TEST849");
const manifestPath = path.join(projectRoot, "public", "sample-data", "manifest.json");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function clearDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

function main() {
  ensureDir(outputDir);
  clearDir(outputDir);

  const files = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const fileName of files) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(outputDir, fileName));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    basePath: "sample-data/TEST849",
    files,
  };

  ensureDir(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Prepared ${files.length} sample DICOM files for deployment.`);
}

main();
