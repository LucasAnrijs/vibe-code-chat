
import { toast } from "@/hooks/use-toast";

export class CodeParsingService {
  /**
   * Parse code blocks from LLM text responses
   * @param response Raw text from LLM
   * @returns Object mapping filenames to file contents
   */
  parseCodeBlocks(response: string): Record<string, string> {
    const files: Record<string, string> = {};
    
    try {
      // Extract code blocks with filenames in markdown format
      // Example: ```typescript:filename.ts
      const fileBlockRegex = /```(?:(\w+):)?([a-zA-Z0-9_\-\.]+)?\n([\s\S]*?)```/g;
      let match;
      let fileCounter = 0;
      
      while ((match = fileBlockRegex.exec(response)) !== null) {
        const language = match[1] || "";
        let filename = match[2];
        const code = match[3].trim();
        
        // Generate filename if not provided
        if (!filename) {
          fileCounter++;
          filename = this.generateFilename(language, fileCounter);
        }
        
        files[filename] = code;
      }
      
      // If no specific file blocks found, look for any code blocks
      if (Object.keys(files).length === 0) {
        const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
        fileCounter = 0;
        
        while ((match = codeBlockRegex.exec(response)) !== null) {
          fileCounter++;
          const code = match[1].trim();
          const filename = `file${fileCounter}.txt`;
          files[filename] = code;
        }
      }
      
      // If still no code blocks, try to extract based on indentation
      if (Object.keys(files).length === 0) {
        const lines = response.split('\n');
        let currentFileName: string | null = null;
        let currentFileContent: string[] = [];
        
        for (const line of lines) {
          if (line.trim().match(/^[\w\-\.]+\.(js|ts|jsx|tsx|json|md|html|css):\s*$/i)) {
            // New file indicator
            if (currentFileName && currentFileContent.length > 0) {
              files[currentFileName] = currentFileContent.join('\n');
            }
            
            currentFileName = line.trim().split(':')[0];
            currentFileContent = [];
          } else if (currentFileName) {
            currentFileContent.push(line);
          }
        }
        
        // Save the last file if exists
        if (currentFileName && currentFileContent.length > 0) {
          files[currentFileName] = currentFileContent.join('\n');
        }
      }
      
      // Last resort: if still no files extracted, use the whole response
      if (Object.keys(files).length === 0) {
        files['main.txt'] = response;
      }
      
      return files;
    } catch (error) {
      console.error("Error parsing code blocks:", error);
      toast({
        title: "Parsing Error",
        description: "Failed to parse code blocks from the response.",
        variant: "destructive"
      });
      
      // Return the whole response as a single file in case of error
      return { 'response.txt': response };
    }
  }

  /**
   * Generate a filename based on the language and counter
   */
  private generateFilename(language: string, counter: number): string {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'ts':
        return `file${counter}.ts`;
      case 'javascript':
      case 'js':
        return `file${counter}.js`;
      case 'jsx':
        return `file${counter}.jsx`;
      case 'tsx':
        return `file${counter}.tsx`;
      case 'json':
        return `file${counter}.json`;
      case 'html':
        return `file${counter}.html`;
      case 'css':
        return `file${counter}.css`;
      case 'markdown':
      case 'md':
        return `file${counter}.md`;
      default:
        return `file${counter}.txt`;
    }
  }

  /**
   * Enhanced code validation
   */
  validateCode(files: Record<string, string>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if any files were extracted
    if (Object.keys(files).length === 0) {
      errors.push("No code files were extracted from the response.");
      return { isValid: false, errors };
    }
    
    // Validate each file based on extension
    for (const [filename, content] of Object.entries(files)) {
      // Check for empty content
      if (!content.trim()) {
        errors.push(`${filename} has empty content.`);
        continue;
      }
      
      // Basic validation for JavaScript/TypeScript files
      if (filename.match(/\.(js|ts|jsx|tsx)$/)) {
        // Check for balanced brackets
        if (!this.hasBalancedBrackets(content)) {
          errors.push(`${filename} has unbalanced brackets or parentheses.`);
        }
        
        // Check for semicolons
        if (content.includes(';') && content.split('\n').some(line => 
          line.trim() && !line.trim().startsWith('//') && !line.includes(';') && 
          !line.trim().endsWith('{') && !line.trim().endsWith('}'))) {
          errors.push(`${filename} has inconsistent semicolon usage.`);
        }
      }
      
      // Basic validation for JSON files
      if (filename.match(/\.json$/)) {
        try {
          JSON.parse(content);
        } catch {
          errors.push(`${filename} contains invalid JSON.`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if code has balanced brackets, parentheses, and braces
   */
  private hasBalancedBrackets(code: string): boolean {
    const stack: string[] = [];
    const brackets: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}'
    };
    
    // Remove string literals and comments to avoid false positives
    const cleanCode = code
      .replace(/"(?:\\.|[^"\\])*"/g, '')
      .replace(/'(?:\\.|[^'\\])*'/g, '')
      .replace(/`(?:\\.|[^`\\])*`/g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    
    for (const char of cleanCode) {
      if (['(', '[', '{'].includes(char)) {
        stack.push(char);
      } else if ([')', ']', '}'].includes(char)) {
        const lastBracket = stack.pop();
        
        if (!lastBracket || brackets[lastBracket] !== char) {
          return false;
        }
      }
    }
    
    return stack.length === 0;
  }
}
