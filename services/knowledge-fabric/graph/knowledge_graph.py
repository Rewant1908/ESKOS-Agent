import os
import re
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase

NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "eskospass123")

class Neo4jKG:
    def __init__(self):
        self.driver = None
        # Connect gracefully
        try:
            self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        except Exception as e:
            print(f"[knowledge_graph] Error connecting to Neo4j: {e}", flush=True)

    def close(self):
        if self.driver:
            self.driver.close()

    def init_constraints(self):
        """Creates uniqueness constraints for fast entity lookup."""
        if not self.driver:
            return
        with self.driver.session() as session:
            # Neo4j 5 syntax for constraints
            session.run("CREATE CONSTRAINT UNIQUE_ENTITY_ID IF NOT EXISTS FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE")

    def upsert_entity(self, entity_id: str, name: str, entity_type: str, org_id: str, properties: Optional[Dict[str, Any]] = None):
        """Creates or merges an entity node."""
        if not self.driver:
            return
        properties = properties or {}
        cypher = """
        MERGE (e:Entity {entity_id: $entity_id})
        ON CREATE SET 
            e.name = $name,
            e.entity_type = $entity_type,
            e.org_id = $org_id,
            e.created_at = timestamp()
        ON MATCH SET
            e.name = $name,
            e.org_id = $org_id
        SET e += $properties
        RETURN e
        """
        # Dynamic label creation for specific types as auxiliary labels
        with self.driver.session() as session:
            session.run(cypher, entity_id=entity_id, name=name, entity_type=entity_type, org_id=org_id, properties=properties)
            # Add typed label for clean visualization
            clean_label = "".join(x.capitalize() for x in entity_type.split("_"))
            if clean_label.isalpha():
                session.run(f"MATCH (e:Entity {{entity_id: $entity_id}}) SET e:{clean_label}", entity_id=entity_id)

    def link_entities(self, source_id: str, target_id: str, rel_type: str, properties: Optional[Dict[str, Any]] = None):
        """Establishes a directed relationship between entities."""
        if not self.driver:
            return
        properties = properties or {}
        # Sanitize rel_type (Neo4j relationship types must match alphanumeric/underscore)
        rel_type = re.sub(r'[^A-Z0-9_]+', '_', rel_type.upper())
        cypher = f"""
        MATCH (a:Entity {{entity_id: $source_id}})
        MATCH (b:Entity {{entity_id: $target_id}})
        MERGE (a)-[r:{rel_type}]->(b)
        SET r += $properties
        """
        with self.driver.session() as session:
            session.run(cypher, source_id=source_id, target_id=target_id, properties=properties)

    def get_neighbors(self, entity_id: str) -> List[Dict[str, Any]]:
        """Returns direct neighbors of an entity."""
        if not self.driver:
            return []
        cypher = """
        MATCH (e:Entity {entity_id: $entity_id})-[r]-(neighbor:Entity)
        RETURN neighbor.entity_id as id, neighbor.name as name, neighbor.entity_type as type, type(r) as relationship
        LIMIT 20
        """
        with self.driver.session() as session:
            result = session.run(cypher, entity_id=entity_id)
            return [dict(row) for row in result]
            
    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if not self.driver:
            return []
        with self.driver.session() as session:
            result = session.run(cypher, params or {})
            return [dict(row) for row in result]

    def get_graph_stats(self) -> Dict[str, Any]:
        """Returns entity and relationship telemetry from Neo4j."""
        if not self.driver:
            return {"total_nodes": 0, "total_relations": 0, "entity_types": {}}
        try:
            with self.driver.session() as session:
                node_res = session.run("MATCH (n:Entity) RETURN count(n) as node_count")
                node_count = node_res.single()["node_count"]
                
                rel_res = session.run("MATCH (:Entity)-[r]->(:Entity) RETURN count(r) as rel_count")
                rel_count = rel_res.single()["rel_count"]
                
                type_res = session.run("MATCH (e:Entity) RETURN e.entity_type as type, count(e) as count")
                entity_types = {}
                for row in type_res:
                    t = row["type"] or "unknown"
                    entity_types[t] = row["count"]
                
                return {
                    "total_nodes": node_count,
                    "total_relations": rel_count,
                    "entity_types": entity_types
                }
        except Exception as e:
            print(f"[knowledge_graph] Error querying stats: {e}", flush=True)
            return {"total_nodes": 0, "total_relations": 0, "entity_types": {}}

