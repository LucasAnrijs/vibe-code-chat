
import { toast } from "@/hooks/use-toast";

export interface GithubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  sha: string;
}

export interface GithubRepo {
  owner: string;
  repo: string;
  branch: string;
}

// Parse GitHub URL to extract owner, repo, and branch
export const parseGithubUrl = (url: string): GithubRepo | null => {
  try {
    // Handle formats like:
    // https://github.com/username/repo
    // https://github.com/username/repo/tree/branch
    const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/;
    const match = url.match(regex);
    
    if (!match) return null;
    
    return {
      owner: match[1],
      repo: match[2],
      branch: match[3] || 'main', // Default to 'main' if branch is not specified
    };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
};

// Fetch repository contents (files and directories)
export const fetchRepoContents = async (
  repo: GithubRepo, 
  path: string = ''
): Promise<GithubFile[]> => {
  try {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${repo.branch}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle both single file and directory responses
    const files = Array.isArray(data) ? data : [data];
    
    return files.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      sha: file.sha,
    }));
  } catch (error) {
    console.error('Error fetching repo contents:', error);
    toast({
      title: "Error",
      description: `Failed to fetch repository contents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
    return [];
  }
};

// Fetch file content
export const fetchFileContent = async (
  repo: GithubRepo,
  filePath: string
): Promise<string | null> => {
  try {
    const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${filePath}?ref=${repo.branch}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // GitHub API returns file content as base64
    if (data.content) {
      return atob(data.content.replace(/\n/g, ''));
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching file content:', error);
    toast({
      title: "Error",
      description: `Failed to fetch file content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
    return null;
  }
};
