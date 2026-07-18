import { TOOL_DECLARATIONS } from "../tools/knowledgeTools";

export interface ToolMetadata {
  name: string;
  description: string;
  parameters: any;
  active: boolean;
}

export class ToolRegistry {
  private static activeTools: Set<string> = new Set(
    TOOL_DECLARATIONS.map(t => t.name)
  );

  public static getTools(): ToolMetadata[] {
    return TOOL_DECLARATIONS.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
      active: this.activeTools.has(t.name)
    }));
  }

  public static toggleTool(name: string, active: boolean): boolean {
    if (active) {
      this.activeTools.add(name);
    } else {
      this.activeTools.delete(name);
    }
    return this.activeTools.has(name);
  }

  public static isToolActive(name: string): boolean {
    return this.activeTools.has(name);
  }
}
