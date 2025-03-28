
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
      Suggest appropriate design patterns and architectural approaches.
    `,
    architecture: `
      Based on previous analysis, design a scalable architecture:
      {{context}}
      
      Proposed architecture constraints:
      {{constraints}}
      
      Include component relationships, data flow, and state management strategy.
      Focus on maintainability and separation of concerns.
    `,
    implementation: `
      Generate implementation using:
      Architecture: {{context}}
      Constraints: {{constraints}}
      
      Ensure type safety and best practices.
      Use TypeScript for all implementation.
      Follow React hooks best practices.
      Use Tailwind CSS for styling with shadcn/ui components where appropriate.
      Include comprehensive error handling and loading states.
      
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
      Follow React hooks best practices.
      Use Tailwind CSS for styling with shadcn/ui components where appropriate.
      Include comprehensive error handling and loading states.
      Make sure this file integrates properly with previously generated files.
      All imports should reference existing files in the project.
      
      Format the file with \`\`\`typescript filename.ts
      // code
      \`\`\`
    `,
    validation: `
      Validate the following implementation:
      {{context}}
      
      Identify any issues with type safety, best practices, or performance.
      Check for common React anti-patterns.
      Validate integration points between components.
    `,
    optimization: `
      Optimize the following implementation:
      {{context}}
      
      Focus on performance, readability, and maintainability.
      Implement memoization where appropriate.
      Ensure proper cleanup in useEffect hooks.
      Optimize rendering performance with proper dependency arrays.
    `
  };

  composePrompt(blueprint: PromptBlueprint): string {
    // Get the template based on the stage, handle implementation_with_context specially
    let templateKey: GenerationStage = blueprint.stage;
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
