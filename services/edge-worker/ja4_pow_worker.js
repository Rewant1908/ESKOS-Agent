/**
 * ESKOS Edge Worker — §7 Cloudflare Edge Layer, §8 JA4 Fingerprinting, §9 Dynamic PoW
 *
 * Trusted Tier-1 connectors (identified by client cert, verified downstream by Envoy/Kong)
 * bypass PoW entirely. Everything else gets fingerprinted and, if unverified, challenged.
 *
 * Requires: a KV namespace bound as JA4_REPUTATION, and a Workers-compatible
 * JA4 fingerprint (available via request.cf.botManagement / JA4 in supported plans,
 * or computed via a TLS fingerprinting proxy in front of the Worker).
 */

const POW_DIFFICULTY_DEFAULT = 20; // bits
const POW_DIFFICULTY_MAX = 26;
const POW_TOKEN_TTL_SECONDS = 90;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Trusted connectors present a client cert; that verification happens at
    // Envoy (mTLS termination). This worker only sees traffic that either
    // already has a valid solved-PoW token, or needs to be challenged.
    if (url.pathname === "/api/v1/knowledge/ingest" && request.method === "POST") {
      const ja4 = request.cf?.botManagement?.ja4 || request.headers.get("x-ja4-fingerprint");
      const isTrustedCert = request.headers.get("x-client-cert-verified") === "true";

      if (isTrustedCert) {
        return fetch(request); // pass straight through to Envoy/Kong
      }

      const reputation = await getReputationScore(env, ja4);

      const solveToken = request.headers.get("x-pow-token");
      if (solveToken) {
        const valid = await verifyPowToken(env, solveToken, ja4);
        if (valid) {
          await bumpReputation(env, ja4, +1);
          return fetch(request);
        }
        return new Response("Invalid or expired PoW token", { status: 403 });
      }

      // No token presented — issue a challenge scaled to reputation.
      const difficulty = computeDifficulty(reputation);
      const challenge = await issueChallenge(env, ja4, difficulty);
      return new Response(JSON.stringify(challenge), {
        status: 402, // Payment Required, repurposed as "compute required"
        headers: { "content-type": "application/json" },
      });
    }

    return fetch(request);
  },
};

function computeDifficulty(reputation) {
  // reputation: -inf..+inf, higher = more trustworthy history.
  // Unknown fingerprint (reputation 0) -> default difficulty.
  // Repeated abuse (negative reputation) -> escalate toward max.
  if (reputation >= 5) return 0; // effectively skip — long history of clean solves
  if (reputation <= -5) return POW_DIFFICULTY_MAX;
  const scaled = POW_DIFFICULTY_DEFAULT - reputation * 1.2;
  return Math.min(POW_DIFFICULTY_MAX, Math.max(14, Math.round(scaled)));
}

async function getReputationScore(env, ja4) {
  if (!ja4) return -3; // no fingerprint at all is itself suspicious
  const raw = await env.JA4_REPUTATION.get(`rep:${ja4}`);
  return raw ? parseInt(raw, 10) : 0;
}

async function bumpReputation(env, ja4, delta) {
  if (!ja4) return;
  const current = await getReputationScore(env, ja4);
  await env.JA4_REPUTATION.put(`rep:${ja4}`, String(current + delta), {
    expirationTtl: 60 * 60 * 24 * 30, // 30 days
  });
}

async function issueChallenge(env, ja4, difficulty) {
  const seed = crypto.randomUUID();
  const challenge = { seed, difficulty, ja4: ja4 || "unknown", issued_at: Date.now() };
  await env.JA4_REPUTATION.put(`challenge:${seed}`, JSON.stringify(challenge), {
    expirationTtl: POW_TOKEN_TTL_SECONDS,
  });
  return {
    type: "hashcash-sha256",
    seed,
    difficulty,
    instructions:
      "Find `nonce` such that SHA256(seed + nonce) has `difficulty` leading zero bits. " +
      "Submit as header x-pow-token: `<seed>:<nonce>`.",
  };
}

async function verifyPowToken(env, token, ja4) {
  const [seed, nonce] = token.split(":");
  if (!seed || !nonce) return false;

  const raw = await env.JA4_REPUTATION.get(`challenge:${seed}`);
  if (!raw) return false; // expired or never issued — replay attempt
  const challenge = JSON.parse(raw);

  const hash = await sha256Hex(challenge.seed + nonce);
  const leadingZeroBits = countLeadingZeroBits(hash);

  await env.JA4_REPUTATION.delete(`challenge:${seed}`); // single-use, prevents replay

  return leadingZeroBits >= challenge.difficulty;
}

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function countLeadingZeroBits(hexHash) {
  let bits = 0;
  for (const char of hexHash) {
    const nibble = parseInt(char, 16);
    if (nibble === 0) {
      bits += 4;
      continue;
    }
    bits += Math.clz32(nibble) - 28; // leading zeros within this nibble
    break;
  }
  return bits;
}
