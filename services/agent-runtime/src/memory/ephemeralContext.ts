import { Content } from "@google/generative-ai";

interface Session {
  history: Content[];
  lastAccessed: number;
}

const sessions = new Map<string, Session>();
const TTL_MS = 30 * 60 * 1000;
const MAX_TURNS = 40;

export function getSessionHistory(sessionId: string): Content[] {
  cleanup();
  const session = sessions.get(sessionId);
  if (session) {
    session.lastAccessed = Date.now();
    return session.history;
  }
  return [];
}

export function saveSessionHistory(sessionId: string, history: Content[]) {
  cleanup();
  let storedHistory = history;
  if (history.length > MAX_TURNS) {
    storedHistory = history.slice(history.length - MAX_TURNS);
  }
  sessions.set(sessionId, {
    history: storedHistory,
    lastAccessed: Date.now(),
  });
}

function cleanup() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastAccessed > TTL_MS) {
      sessions.delete(id);
    }
  }
}
