import * as fs from 'fs';
import * as path from 'path';

const MEMORY_DIR = path.join(process.cwd(), 'data', 'memory');

export function getPersistentMemory(orgId: string): string {
  let combined = "";
  
  const sharedPath = path.join(MEMORY_DIR, 'memory-shared.md');
  if (fs.existsSync(sharedPath)) {
    combined += fs.readFileSync(sharedPath, 'utf8') + "\n\n";
  }

  const orgPath = path.join(MEMORY_DIR, `memory-${orgId}.md`);
  if (fs.existsSync(orgPath)) {
    combined += fs.readFileSync(orgPath, 'utf8') + "\n\n";
  }
  
  return combined.trim();
}

export function appendPersistentMemory(orgId: string, fact: string) {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  const orgPath = path.join(MEMORY_DIR, `memory-${orgId}.md`);
  const entry = `- [${new Date().toISOString()}] ${fact}\n`;
  fs.appendFileSync(orgPath, entry, 'utf8');
}
