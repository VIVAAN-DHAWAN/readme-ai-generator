import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

export interface ScanResult {
  files: string[];
  packageJson: any | null;
  requirementsTxt: string | null;
  goMod: string | null;
  readme: string | null;
  license: string | null;
  fileCount: number;
  languages: string[];
  frameworks: string[];
}

export function scanLocalDirectory(dirPath: string): ScanResult {
  const ig = ignore().add(['.git', 'node_modules', 'dist', 'build', '.DS_Store', 'coverage']);
  const allFiles: string[] = [];

  function walk(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const relPath = path.relative(dirPath, fullPath);
      if (ig.ignores(relPath)) continue;

      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        allFiles.push(relPath);
      }
    }
  }

  walk(dirPath);

  const packageJsonPath = path.join(dirPath, 'package.json');
  const packageJson = fs.existsSync(packageJsonPath) ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) : null;

  const reqTxtPath = path.join(dirPath, 'requirements.txt');
  const requirementsTxt = fs.existsSync(reqTxtPath) ? fs.readFileSync(reqTxtPath, 'utf8') : null;

  const goModPath = path.join(dirPath, 'go.mod');
  const goMod = fs.existsSync(goModPath) ? fs.readFileSync(goModPath, 'utf8') : null;

  const readmePath = path.join(dirPath, 'README.md');
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : null;

  const licensePath = path.join(dirPath, 'LICENSE');
  const license = fs.existsSync(licensePath) ? fs.readFileSync(licensePath, 'utf8') : null;

  const exts = allFiles.map(f => path.extname(f)).filter(Boolean);
  const langs = [...new Set(exts)];

  const frameworks: string[] = [];
  if (packageJson?.dependencies) {
    if (packageJson.dependencies.react) frameworks.push('React');
    if (packageJson.dependencies.next) frameworks.push('Next.js');
    if (packageJson.dependencies.express) frameworks.push('Express');
  }
  if (requirementsTxt) {
    if (requirementsTxt.includes('Django')) frameworks.push('Django');
    if (requirementsTxt.includes('FastAPI')) frameworks.push('FastAPI');
  }

  return {
    files: allFiles,
    packageJson,
    requirementsTxt,
    goMod,
    readme,
    license,
    fileCount: allFiles.length,
    languages: langs,
    frameworks
  };
}
