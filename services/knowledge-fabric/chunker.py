import re
from typing import List, Dict, Any
from models import KnowledgeChunk

def chunk_document(doc_id: str, text: str, version: str, trust_score: float) -> List[Dict[str, Any]]:
    """
    Split text semantically into sections based on headers or logical paragraphs.
    Ensures lineage is tracked.
    """
    lines = text.splitlines()
    chunks = []
    
    current_chunk_lines = []
    current_chunk_type = "general"
    position = 0
    
    header_pattern = re.compile(r"^(?:#+|=+|-+)\s*(.+)$|^(?:[A-Z\s]{4,20}:)$")
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        # Detect header to rotate chunks
        if header_pattern.match(stripped):
            if current_chunk_lines:
                # Flush previous chunk
                chunk_text = "\n".join(current_chunk_lines).strip()
                if len(chunk_text) >= 40:
                    chunks.append({
                        "chunk_id": f"{doc_id}:chunk:{position}",
                        "parent_doc_id": doc_id,
                        "text": chunk_text,
                        "chunk_type": current_chunk_type,
                        "position": position,
                        "trust_score": trust_score,
                        "version": version
                    })
                    position += 1
                current_chunk_lines = []
            
            # Map chunk type from header content
            lower_hdr = stripped.lower()
            if "spec" in lower_hdr or "dimension" in lower_hdr:
                current_chunk_type = "specification"
            elif "procedure" in lower_hdr or "sop" in lower_hdr or "step" in lower_hdr:
                current_chunk_type = "procedure"
            elif "application" in lower_hdr or "use" in lower_hdr:
                current_chunk_type = "application"
            elif "warning" in lower_hdr or "caution" in lower_hdr or "safety" in lower_hdr:
                current_chunk_type = "safety_warning"
            else:
                current_chunk_type = "section"
                
        current_chunk_lines.append(line)
        
        # Upper limit of 1000 characters before forced split
        if sum(len(l) for l in current_chunk_lines) > 1500:
            chunk_text = "\n".join(current_chunk_lines).strip()
            chunks.append({
                "chunk_id": f"{doc_id}:chunk:{position}",
                "parent_doc_id": doc_id,
                "text": chunk_text,
                "chunk_type": current_chunk_type,
                "position": position,
                "trust_score": trust_score,
                "version": version
            })
            position += 1
            # Keep last 2 lines as overlap
            current_chunk_lines = current_chunk_lines[-2:] if len(current_chunk_lines) > 2 else []
            
    # Flush final chunk
    if current_chunk_lines:
        chunk_text = "\n".join(current_chunk_lines).strip()
        if len(chunk_text) >= 20:
            chunks.append({
                "chunk_id": f"{doc_id}:chunk:{position}",
                "parent_doc_id": doc_id,
                "text": chunk_text,
                "chunk_type": current_chunk_type,
                "position": position,
                "trust_score": trust_score,
                "version": version
            })
            
    return chunks
