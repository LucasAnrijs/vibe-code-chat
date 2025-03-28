
import { 
  LLMProvider, 
  PromptBlueprint, 
  CodeArtifact, 
  CircuitBreaker, 
  GenerationStage 
} from "@/lib/agent-types";
import { CodeParsingService } from "./CodeParsingService";
import { toast } from "@/hooks/use-toast";

/**
 * Service for prompt engineering and formatting
 */
class PromptEngineeringService {
  private templates: Record<GenerationStage, string> = {
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
      
      Format each file with \`\`\`typescript:filename.ts
      // code
      \`\`\`
    `
  };

  composePrompt(blueprint: PromptBlueprint): string {
    const template = this.templates[blueprint.stage];
    return template
      .replace('{{context}}', blueprint.context)
      .replace('{{constraints}}', JSON.stringify(blueprint.constraints));
  }
}

/**
 * Main service for generating code using LLM providers
 */
export class CodeGenerationService {
  private providers: LLMProvider[];
  private promptService: PromptEngineeringService;
  private circuitBreaker: CircuitBreaker;
  private codeParser: CodeParsingService;

  constructor(providers: LLMProvider[]) {
    this.providers = providers;
    this.promptService = new PromptEngineeringService();
    this.circuitBreaker = new CircuitBreaker();
    this.codeParser = new CodeParsingService();
  }

  async generateComponent(spec: {
    specification: string;
    architecture?: string;
    constraints?: string[];
  }): Promise<CodeArtifact | null> {
    if (this.providers.length === 0) {
      toast({
        title: "No Providers Available",
        description: "Add at least one AI provider to generate code.",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Initialize all providers before starting
      await Promise.all(
        this.providers.map(provider => provider.initialize())
      );
    } catch (error) {
      console.error("Failed to initialize providers:", error);
      toast({
        title: "Initialization Failed",
        description: "One or more providers failed to initialize.",
        variant: "destructive"
      });
      return null;
    }

    const stages: GenerationStage[] = [
      'analysis', 
      'architecture', 
      'implementation'
    ];

    let currentContext = spec.specification;
    let finalArtifact: CodeArtifact | null = null;

    for (const stage of stages) {
      try {
        // Use circuit breaker to handle potential failures
        const result = await this.circuitBreaker.execute(async () => {
          const blueprint: PromptBlueprint = {
            context: currentContext,
            stage,
            requirements: [],
            constraints: {
              architecture: spec.architecture,
              additionalConstraints: spec.constraints
            }
          };

          const prompt = this.promptService.composePrompt(blueprint);
          
          for (const provider of this.providers) {
            try {
              // Start the generator 
              const generationStream = provider.generate(blueprint);
              
              let fullResponse = '';
              
              // Consume the stream - in a real implementation, update UI with chunks
              for await (const chunk of generationStream) {
                fullResponse += chunk.content;
              }

              if (provider.validateResponse(fullResponse)) {
                // For implementation stage, parse code blocks into files
                const files = stage === 'implementation' 
                  ? this.codeParser.parseCodeBlocks(fullResponse)
                  : { [`${stage}-output.txt`]: fullResponse };
                
                // Validate code if implementation stage
                if (stage === 'implementation') {
                  const validation = this.codeParser.validateCode(files);
                  if (!validation.isValid) {
                    console.warn("Code validation issues:", validation.errors);
                    // We still continue, but log the issues
                  }
                }

                const artifact: CodeArtifact = {
                  files,
                  metadata: {
                    generatedAt: new Date(),
                    providerUsed: provider.constructor.name,
                    stage
                  }
                };

                // For implementation stage, this is the final artifact
                if (stage === 'implementation') {
                  finalArtifact = artifact;
                }
                
                // Update context for next stage
                currentContext = fullResponse;
                return true;
              }
            } catch (providerError) {
              console.warn(`Provider ${provider.constructor.name} failed`, providerError);
              // Continue with next provider
            }
          }
          
          // If we get here, all providers failed
          return false;
        });

        if (!result) {
          toast({
            title: "Generation Failed",
            description: `No provider could generate valid code for ${stage} stage.`,
            variant: "destructive"
          });
          return null;
        }
      } catch (stageError) {
        console.error('Stage generation failed:', stage, stageError);
        toast({
          title: "Generation Error",
          description: `Failed to generate ${stage} stage.`,
          variant: "destructive"
        });
        return null;
      }
    }

    return finalArtifact;
  }
}
