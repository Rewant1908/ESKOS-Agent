import axios from 'axios';
// Simulated import of the custom AgentTool logic
// import { runAgent } from './AgentTool/runAgent';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FABRIC_URL = process.env.FABRIC_URL || 'http://knowledge-fabric:8090/api/v1/knowledge/context';

async function queryKnowledgeFabric(query: string, orgId: string, ragType: string) {
    try {
        console.log(`[AgentTool] Querying Knowledge Fabric for: "${query}"`);
        const response = await axios.post(FABRIC_URL, {
            query,
            org_id: orgId,
            rag_type: ragType
        });
        return response.data.formatted_context;
    } catch (error) {
        console.error("[AgentTool] Error querying knowledge fabric:", error);
        return "Knowledge Fabric is currently unreachable.";
    }
}

async function main() {
    console.log("==========================================");
    console.log("ESKOS AgentTool Runtime Initialized");
    console.log("LLM Provider: Google Gemini");
    console.log("==========================================");

    // Simulate Agent Tool invocation
    const mockUserPrompt = "What are the key features of the Goel Scientific Coil Condenser?";
    console.log(`\nUser: ${mockUserPrompt}`);

    console.log("\n[AgentTool Thought]: I need to fetch product datasheets from the ESKOS Knowledge Fabric.");
    
    const context = await queryKnowledgeFabric("Coil Condenser", "goel-scientific", "product");
    
    console.log("\n[AgentTool Context Retrieved]:\n");
    if (context && typeof context === 'string') {
        console.log(context.substring(0, 300) + "...\n(Truncated for display)");
    } else {
        console.log("No context found.");
    }
    
    console.log("\n[AgentTool Response via Gemini]:");
    console.log("Based on the Goel Scientific datasheets, the Coil Condenser has the following key features:");
    console.log("- High heat transfer efficiency via a multiple parallel coil design.");
    console.log("- Vertical mounting for optimized condensate flow.");
    console.log("- Suitable for cooling water and brine in closed circuits (up to 2.7 bar).");
    console.log("- Made of corrosion-resistant borosilicate glass.");
}

main().catch(console.error);
