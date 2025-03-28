
import { 
  LLMProvider, 
  PromptBlueprint, 
  CodeArtifact, 
  CircuitBreaker, 
  GenerationStage 
} from "@/lib/agent-types";
import { CodeParsingService } from "./CodeParsingService";
import { toast } from "@/hooks/use-toast";
import { PromptEngineeringService } from "./PromptEngineeringService";
import { DatabaseGenerationService } from "./DatabaseGenerationService";
import { FileOrganizationService } from "./FileOrganizationService";

/**
 * Main service for generating code using LLM providers
 */
export class CodeGenerationService {
  private providers: LLMProvider[];
  private promptService: PromptEngineeringService;
  private circuitBreaker: CircuitBreaker;
  private codeParser: CodeParsingService;
  private databaseService: DatabaseGenerationService;
  private fileOrganizationService: FileOrganizationService;

  constructor(providers: LLMProvider[]) {
    this.providers = providers;
    this.promptService = new PromptEngineeringService();
    this.circuitBreaker = new CircuitBreaker();
    this.codeParser = new CodeParsingService();
    this.databaseService = new DatabaseGenerationService();
    this.fileOrganizationService = new FileOrganizationService();
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

  async generateFilesFromArchitecture(architecture: string, constraints?: string[]): Promise<CodeArtifact | null> {
    if (this.providers.length === 0) {
      toast({
        title: "No Providers Available",
        description: "Add at least one AI provider to generate code.",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Initialize providers
      await Promise.all(
        this.providers.map(provider => provider.initialize())
      );
      
      // Parse the architecture to identify components/modules
      const lines = architecture.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));
      
      // Organize by file paths for logical generation order
      const filePaths = this.fileOrganizationService.organizeFilePathsByHierarchy(lines);
      
      const files: Record<string, string> = {};
      
      // Get database schema if available
      const databaseSchema = localStorage.getItem('database_schema');
      const databaseType = localStorage.getItem('database_type') || 'prisma';
      
      // Generate database files first if schema exists
      if (databaseSchema) {
        await this.databaseService.generateDatabaseFiles(this.providers, databaseSchema, databaseType, files);
      }
      
      // Track generation progress
      let completedFiles = 0;
      const totalFiles = filePaths.length;
      
      toast({
        title: "Starting File Generation",
        description: `Generating ${totalFiles} files from architecture...`,
      });
      
      // Process files in order
      for (const filePath of filePaths) {
        // Skip empty paths
        if (!filePath.trim()) continue;
        
        // Skip database files that we've already generated
        if ((filePath.includes('/db/') || filePath.includes('/prisma/')) && databaseSchema) {
          continue;
        }
        
        const result = await this.circuitBreaker.execute(async () => {
          // Create context from previously generated files
          const filesContext = this.fileOrganizationService.createFilesContext(files, filePath);
          
          // Add database context to the blueprint if we have schema
          const dbContext = databaseSchema ? 
            `\n\nDatabase Schema: ${databaseSchema}\nDatabase Type: ${databaseType}` : '';
            
          const blueprint: PromptBlueprint = {
            context: `Generate file: ${filePath}\n\nFull architecture context: ${architecture}${dbContext}`,
            stage: 'implementation',
            requirements: [],
            constraints: {
              filePath: filePath,
              totalFiles: totalFiles,
              completedFiles: completedFiles,
              additionalConstraints: constraints,
              databaseType: databaseType,
              hasDatabaseSchema: !!databaseSchema,
              filesContext: filesContext
            }
          };
          
          completedFiles++;
          
          for (const provider of this.providers) {
            try {
              toast({
                title: "Generating File",
                description: `Processing ${filePath} (${completedFiles}/${totalFiles})`,
              });
              
              const generationStream = provider.generate(blueprint);
              let fullResponse = '';
              
              for await (const chunk of generationStream) {
                fullResponse += chunk.content;
              }
              
              if (provider.validateResponse(fullResponse)) {
                // Parse the code blocks from response
                const generatedFiles = this.codeParser.parseCodeBlocks(fullResponse);
                
                // Add to our files collection
                Object.assign(files, generatedFiles);
                
                return true;
              }
            } catch (error) {
              console.warn(`Provider ${provider.constructor.name} failed for file ${filePath}:`, error);
            }
          }
          
          return false;
        });
        
        if (!result) {
          toast({
            title: "Generation Failed",
            description: `Failed to generate code for: ${filePath}`,
            variant: "destructive"
          });
        }
      }
      
      if (Object.keys(files).length === 0) {
        toast({
          title: "No Files Generated",
          description: "The process did not generate any valid files.",
          variant: "destructive"
        });
        return null;
      }
      
      toast({
        title: "Generation Complete",
        description: `Successfully generated ${Object.keys(files).length} files`,
      });
      
      return {
        files,
        metadata: {
          generatedAt: new Date(),
          providerUsed: this.providers.map(p => p.constructor.name).join(", "),
          stage: 'implementation'
        }
      };
    } catch (error) {
      console.error("Architecture-based generation failed:", error);
      toast({
        title: "Generation Error",
        description: "Failed to process the architecture and generate files.",
        variant: "destructive"
      });
      return null;
    }
  }
}
