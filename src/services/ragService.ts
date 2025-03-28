
import { GithubRepo, GithubAuth, fetchRepoContents, fetchFileContent } from "@/services/githubService";
import { toast } from "@/hooks/use-toast";

interface FileIndex {
  path: string;
  content: string;
  embedding?: number[];
}

interface RepoRAG {
  repoId: string; // Format: owner/repo/branch
  files: FileIndex[];
  lastUpdated: Date;
}

// In-memory storage for RAG data
// In a production app, this would be persistent storage
const ragStorage: Record<string, RepoRAG> = {};

// Simple text chunking for large files
const chunkText = (text: string, maxChunkSize = 1000): string[] => {
  const chunks: string[] = [];
  let startIdx = 0;
  
  while (startIdx < text.length) {
    const endIdx = Math.min(startIdx + maxChunkSize, text.length);
    chunks.push(text.substring(startIdx, endIdx));
    startIdx = endIdx;
  }
  
  return chunks;
};

// Create a repository ID from repo info
const createRepoId = (repo: GithubRepo): string => {
  return `${repo.owner}/${repo.repo}/${repo.branch}`;
};

// Build RAG index for a repository
export const buildRepoRAG = async (
  repo: GithubRepo,
  auth?: GithubAuth,
  progressCallback?: (progress: number) => void
): Promise<boolean> => {
  try {
    const repoId = createRepoId(repo);
    
    // Start with an empty index
    const ragIndex: RepoRAG = {
      repoId,
      files: [],
      lastUpdated: new Date()
    };
    
    // Get all files recursively
    const allFiles = await getAllRepoFiles(repo, "", auth);
    const totalFiles = allFiles.length;
    
    // Process each file
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      
      // Skip binary files, large files, and non-code files
      if (shouldSkipFile(file.path)) {
        continue;
      }
      
      // Get file content
      const content = await fetchFileContent(repo, file.path, auth);
      
      if (content) {
        // Add to index
        ragIndex.files.push({
          path: file.path,
          content: content,
        });
      }
      
      // Report progress
      if (progressCallback) {
        progressCallback((i + 1) / totalFiles);
      }
    }
    
    // Store the index
    ragStorage[repoId] = ragIndex;
    
    console.log(`Built RAG index for ${repoId} with ${ragIndex.files.length} files`);
    return true;
  } catch (error) {
    console.error("Error building RAG index:", error);
    toast({
      title: "RAG Error",
      description: "Failed to build repository index",
      variant: "destructive"
    });
    return false;
  }
};

// Helper to recursively get all files in a repo
const getAllRepoFiles = async (
  repo: GithubRepo,
  path: string = "",
  auth?: GithubAuth
): Promise<{ path: string; type: string }[]> => {
  const items = await fetchRepoContents(repo, path, auth);
  let result: { path: string; type: string }[] = [];
  
  for (const item of items) {
    if (item.type === "dir") {
      // Recursively get files in directory
      const subItems = await getAllRepoFiles(repo, item.path, auth);
      result = [...result, ...subItems];
    } else {
      result.push({ path: item.path, type: item.type });
    }
  }
  
  return result;
};

// Helper to skip certain file types
const shouldSkipFile = (path: string): boolean => {
  // Skip binary files, large files, node_modules, etc.
  const skipExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".pdf", 
    ".zip", ".tar", ".gz", ".exe", ".dll", ".so", ".dylib"
  ];
  
  const skipPaths = [
    "node_modules/", 
    "dist/", 
    "build/", 
    ".git/"
  ];
  
  // Check path
  for (const skipPath of skipPaths) {
    if (path.includes(skipPath)) {
      return true;
    }
  }
  
  // Check extension
  for (const ext of skipExtensions) {
    if (path.endsWith(ext)) {
      return true;
    }
  }
  
  return false;
};

// Get RAG for a repository
export const getRepoRAG = (repo: GithubRepo): RepoRAG | null => {
  const repoId = createRepoId(repo);
  return ragStorage[repoId] || null;
};

// Simple retrieval function to get relevant context from the RAG
export const retrieveRelevantContext = (
  repo: GithubRepo,
  query: string,
  maxResults: number = 3
): string => {
  const rag = getRepoRAG(repo);
  
  if (!rag || rag.files.length === 0) {
    return "No repository context available. Please build the RAG index first.";
  }
  
  // Simple keyword search (in a real app, you'd use vector embeddings here)
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
  
  // Score each file
  const scoredFiles = rag.files.map(file => {
    const content = file.content.toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        score += 1;
      }
      
      // Bonus for keyword in filename
      if (file.path.toLowerCase().includes(keyword)) {
        score += 2;
      }
    }
    
    return { file, score };
  });
  
  // Sort by score and take top results
  const relevantFiles = scoredFiles
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  if (relevantFiles.length === 0) {
    return "No relevant files found for your query.";
  }
  
  // Format context
  let context = "Relevant files from the repository:\n\n";
  
  relevantFiles.forEach((item, index) => {
    const file = item.file;
    context += `[${index + 1}] ${file.path}\n\`\`\`\n${trimFileContent(file.content, 500)}\n\`\`\`\n\n`;
  });
  
  return context;
};

// Helper to trim content to a reasonable size
const trimFileContent = (content: string, maxLength: number): string => {
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength) + "... (content truncated)";
};

// Clear RAG data for a repository
export const clearRepoRAG = (repo: GithubRepo): void => {
  const repoId = createRepoId(repo);
  delete ragStorage[repoId];
};
