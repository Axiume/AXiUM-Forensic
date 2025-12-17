export type Language = 'en' | 'fa';

export interface Article {
  id: string;
  title: string;
  image: string; // Base64 or URL
  content: string;
  hashtags: string[];
  date: string;
}

export interface Message {
  id: string;
  email: string;
  content: string;
  date: string;
  read: boolean;
}

export interface AppSettings {
  apiKey: string;
  model: string;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

export interface AnalysisResult {
  is_ai_generated: boolean;
  confidence_score: number;
  chart_data: ChartDataItem[];
  detailed_analysis: string;
}

export interface Translation {
  title: string;
  subtitle: string;
  upload_drop: string;
  upload_btn: string;
  analyzing: string;
  results_title: string;
  confidence: string;
  verdict_ai: string;
  verdict_real: string;
  admin_login: string;
  contact_us: string;
  send: string;
  blog_title: string;
  footer_rights: string;
}