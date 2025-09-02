export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  level: number;
  color?: string;
  x?: number;
  y?: number;
}

export interface ProcessedContent {
  title: string;
  mindMap: MindMapNode;
}

export interface InputData {
  type: 'text' | 'url' | 'video';
  content: string;
}

export interface MindMapConfig {
  theme: 'light' | 'dark';
  nodeColors: string[];
  fontSize: number;
  nodeSpacing: number;
}