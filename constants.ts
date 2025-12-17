import { Translation, Language } from './types';

export const DICTIONARY: Record<Language, Translation> = {
  en: {
    title: "FORENSIC.AI",
    subtitle: "Advanced Deepfake & Anomaly Detection System",
    upload_drop: "DROP EVIDENCE HERE",
    upload_btn: "INITIATE SCAN",
    analyzing: "SYSTEM PROCESSING... DO NOT INTERRUPT",
    results_title: "ANALYSIS REPORT",
    confidence: "CONFIDENCE LEVEL",
    verdict_ai: "SYNTHETIC MEDIA DETECTED",
    verdict_real: "AUTHENTIC MEDIA CONFIRMED",
    admin_login: "RESTRICTED ACCESS",
    contact_us: "ENCRYPTED CHANNEL",
    send: "TRANSMIT MESSAGE",
    blog_title: "INTELLIGENCE LOGS",
    footer_rights: "ALL SYSTEMS OPERATIONAL. COPYRIGHT 2024.",
  },
  fa: {
    title: "فارنزیک.هوش‌مصنوعی",
    subtitle: "سیستم پیشرفته تشخیص دیپ‌فیک و ناهنجاری",
    upload_drop: "شواهد را اینجا رها کنید",
    upload_btn: "شروع اسکن",
    analyzing: "سیستم در حال پردازش... قطع نکنید",
    results_title: "گزارش تحلیل",
    confidence: "سطح اطمینان",
    verdict_ai: "رسانه مصنوعی شناسایی شد",
    verdict_real: "رسانه معتبر تایید شد",
    admin_login: "دسترسی محدود",
    contact_us: "کانال رمزگذاری شده",
    send: "ارسال پیام",
    blog_title: "گزارش‌های اطلاعاتی",
    footer_rights: "تمام سیستم‌ها فعال هستند. کپی‌رایت ۲۰۲۴.",
  }
};

export const INITIAL_SETTINGS = {
  apiKey: "",
  model: "gemini-2.5-flash",
  socialLinks: {
    twitter: "",
    github: "",
    linkedin: ""
  }
};

export const MOCK_ARTICLES = [
  {
    id: "1",
    title: "The Rise of GANs in 2024",
    image: "https://picsum.photos/800/400",
    content: "Generative Adversarial Networks are evolving rapidly. Forensic experts are seeing new artifacts in frequency domains...",
    hashtags: ["#AI", "#Forensics", "#Security"],
    date: "2024-05-15"
  }
];