
import { GenerationStage, PromptBlueprint } from "@/lib/agent-types";

/**
 * Service for prompt engineering and formatting
 */
export class PromptEngineeringService {
  private templates: Record<string, string> = {
    analysis: `
      Analyze the following requirements:
      {{context}}
      
      Identify key constraints and potential challenges.
    `,
    architecture: `
      Based on previous analysis, design a scalable architecture:
      {{context}}
      
      Proposed architecture constraints:
      {{constraints}}
    `,
    implementation: `
      Generate implementation using:
      Architecture: {{context}}
      Constraints: {{constraints}}
      
      Ensure type safety and best practices.
      Use TypeScript for all implementation.
      
      Format each file with \`\`\`typescript filename.ts
      // code
      \`\`\`
    `,
    implementation_with_context: `
      Generate implementation for this file:
      {{context}}
      
      Previously generated files:
      {{filesContext}}
      
      Constraints: {{constraints}}
      
      Ensure type safety and best practices.
      Use TypeScript for all implementation.
      Make sure this file integrates properly with previously generated files.
      
      Format the file with \`\`\`typescript filename.ts
      // code
      \`\`\`
    `,
    validation: `
      Validate the following implementation:
      {{context}}
      
      Identify any issues with type safety, best practices, or performance.
    `,
    optimization: `
      Optimize the following implementation:
      {{context}}
      
      Focus on performance, readability, and maintainability.
    `
  };

  composePrompt(blueprint: PromptBlueprint): string {
    // Get the template based on the stage, handle implementation_with_context specially
    let templateKey = blueprint.stage;
    if (blueprint.constraints && blueprint.constraints.filesContext) {
      templateKey = 'implementation_with_context';
    }
    
    const template = this.templates[templateKey];
    if (!template) {
      throw new Error(`No template found for stage: ${templateKey}`);
    }
    
    let processedTemplate = template
      .replace('{{context}}', blueprint.context);
      
    if (blueprint.constraints) {
      processedTemplate = processedTemplate
        .replace('{{constraints}}', JSON.stringify(blueprint.constraints));
    }
    
    if (blueprint.constraints && blueprint.constraints.filesContext) {
      processedTemplate = processedTemplate
        .replace('{{filesContext}}', blueprint.constraints.filesContext as string);
    }
    
    return processedTemplate;
  }
}
