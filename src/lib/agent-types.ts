
export type ProviderType = 'openai' | 'anthropic' | 'local';
export type GenerationStage = 'analysis' | 'architecture' | 'implementation';

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  endpoint?: string;
  rateLimit?: number;
}

export interface PromptBlueprint {
  context: string;
  stage: GenerationStage;
  requirements: string[];
  constraints: Record<string, unknown>;
}

export interface PromptChunk {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface CodeArtifact {
  files: Record<string, string>;
  metadata: {
    generatedAt: Date;
    providerUsed: string;
    stage: GenerationStage;
  };
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  coverageScore?: number;
}
