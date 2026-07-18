"use strict";
/**
 * Chat-time injection guard — distinct from services/hygiene-pipeline/checks/prompt_injection.py.
 *
 * That check runs once, at ingestion, on documents before they're embedded.
 * This one runs on EVERY chat turn, on two different surfaces:
 *   1. The user's own message (someone typing an injection directly into the box)
 *   2. Retrieved RAG context (a chunk that predates the injection detector, or
 *      that scored just under threshold at ingestion, surfacing later at query time)
 *
 * Neither surface is optional — a system that only checks one is only half-protected.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanForInjection = scanForInjection;
exports.filterRetrievedContext = filterRetrievedContext;
const INJECTION_PATTERNS = [
    /ignore (all |any )?(previous|prior|above) instructions/i,
    /disregard (all |any )?(previous|prior|above) (instructions|context)/i,
    /you are now (in )?(developer|admin|dan|unrestricted) mode/i,
    /reveal (your|the) system prompt/i,
    /override (your|the) (guidelines|instructions|rules)/i,
    /act as if you (have no|had no) restrictions/i,
    /\[system\]/i,
    /<\|im_start\|>/i,
];
const CROSS_ORG_LEAK_PATTERNS = [
    /show me (borosil|goel).{0,30}(data|documents|internal)/i, // caught by org_id scoping too, but flag explicitly
];
function scanForInjection(text, source) {
    const matches = [];
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(text))
            matches.push(pattern.source);
    }
    for (const pattern of CROSS_ORG_LEAK_PATTERNS) {
        if (pattern.test(text))
            matches.push(pattern.source);
    }
    return { clean: matches.length === 0, matches, source };
}
/**
 * Scans every retrieved context chunk before it's allowed into the model's
 * context window. Flagged chunks are dropped, not passed through with a
 * warning — an LLM cannot be trusted to "ignore" an injection it can see.
 */
function filterRetrievedContext(chunks) {
    const safe = [];
    let dropped = 0;
    for (const chunk of chunks) {
        const result = scanForInjection(chunk, "retrieved_context");
        if (result.clean) {
            safe.push(chunk);
        }
        else {
            dropped += 1;
            console.warn(`[injection-guard] dropped retrieved chunk — matched: ${result.matches.join(", ")}`);
        }
    }
    return { safe, dropped };
}
