"use strict";
/**
 * Resolves which org_id a request is allowed to operate as.
 *
 * CURRENT STATE (flagged honestly): there is no real auth in front of this
 * service yet — Kong's consumer/key-auth wiring for the agent route is a
 * known open item (same gap flagged on the governance routes). Until that
 * lands, this resolves org_id from a request header set by a trusted
 * upstream (Kong or the dashboard's own session check), NOT from the raw
 * chat message text, and NOT from any argument the model itself supplies.
 *
 * Once Kong key-auth/OIDC is wired in, replace `resolveFromHeader` with a
 * real lookup against the authenticated consumer/session — the header
 * approach here is a placeholder that at least keeps org scoping out of the
 * model's control, which is the part that actually matters for isolation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOrgId = resolveOrgId;
exports.resolveCallerId = resolveCallerId;
const VALID_ORGS = ["borosil-scientific", "goel-scientific", "shared"];
function resolveOrgId(req) {
    const header = req.header("x-eskos-org-id");
    if (header && VALID_ORGS.includes(header)) {
        return header;
    }
    // No verified org context — default to the most restrictive scope rather
    // than guessing. "shared" only sees brand-agnostic knowledge (standards,
    // generic material properties), never brand-specific product/pricing data.
    console.warn("[org-scope] no valid x-eskos-org-id header — defaulting to 'shared' (restrictive)");
    return "shared";
}
function resolveCallerId(req) {
    return req.header("x-eskos-caller-id") || "anonymous";
}
