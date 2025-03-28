
import { LLMProvider, PromptBlueprint } from "@/lib/agent-types";
import { toast } from "@/hooks/use-toast";
import { CodeParsingService } from "./CodeParsingService";

/**
 * Service for generating database-related files
 */
export class DatabaseGenerationService {
  private codeParser: CodeParsingService;
  
  constructor() {
    this.codeParser = new CodeParsingService();
  }
  
  async generateDatabaseFiles(
    providers: LLMProvider[],
    schema: string, 
    dbType: string, 
    targetFiles: Record<string, string>
  ): Promise<boolean> {
    try {
      toast({
        title: "Generating Database",
        description: "Creating database schema and models...",
      });
      
      for (const provider of providers) {
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
