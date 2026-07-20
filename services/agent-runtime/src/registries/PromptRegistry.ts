import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "config/prompts");

export interface PromptMetadata {
  id: string;
  name: string;
  instruction: string;
}

export class PromptRegistry {
  public static getPrompts(): PromptMetadata[] {
    try {
      if (!fs.existsSync(PROMPTS_DIR)) {
        return [];
      }
      const files = fs.readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".md"));
      return files.map((file) => {
        const id = file.replace(".md", "");
        const filePath = path.join(PROMPTS_DIR, file);
        let instruction = "";
        try {
          instruction = fs.readFileSync(filePath, "utf-8");
        } catch (err) {
          console.error(`Failed to read prompt file ${file}:`, err);
        }
        return {
          id,
          name: id.toUpperCase() + " Prompt Template",
          instruction,
        };
      });
    } catch (err) {
      console.error("Failed to read prompts directory:", err);
      return [];
    }
  }

  public static updatePrompt(id: string, instruction: string): void {
    const filePath = path.join(PROMPTS_DIR, `${id}.md`);
    try {
      fs.writeFileSync(filePath, instruction, "utf-8");
    } catch (err) {
      console.error(`Failed to write prompt file ${id}.md:`, err);
      throw new Error(`Failed to save prompt: ${err}`);
    }
  }
}
