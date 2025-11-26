export enum AnalysisStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Success = 'SUCCESS',
  Error = 'ERROR',
}

export type SummaryLength = 'short' | 'medium' | 'comprehensive';

export interface VideoAnalysis {
  id: string;
  url: string;
  status: AnalysisStatus;
  summaryLength: SummaryLength;
  summary?: string;
  error?: string;
  title?: string;
}


