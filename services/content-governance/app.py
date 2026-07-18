from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import datetime
import hashlib
import json
import os
import sqlite3

app = FastAPI(title="ESKOS Content Governance Service", version="1.0.0")

DB_PATH = os.environ.get("GOVERNANCE_DB_PATH", "/app/governance.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS drafts (
                draft_id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                author_agent TEXT NOT NULL,
                content TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draft_id TEXT NOT NULL,
                reviewer_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                comments TEXT,
                timestamp TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                before_state TEXT NOT NULL,
                after_state TEXT NOT NULL
            )
        """)


@app.on_event("startup")
def startup():
    init_db()

class DraftContent(BaseModel):
    draft_id: str
    org_id: str
    author_agent: str
    content: str
    status: str = "PENDING"
    created_at: str = datetime.datetime.utcnow().isoformat()

class ApprovalRequest(BaseModel):
    draft_id: str
    reviewer_id: str
    decision: str  # "APPROVED" or "REJECTED"
    comments: Optional[str] = None

@app.post("/api/v1/governance/drafts", status_code=status.HTTP_201_CREATED)
def submit_draft(draft: DraftContent):
    """Agent submits a draft for human-in-the-loop review."""
    now = datetime.datetime.utcnow().isoformat()
    with get_conn() as conn:
        conn.execute("""
            INSERT INTO drafts (
                draft_id, org_id, author_agent, content, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(draft_id) DO UPDATE SET
                org_id = excluded.org_id,
                author_agent = excluded.author_agent,
                content = excluded.content,
                status = excluded.status,
                updated_at = excluded.updated_at
        """, (
            draft.draft_id, draft.org_id, draft.author_agent, draft.content,
            draft.status, draft.created_at or now, now
        ))
    return {"message": "Draft submitted successfully for review", "draft_id": draft.draft_id}

@app.get("/api/v1/governance/drafts", response_model=List[dict])
def list_drafts(status: Optional[str] = "PENDING"):
    """Retrieve drafts by status."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM drafts WHERE status = ? ORDER BY created_at DESC",
            (status,)
        ).fetchall()
        return [dict(row) for row in rows]

@app.post("/api/v1/governance/review")
def review_draft(request: ApprovalRequest):
    """Human reviewer approves or rejects a draft."""
    draft_id = request.draft_id
    if request.decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM drafts WHERE draft_id = ?", (draft_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Draft not found")

        draft = dict(row)

        if draft["status"] != "PENDING":
            raise HTTPException(status_code=400, detail=f"Draft is already {draft['status']}")
        
        before_state = json.dumps(draft, sort_keys=True)
        now = datetime.datetime.utcnow().isoformat()
        content_hash = hashlib.sha256(draft["content"].encode("utf-8")).hexdigest()
        after_state_doc = {**draft, "status": request.decision, "updated_at": now}

        conn.execute(
            "UPDATE drafts SET status = ?, updated_at = ? WHERE draft_id = ?",
            (request.decision, now, draft_id)
        )
        # Trigger publishing service if approved
        published_url = None
        if request.decision == "APPROVED":
            try:
                import requests
                publish_payload = {
                    "draft_id": draft_id,
                    "title": f"Scientific Release: {draft_id}",
                    "content": draft["content"],
                    "org_id": draft["org_id"]
                }
                pub_url = os.getenv("PUBLISHING_SERVICE_URL", "http://publishing-service:8092/api/v1/publish")
                pub_res = requests.post(pub_url, json=publish_payload, timeout=8)
                if pub_res.status_code == 200:
                    pub_data = pub_res.json()
                    published_url = pub_data.get("url")
                    after_state_doc["published_url"] = published_url
                    print(f"[content-governance] Draft {draft_id} successfully published: {published_url}", flush=True)
            except Exception as e:
                print(f"[content-governance] Failed to trigger publishing service: {e}", flush=True)

        conn.execute("""
            INSERT INTO audit_log (
                draft_id, reviewer_id, decision, comments, timestamp, content_hash,
                before_state, after_state
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            draft_id, request.reviewer_id, request.decision, request.comments,
            now, content_hash, before_state, json.dumps(after_state_doc, sort_keys=True)
        ))
    
    return {
        "message": f"Draft {request.decision}",
        "audit_receipt": content_hash,
        "published_url": published_url
    }

@app.get("/api/v1/governance/audit")
def get_audit_logs():
    """Retrieve the publishing audit logs (would query PostgreSQL publishing_audit table)."""
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT draft_id, reviewer_id, decision, comments, timestamp, content_hash
            FROM audit_log
            ORDER BY id DESC
        """).fetchall()
        return [dict(row) for row in rows]

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8081))
    uvicorn.run(app, host="0.0.0.0", port=port)
