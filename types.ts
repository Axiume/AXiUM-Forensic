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
    instagram: string;
    twitter: string;
    facebook: string;
    telegram: string;
  };
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
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
  footer_credit: string;
  footer_rights: string;
  how_it_works: string;
  step_1: string;
  step_1_desc: string;
  step_2: string;
  step_2_desc: string;
  step_3: string;
  step_3_desc: string;
  download_report: string;
  history_title: string;
}