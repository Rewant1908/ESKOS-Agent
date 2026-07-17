from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import datetime
import hashlib
import os

app = FastAPI(title="ESKOS Content Governance Service", version="1.0.0")

# In a real implementation, we would use SQLAlchemy to connect to Postgres
# Here we mock the database layer for the demo environment.
mock_db = {}
audit_log = []

class DraftContent(BaseModel):
    draft_id: str
    org_id: str
    author_agent: str
    content: str
    status: str = "PENDING"
    created_at: str = datetime.datetime.utcnow().isoformat()

class ApprovalRequest(BaseModel):
    reviewer_id: str
    decision: str  # "APPROVED" or "REJECTED"
    comments: Optional[str] = None

@app.post("/api/v1/governance/drafts", status_code=status.HTTP_201_CREATED)
def submit_draft(draft: DraftContent):
    """Agent submits a draft for human-in-the-loop review."""
    mock_db[draft.draft_id] = draft.dict()
    return {"message": "Draft submitted successfully for review", "draft_id": draft.draft_id}

@app.get("/api/v1/governance/drafts", response_model=List[dict])
def list_drafts(status: Optional[str] = "PENDING"):
    """Retrieve drafts by status."""
    return [d for d in mock_db.values() if d["status"] == status]

@app.post("/api/v1/governance/drafts/{draft_id}/review")
def review_draft(draft_id: str, request: ApprovalRequest):
    """Human reviewer approves or rejects a draft."""
    if draft_id not in mock_db:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    draft = mock_db[draft_id]
    
    if draft["status"] != "PENDING":
        raise HTTPException(status_code=400, detail=f"Draft is already {draft['status']}")
        
    if request.decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be APPROVED or REJECTED")
        
    # Update status
    draft["status"] = request.decision
    
    # Calculate cryptographic hash of approved content
    content_hash = hashlib.sha256(draft["content"].encode('utf-8')).hexdigest()
    
    # Record Audit Log
    audit_entry = {
        "draft_id": draft_id,
        "reviewer_id": request.reviewer_id,
        "decision": request.decision,
        "comments": request.comments,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "content_hash": content_hash
    }
    audit_log.append(audit_entry)
    
    # If approved, we would push to Kafka 'hygiene-passed' or 'publishing-queue'
    # For now, we just return success
    
    return {
        "message": f"Draft {request.decision}",
        "audit_receipt": content_hash
    }

@app.get("/api/v1/governance/audit")
def get_audit_logs():
    """Retrieve the publishing audit logs (would query PostgreSQL publishing_audit table)."""
    return audit_log

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8081))
    uvicorn.run(app, host="0.0.0.0", port=port)
