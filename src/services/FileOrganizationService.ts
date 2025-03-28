
/**
 * Service for organizing and managing file generation order
 */
export class FileOrganizationService {
  /**
   * Creates context from previously generated files to help with coherent generation
   */
  createFilesContext(files: Record<string, string>, currentFilePath: string): string {
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
  organizeFilePathsByHierarchy(lines: string[]): string[] {
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
}
