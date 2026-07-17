package eskos.authorization

default allow = false

# Ingestion workers may POST if their cert scope grants ingress write access.
allow {
    input.method == "POST"
    input.path == ["api", "v1", "knowledge", "ingest"]
    input.token.scopes[_] == "knowledge:write:ingress"
}

# Reads are scoped by department AND brand namespace (org_id).
# A Goel-only analyst cannot read Borosil-tagged internal documents, and
# vice versa, but both can read org_id == "shared".
allow {
    input.method == "POST"
    input.path == ["api", "v1", "knowledge", "query"]
    input.token.scopes[_] == "knowledge:read"
    input.resource.org_id == "shared"
}

allow {
    input.method == "POST"
    input.path == ["api", "v1", "knowledge", "query"]
    input.token.scopes[_] == "knowledge:read"
    input.user.department == input.resource.target_department
    input.user.org_id == input.resource.org_id
}

# Circuit-breaker admin actions require an explicit elevated scope —
# prevents a compromised ingestion worker cert from re-enabling itself.
allow {
    input.method == "POST"
    input.path == ["api", "v1", "admin", "circuit-breaker", "reset"]
    input.token.scopes[_] == "admin:circuit-breaker:reset"
}
