
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

// Abstract LLM Provider definition
export abstract class LLMProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract generate(prompt: PromptBlueprint): Promise<AsyncGenerator<PromptChunk>>;
  abstract validateResponse(response: unknown): boolean;
}

// Circuit Breaker Pattern
export class CircuitBreaker {
  private failureThreshold: number;
  private recoveryTime: number;
  private failures: number = 0;
  private lastFailureTime?: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(threshold = 3, recoveryTimeMs = 30000) {
    this.failureThreshold = threshold;
    this.recoveryTime = recoveryTimeMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.lastFailureTime || 0);
      if (timeSinceLastFailure < this.recoveryTime) {
        throw new Error('Circuit is OPEN. Request blocked.');
      }
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = undefined;
  }
}
