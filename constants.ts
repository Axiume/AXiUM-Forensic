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
    footer_credit: "Designed & Developed by AMIR TAHERI",
    footer_rights: "ALL SYSTEMS OPERATIONAL. COPYRIGHT 2024.",
    how_it_works: "OPERATIONAL PROTOCOL",
    step_1: "UPLOAD EVIDENCE",
    step_1_desc: "Securely transmit image data to the neural core.",
    step_2: "NEURAL SCAN",
    step_2_desc: "Deep learning algorithms analyze pixel artifacts.",
    step_3: "FORENSIC REPORT",
    step_3_desc: "Receive detailed classification and confidence metrics.",
    download_report: "EXPORT JSON",
    history_title: "RECENT SCANS",
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
    footer_credit: "طراحی و توسعه توسط امیر طاهری",
    footer_rights: "تمام سیستم‌ها فعال هستند. کپی‌رایت ۲۰۲۴.",
    how_it_works: "پروتکل عملیاتی",
    step_1: "آپلود شواهد",
    step_1_desc: "انتقال امن داده‌های تصویری به هسته عصبی.",
    step_2: "اسکن عصبی",
    step_2_desc: "الگوریتم‌های یادگیری عمیق مصنوعات پیکسلی را تحلیل می‌کنند.",
    step_3: "گزارش جرم‌شناسی",
    step_3_desc: "دریافت طبقه‌بندی دقیق و معیارهای اطمینان.",
    download_report: "خروجی JSON",
    history_title: "اسکن‌های اخیر",
  }
};

export const INITIAL_SETTINGS = {
  apiKey: "",
  model: "gemini-2.5-flash",
  socialLinks: {
    instagram: "",
    twitter: "",
    facebook: "",
    telegram: ""
  }
};

export const MOCK_ARTICLES = [
  {
    id: "1",
    title: "The Rise of GANs in 2024",
    image: "https://picsum.photos/800/400",
    content: "Generative Adversarial Networks are evolving rapidly. Forensic experts are seeing new artifacts in frequency domains. This comprehensive study reveals the subtle inconsistencies in lighting shadows that modern GANs still struggle to replicate perfectly...",
    hashtags: ["#AI", "#Forensics", "#Security"],
    date: "2024-05-15"
  }
];