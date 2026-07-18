import * as fs from 'fs';
import * as path from 'path';

let cachedRules = "";
let lastMtimeMs = 0;

export function getProjectRules(): string {
  const rulesPath = path.join(process.cwd(), 'config', 'AGENT_RULES.md');
  try {
    const stats = fs.statSync(rulesPath);
    if (stats.mtimeMs > lastMtimeMs) {
      cachedRules = fs.readFileSync(rulesPath, 'utf8');
      lastMtimeMs = stats.mtimeMs;
    }
    return cachedRules;
  } catch (err) {
    return "";
  }
}
