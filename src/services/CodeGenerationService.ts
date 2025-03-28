
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
    const template = this.templates[blueprint.stage];
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
      const filePaths = this.organizeFilePathsByHierarchy(lines);
      
      const files: Record<string, string> = {};
      
      // Get database schema if available
      const databaseSchema = localStorage.getItem('database_schema');
      const databaseType = localStorage.getItem('database_type') || 'prisma';
      
      // Generate database files first if schema exists
      if (databaseSchema) {
        await this.generateDatabaseFiles(databaseSchema, databaseType, files);
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
          const filesContext = this.createFilesContext(files, filePath);
          
          // Add database context to the blueprint if we have schema
          const dbContext = databaseSchema ? 
            `\n\nDatabase Schema: ${databaseSchema}\nDatabase Type: ${databaseType}` : '';
            
          const blueprint: PromptBlueprint = {
            context: `Generate file: ${filePath}\n\nFull architecture context: ${architecture}${dbContext}`,
            stage: 'implementation_with_context',
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

  /**
   * Creates context from previously generated files to help with coherent generation
   */
  private createFilesContext(files: Record<string, string>, currentFilePath: string): string {
    if (Object.keys(files).length === 0) {
      return "No files generated yet.";
    }
    
    // Get related files based on path similarity
    const currentDir = currentFilePath.includes('/') 
      ? currentFilePath.substring(0, currentFilePath.lastIndexOf('/')) 
      : '';
    
    // Find related files in the same directory or parent directories
    const relatedFiles: string[] = [];
    
    // First add type definitions if the file is a component
    const typeFiles = Object.keys(files).filter(path => 
      path.includes('types.ts') || path.includes('.d.ts')
    );
    
    // Then add files from the same directory
    const sameDirectoryFiles = Object.keys(files).filter(path => {
      const fileDir = path.includes('/') 
        ? path.substring(0, path.lastIndexOf('/')) 
        : '';
      return fileDir === currentDir;
    });
    
    // Get utility or shared files
    const utilityFiles = Object.keys(files).filter(path => 
      path.includes('/utils/') || path.includes('/lib/') || path.includes('/hooks/')
    );
    
    // Combine and remove duplicates
    const combinedFiles = [...typeFiles, ...sameDirectoryFiles, ...utilityFiles];
    const uniqueFiles = [...new Set(combinedFiles)];
    
    // Limit to 5 most relevant files to avoid token limits
    const contextFiles = uniqueFiles.slice(0, 5);
    
    let context = `Previously generated files (${contextFiles.length}/${Object.keys(files).length} shown):\n\n`;
    
    for (const file of contextFiles) {
      context += `File: ${file}\n\`\`\`typescript\n${files[file]}\n\`\`\`\n\n`;
    }
    
    return context;
  }

  /**
   * Organizes file paths in a logical generation order
   */
  private organizeFilePathsByHierarchy(lines: string[]): string[] {
    // Group files by type for logical ordering
    const configFiles: string[] = [];
    const typeFiles: string[] = [];
    const utilityFiles: string[] = [];
    const hookFiles: string[] = [];
    const componentFiles: string[] = [];
    const pageFiles: string[] = [];
    const otherFiles: string[] = [];
    
    for (const line of lines) {
      // Clean up the line
      const filePath = line.replace(/├─|└─|│\s+/g, '').trim();
      
      // Categorize files
      if (filePath.includes('/config/') || filePath.endsWith('.config.ts')) {
        configFiles.push(filePath);
      } else if (filePath.includes('types.ts') || filePath.includes('.d.ts')) {
        typeFiles.push(filePath);
      } else if (filePath.includes('/utils/') || filePath.includes('/lib/')) {
        utilityFiles.push(filePath);
      } else if (filePath.includes('/hooks/')) {
        hookFiles.push(filePath);
      } else if (filePath.includes('/components/')) {
        componentFiles.push(filePath);
      } else if (filePath.includes('/pages/')) {
        pageFiles.push(filePath);
      } else {
        otherFiles.push(filePath);
      }
    }
    
    // Return files in logical generation order
    return [
      ...configFiles,
      ...typeFiles,
      ...utilityFiles,
      ...hookFiles,
      ...componentFiles,
      ...pageFiles,
      ...otherFiles
    ];
  }

  private async generateDatabaseFiles(
    schema: string, 
    dbType: string, 
    targetFiles: Record<string, string>
  ): Promise<boolean> {
    try {
      toast({
        title: "Generating Database",
        description: "Creating database schema and models...",
      });
      
      for (const provider of this.providers) {
        try {
          // Create specific DB generation prompts based on db type
          const dbBlueprint: PromptBlueprint = {
            context: `Generate database files for:\n${schema}\n\nUsing database type: ${dbType}`,
            stage: 'implementation',
            requirements: [],
            constraints: {
              databaseType: dbType,
              task: "generate_database_files"
            }
          };
          
          // For Prisma specifically, generate schema.prisma
          if (dbType === 'prisma') {
            const prismaBlueprint: PromptBlueprint = {
              context: `Convert this schema definition to a Prisma schema file:\n${schema}`,
              stage: 'implementation',
              requirements: [],
              constraints: {
                databaseType: "prisma",
                task: "generate_prisma_schema"
              }
            };
            
            const generationStream = provider.generate(prismaBlueprint);
            let fullResponse = '';
            
            for await (const chunk of generationStream) {
              fullResponse += chunk.content;
            }
            
            if (provider.validateResponse(fullResponse)) {
              const generatedFiles = this.codeParser.parseCodeBlocks(fullResponse);
              Object.assign(targetFiles, generatedFiles);
              
              // Also generate the client file
              const clientBlueprint: PromptBlueprint = {
                context: `Generate a Prisma client setup file based on this schema:\n${schema}`,
                stage: 'implementation',
                requirements: [],
                constraints: {
                  databaseType: "prisma",
                  task: "generate_prisma_client"
                }
              };
              
              const clientStream = provider.generate(clientBlueprint);
              let clientResponse = '';
              
              for await (const chunk of clientStream) {
                clientResponse += chunk.content;
              }
              
              if (provider.validateResponse(clientResponse)) {
                const clientFiles = this.codeParser.parseCodeBlocks(clientResponse);
                Object.assign(targetFiles, clientFiles);
              }
            }
          } else {
            // For MongoDB or TypeORM
            const generationStream = provider.generate(dbBlueprint);
            let fullResponse = '';
            
            for await (const chunk of generationStream) {
              fullResponse += chunk.content;
            }
            
            if (provider.validateResponse(fullResponse)) {
              const generatedFiles = this.codeParser.parseCodeBlocks(fullResponse);
              Object.assign(targetFiles, generatedFiles);
            }
          }
          
          // Also generate sample API routes for the models
          const apiBlueprint: PromptBlueprint = {
            context: `Generate RESTful API route handlers for this schema:\n${schema}\n\nUsing database type: ${dbType}`,
            stage: 'implementation',
            requirements: [],
            constraints: {
              databaseType: dbType,
              task: "generate_api_routes"
            }
          };
          
          const apiStream = provider.generate(apiBlueprint);
          let apiResponse = '';
          
          for await (const chunk of apiStream) {
            apiResponse += chunk.content;
          }
          
          if (provider.validateResponse(apiResponse)) {
            const apiFiles = this.codeParser.parseCodeBlocks(apiResponse);
            Object.assign(targetFiles, apiFiles);
          }
          
          return true;
        } catch (error) {
          console.warn(`Provider ${provider.constructor.name} failed for database generation:`, error);
          // Continue with next provider
        }
      }
      
      // If we got here, all providers failed
      return false;
    } catch (error) {
      console.error("Database generation failed:", error);
      toast({
        title: "Database Generation Error",
        description: "Failed to generate database files.",
        variant: "destructive"
      });
      return false;
    }
  }
}
