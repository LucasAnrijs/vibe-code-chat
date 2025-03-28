
import { LLMProvider, PromptBlueprint, ValidationReport } from "@/lib/agent-types";
import { toast } from "@/hooks/use-toast";

export type ValidationFunction = (content: string) => ValidationReport;

export interface GenerationPhase {
  name: string;
  promptTemplate: string;
  temperature?: number;
  maxTokens?: number;
  validation?: ValidationFunction;
  retryCount?: number;
}

export interface GenerationContext {
  [key: string]: any;
}

export interface GenerationPipelineConfig {
  phases: GenerationPhase[];
  contextBuilder?: (prevResults: Record<string, string>) => GenerationContext;
  fallbackProvider?: string;
  debugMode?: boolean;
}

export interface PhaseResult {
  phaseName: string;
  output: string;
  validationReport?: ValidationReport;
  metadata: {
    provider: string;
    timestamp: string;
    retryCount: number;
  };
}

export class GenerationPipeline {
  private config: GenerationPipelineConfig;
  private providers: LLMProvider[] = [];
  private results: Record<string, PhaseResult> = {};

  constructor(config: GenerationPipelineConfig) {
    this.config = config;
    
    // Apply defaults
    this.config.phases = this.config.phases.map(phase => ({
      retryCount: 2,
      temperature: 0.4,
      maxTokens: 2000,
      ...phase
    }));
  }

  registerProviders(providers: LLMProvider[]): void {
    this.providers = providers;
  }

  async execute(initialContext: Record<string, any> = {}): Promise<Record<string, PhaseResult>> {
    if (this.providers.length === 0) {
      toast({
        title: "No AI Providers",
        description: "Please register at least one LLM provider before execution.",
        variant: "destructive"
      });
      throw new Error("No AI providers registered with the pipeline");
    }

    let currentContext = { ...initialContext };
    
    // Execute each phase in sequence
    for (const phase of this.config.phases) {
      try {
        const result = await this.executePhase(phase, currentContext);
        this.results[phase.name] = result;
        
        // Update context for next phase
        if (this.config.contextBuilder) {
          const prevResults = Object.fromEntries(
            Object.entries(this.results).map(([key, value]) => [key, value.output])
          );
          const newContext = this.config.contextBuilder(prevResults);
          currentContext = { ...currentContext, ...newContext };
        }
      } catch (error) {
        console.error(`Phase ${phase.name} failed:`, error);
        toast({
          title: `Generation Phase Failed`,
          description: `The ${phase.name} phase could not be completed successfully.`,
          variant: "destructive"
        });
        throw error;
      }
    }
    
    if (this.config.debugMode) {
      console.log("Pipeline execution results:", this.results);
    }
    
    return this.results;
  }

  private async executePhase(
    phase: GenerationPhase, 
    context: Record<string, any>
  ): Promise<PhaseResult> {
    // Initialize providers before execution
    await Promise.all(this.providers.map(provider => provider.initialize()));
    
    // Prepare prompt with context variables
    const processedPrompt = this.processTemplate(phase.promptTemplate, context);
    let retryCount = 0;
    let lastError: any = null;
    
    // Try each provider until success or retry limit
    while (retryCount <= (phase.retryCount || 0)) {
      for (const provider of this.providers) {
        try {
          // Create blueprint for this phase
          const blueprint: PromptBlueprint = {
            context: processedPrompt,
            stage: phase.name as any, // This is a bit hacky but works for now
            requirements: [],
            constraints: {
              temperature: phase.temperature,
              maxTokens: phase.maxTokens
            }
          };
          
          // Generate content
          const generationStream = provider.generate(blueprint);
          let fullResponse = '';
          
          // Consume the stream
          for await (const chunk of generationStream) {
            fullResponse += chunk.content;
          }
          
          // Validate response
          if (!provider.validateResponse(fullResponse)) {
            throw new Error("Provider returned invalid response format");
          }
          
          // Run custom validation if provided
          let validationReport: ValidationReport | undefined = undefined;
          if (phase.validation) {
            validationReport = phase.validation(fullResponse);
            if (!validationReport.isValid) {
              if (this.config.debugMode) {
                console.warn(`Validation failed for ${phase.name}:`, validationReport.errors);
              }
              
              if (retryCount < (phase.retryCount || 0)) {
                throw new Error(`Validation failed: ${validationReport.errors.join(", ")}`);
              }
            }
          }
          
          // If we get here, we have a valid response
          const result: PhaseResult = {
            phaseName: phase.name,
            output: fullResponse,
            validationReport,
            metadata: {
              provider: provider.constructor.name,
              timestamp: new Date().toISOString(),
              retryCount
            }
          };
          
          return result;
        } catch (error) {
          lastError = error;
          if (this.config.debugMode) {
            console.warn(`Provider ${provider.constructor.name} failed:`, error);
          }
          // Continue to next provider or retry
        }
      }
      
      retryCount++;
    }
    
    // If we get here, all providers failed for all retries
    throw lastError || new Error(`All providers failed for phase ${phase.name}`);
  }

  private processTemplate(template: string, context: Record<string, any>): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
      if (key in context) {
        return String(context[key]);
      }
      return match; // Keep the placeholder if no value is found
    });
  }

  // Utility to get results from a specific phase
  getPhaseResult(phaseName: string): PhaseResult | undefined {
    return this.results[phaseName];
  }

  // Clear all results and start fresh
  reset(): void {
    this.results = {};
  }
}

// Helper validation functions
export function validateCodeGeneration(content: string): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for empty content
  if (!content.trim()) {
    errors.push("Empty generation result");
    return { isValid: false, errors, warnings };
  }
  
  // Check for code blocks
  if (!content.includes('```')) {
    warnings.push("No code blocks found in response");
  }
  
  // Check for TypeScript/React imports
  if (content.includes('import React') || content.includes('from "react"')) {
    // Good sign - it's probably React code
  } else if (content.includes('<') && content.includes('>') && content.includes('</')) {
    // Probably JSX/TSX but without proper imports
    warnings.push("Found JSX/TSX without proper React imports");
  }
  
  // Simple balance check
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    coverageScore: warnings.length > 0 ? 0.7 : 1.0
  };
}

export function extractComponents(results: Record<string, string>): string[] {
  const componentRegex = /(?:export\s+(?:default\s+)?)?(?:class|function|const)\s+(\w+)(?:\s+extends\s+React\.Component|\s*:\s*React\.FC|\s*=\s*\([^)]*\)\s*=>\s*)/g;
  const components: string[] = [];
  
  for (const [phase, content] of Object.entries(results)) {
    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      components.push(match[1]);
    }
  }
  
  return [...new Set(components)]; // Remove duplicates
}

export function extractTypes(results: Record<string, string>): Record<string, string> {
  const types: Record<string, string> = {};
  const typeRegex = /(?:export\s+)?(?:type|interface)\s+(\w+)(?:<[^>]*>)?\s*=?\s*(?:{[^}]*}|[^;]*);?/g;
  
  for (const [phase, content] of Object.entries(results)) {
    let match;
    while ((match = typeRegex.exec(content)) !== null) {
      const typeName = match[1];
      const typeDefinition = match[0];
      types[typeName] = typeDefinition;
    }
  }
  
  return types;
}
