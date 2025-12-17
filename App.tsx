import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, Upload, AlertTriangle, Terminal, Lock, LogOut, 
  Settings as SettingsIcon, LayoutDashboard, Mail, FileText,
  CheckCircle, Globe, Send, X, ChevronRight, Download, History,
  Instagram, Facebook, Twitter, Database, Cpu, Search
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLocalStorageDB } from './hooks/useLocalStorageDB';
import { analyzeImage } from './services/geminiService';
import { DICTIONARY } from './constants';
import { Language, AnalysisResult, Article } from './types';

// --- Sub-Components ---

const LoadingScan = () => (
  <div className="relative w-full h-64 bg-black/50 border border-cyber-green/30 rounded-lg overflow-hidden flex items-center justify-center group">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
    {/* Scan Line Animation */}
    <motion.div 
      className="absolute top-0 left-0 w-full h-1 bg-cyber-green shadow-[0_0_20px_#00FFA3] z-20"
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
    />
    {/* Grid Background Effect */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FFA305_1px,transparent_1px),linear-gradient(to_bottom,#00FFA305_1px,transparent_1px)] bg-[size:20px_20px]" />
    
    <div className="flex flex-col items-center z-10 p-6 bg-black/80 backdrop-blur-sm rounded border border-cyber-green/20">
      <Scan className="w-16 h-16 text-cyber-green animate-pulse mb-4" />
      <p className="text-cyber-green font-mono text-lg animate-pulse tracking-widest">INITIALIZING DEEP SCAN...</p>
      <div className="mt-2 text-xs text-cyber-green/60 font-mono">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>Checking sector 0x{Math.floor(Math.random() * 9999)}... OK</div>
        ))}
      </div>
    </div>
  </div>
);

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 5); // Faster typing
    return () => clearInterval(timer);
  }, [text]);

  return <p className="text-sm md:text-base leading-relaxed text-gray-300 whitespace-pre-wrap">{displayed}<span className="animate-blink text-cyber-green">_</span></p>;
};

const ArticleModal = ({ article, onClose }: { article: Article, onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="relative w-full max-w-2xl bg-black border border-cyber-green/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,163,0.1)] max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-cyber-green z-10 bg-black/50 p-1 rounded-full"><X className="w-6 h-6" /></button>
      <div className="h-64 relative">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold text-white mb-2">{article.title}</h2>
            <div className="flex gap-2 text-xs text-cyber-green font-mono">
              {article.hashtags.map(tag => <span key={tag} className="bg-cyber-green/10 px-2 py-1 rounded border border-cyber-green/20">{tag}</span>)}
            </div>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="text-gray-500 text-xs font-mono">{article.date}</div>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{article.content}</p>
      </div>
    </motion.div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'admin' | 'login'>('home');
  const [auth, setAuth] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ u: '', p: '' });
  
  // Database & Translations
  const db = useLocalStorageDB();
  const t = DICTIONARY[lang];

  // Scanner State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<{img: string, date: string, verdict: boolean}[]>([]);

  // Admin State
  const [adminTab, setAdminTab] = useState<'settings' | 'articles' | 'inbox'>('settings');
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', content: '', hashtags: [], image: '' });
  
  // Blog State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Contact State
  const [contactForm, setContactForm] = useState({ email: '', content: '' });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cmsImageRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    // Dynamic Meta Theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#00FFA3');
  }, []);

  // Helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      setResult(null);
      setError(null);
    }
  };

  const handleCmsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setNewArticle({...newArticle, image: base64});
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    if (!db.settings.apiKey) {
      setError("SYSTEM_OFFLINE: API_KEY_MISSING. CONTACT ADMINISTRATOR.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeImage(selectedImage, db.settings.apiKey, db.settings.model);
      setResult(analysis);
      
      // Update History
      const newHistoryItem = { img: selectedImage, date: new Date().toLocaleTimeString(), verdict: analysis.is_ai_generated };
      setScanHistory(prev => [newHistoryItem, ...prev].slice(0, 3)); // Keep last 3
    } catch (err: any) {
      setError(`ANALYSIS FAILED: ${err.message || "UNKNOWN ERROR"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.u === 'awmili1204' && loginCreds.p === 'awmili1204') {
      setAuth(true);
      setView('admin');
      setLoginCreds({ u: '', p: '' });
    } else {
      alert("ACCESS DENIED");
    }
  };

  const handleSaveArticle = () => {
    if (!newArticle.title || !newArticle.content) return;
    db.addArticle({
      id: Date.now().toString(),
      title: newArticle.title!,
      content: newArticle.content!,
      image: newArticle.image || 'https://picsum.photos/800/400',
      hashtags: Array.isArray(newArticle.hashtags) ? newArticle.hashtags.map(t => t.trim()).filter(Boolean) : [],
      date: new Date().toISOString().split('T')[0]
    } as Article);
    setNewArticle({ title: '', content: '', hashtags: [], image: '' });
    if(cmsImageRef.current) cmsImageRef.current.value = "";
    alert("LOG ENTRY SAVED");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addMessage({
      id: Date.now().toString(),
      email: contactForm.email,
      content: contactForm.content,
      date: new Date().toISOString(),
      read: false
    });
    setContactForm({ email: '', content: '' });
    alert("TRANSMISSION SUCCESSFUL");
  };

  // Render Logic
  const fontClass = lang === 'fa' ? 'font-vazir' : 'font-mono';

  const renderNav = () => (
    <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
        <div className="relative">
            <Scan className="w-8 h-8 text-cyber-green group-hover:animate-spin" />
            <div className="absolute inset-0 bg-cyber-green/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col">
          <h1 className={`text-xl font-bold tracking-tighter text-white ${fontClass}`}>{t.title}</h1>
          <span className="text-[10px] text-cyber-green tracking-widest">VER 3.0.0 // PRO</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setLang(l => l === 'en' ? 'fa' : 'en')} className="p-2 text-white hover:text-cyber-green transition-colors border border-white/10 rounded">
          <Globe className="w-4 h-4" />
        </button>
        {auth ? (
          <button onClick={() => setView('admin')} className={`text-sm text-cyber-green hover:underline ${fontClass}`}>
            ADMIN_PANEL
          </button>
        ) : (
          <button onClick={() => setView('login')} className={`flex items-center gap-2 text-xs border border-white/20 px-3 py-1.5 rounded hover:bg-white/10 transition ${fontClass}`}>
            <Lock className="w-3 h-3" /> {t.admin_login}
          </button>
        )}
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className={`min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-24 ${fontClass}`}>
      
      {/* Hero / Scanner Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* History Sidebar */}
        {scanHistory.length > 0 && (
            <div className="lg:col-span-2 hidden lg:block space-y-4">
                <div className="flex items-center gap-2 text-cyber-green text-sm border-b border-white/10 pb-2 mb-2">
                    <History className="w-4 h-4" /> {t.history_title}
                </div>
                {scanHistory.map((h, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-2 rounded hover:border-cyber-green/30 transition cursor-pointer" onClick={() => setSelectedImage(h.img)}>
                        <img src={h.img} className="w-full h-16 object-cover rounded mb-2 opacity-70" alt="history" />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">{h.date}</span>
                            <div className={`w-2 h-2 rounded-full ${h.verdict ? 'bg-red-500' : 'bg-cyber-green'}`} />
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className={`${scanHistory.length > 0 ? 'lg:col-span-6' : 'lg:col-span-6'} space-y-6`}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              {lang === 'fa' ? 'کشف حقیقت.' : 'UNCOVER THE TRUTH.'}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-emerald-600">{lang === 'fa' ? 'تحلیل هوشمند' : 'AI FORENSICS'}</span>
            </h2>
            <p className="text-gray-400 max-w-md border-l-2 border-cyber-green pl-4">
              {t.subtitle}
            </p>
          </motion.div>

          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed ${selectedImage ? 'border-cyber-green' : 'border-white/20'} bg-black/40 backdrop-blur-sm rounded-xl p-8 text-center transition-all hover:border-cyber-green/50 cursor-pointer relative overflow-hidden group min-h-[300px] flex flex-col justify-center`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                 const base64 = await fileToBase64(file);
                 setSelectedImage(base64);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
            <div className="absolute inset-0 bg-cyber-green/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {selectedImage ? (
              <img src={selectedImage} alt="Analysis Target" className="max-h-64 mx-auto rounded shadow-[0_0_20px_rgba(0,255,163,0.2)]" />
            ) : (
              <div className="py-8 flex flex-col items-center gap-4 text-gray-500">
                <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-cyber-green" />
                </div>
                <p className="text-sm tracking-widest">{t.upload_drop}</p>
                <span className="text-xs text-gray-600 bg-black/50 px-2 py-1 rounded">JPG, PNG, WEBP SUPPORTED</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className="w-full bg-cyber-green text-black font-bold py-4 rounded font-mono hover:bg-[#00cc82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,163,0.4)] hover:shadow-[0_0_25px_rgba(0,255,163,0.6)]"
          >
            {isAnalyzing ? <span className="animate-spin">⟳</span> : <Scan className="w-5 h-5" />}
            {isAnalyzing ? t.analyzing : t.upload_btn}
          </button>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Output Console */}
        <div className="lg:col-span-4 relative min-h-[500px] border border-white/10 bg-black/60 backdrop-blur-md rounded-xl p-6 shadow-2xl flex flex-col">
           <div className="absolute top-0 left-0 px-3 py-1 bg-white/10 text-[10px] text-white rounded-br font-mono">OUTPUT_CONSOLE</div>
           
           {isAnalyzing ? (
             <LoadingScan />
           ) : result ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1 flex flex-col">
               <div className="flex justify-between items-center border-b border-white/10 pb-4 mt-4">
                 <h3 className="text-xl text-white font-bold">{t.results_title}</h3>
                 <span className={`px-3 py-1 rounded text-xs font-bold ${result.is_ai_generated ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50'}`}>
                   {result.is_ai_generated ? t.verdict_ai : t.verdict_real}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded border border-white/5 flex flex-col justify-center">
                   <p className="text-xs text-gray-400 mb-2">{t.confidence}</p>
                   <div className="text-3xl font-bold text-white">{result.confidence_score}%</div>
                 </div>
                 <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.chart_data}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {result.chart_data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#00FFA3', '#FF0055', '#0099FF', '#FFCC00'][index % 4]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="flex-1 bg-black/30 p-4 rounded border border-white/5 overflow-y-auto max-h-80 custom-scrollbar">
                 <div className="text-cyber-green mb-2 opacity-50 text-xs">Analysis Log >_</div>
                 <TypewriterText text={result.detailed_analysis} />
               </div>

               <button 
                onClick={handleDownloadReport}
                className="w-full flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white text-xs py-3 rounded transition-colors"
               >
                 <Download className="w-3 h-3" /> {t.download_report}
               </button>
             </motion.div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
               <Terminal className="w-16 h-16" />
               <p className="text-sm">AWAITING INPUT DATA...</p>
             </div>
           )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 border-y border-white/10 bg-white/5 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-green/5 blur-3xl rounded-full scale-50 opacity-20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h3 className="text-2xl font-bold text-white text-center mb-12 flex items-center justify-center gap-3">
                <Cpu className="w-6 h-6 text-cyber-green" /> {t.how_it_works}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                    { icon: Upload, title: t.step_1, desc: t.step_1_desc },
                    { icon: Search, title: t.step_2, desc: t.step_2_desc },
                    { icon: FileText, title: t.step_3, desc: t.step_3_desc }
                ].map((step, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 p-6 rounded-xl hover:border-cyber-green/50 transition-colors">
                        <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-cyber-green">
                            <step.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-white font-bold mb-2">{step.title}</h4>
                        <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="space-y-8">
        <h3 className="text-2xl text-white border-l-4 border-cyber-green pl-4 font-bold">{t.blog_title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {db.articles.map((article) => (
             <motion.div 
               key={article.id}
               whileHover={{ y: -10 }}
               onClick={() => setSelectedArticle(article)}
               className="group bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-cyber-green/50 transition-all cursor-pointer shadow-lg"
             >
               <div className="h-48 overflow-hidden relative">
                 <div className="absolute inset-0 bg-cyber-green/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                 <img src={article.image} alt={article.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
               </div>
               <div className="p-6 space-y-4">
                 <div className="flex flex-wrap gap-2 text-[10px] text-cyber-green font-mono">
                   {article.hashtags.map(tag => <span key={tag} className="bg-cyber-green/10 px-1.5 py-0.5 rounded">{tag}</span>)}
                 </div>
                 <h4 className="text-xl font-bold text-white line-clamp-1">{article.title}</h4>
                 <p className="text-gray-400 text-sm line-clamp-2">{article.content}</p>
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                   <span>{article.date}</span>
                   <button className="flex items-center gap-1 hover:text-white transition-colors">READ <ChevronRight className="w-3 h-3" /></button>
                 </div>
               </div>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-12 pb-12">
        <div className="max-w-3xl mx-auto bg-black border border-white/10 p-8 rounded-2xl backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyber-green/10 blur-3xl rounded-full pointer-events-none" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-cyber-green" /> {t.contact_us}</h3>
          <form onSubmit={handleContactSubmit} className="space-y-4 relative z-10">
            <input 
              type="email" 
              placeholder="user@encrypted.net" 
              required
              value={contactForm.email}
              onChange={e => setContactForm({...contactForm, email: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyber-green focus:outline-none transition-colors"
            />
            <textarea 
              placeholder="Enter message coordinates..." 
              required
              rows={4}
              value={contactForm.content}
              onChange={e => setContactForm({...contactForm, content: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyber-green focus:outline-none transition-colors"
            />
            <button type="submit" className="w-full bg-white/5 text-cyber-green border border-cyber-green/50 px-6 py-3 rounded font-bold text-sm hover:bg-cyber-green hover:text-black transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {t.send}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-8 pb-12">
        <div className="flex flex-col items-center justify-center space-y-6">
            <h4 className="text-cyber-green text-sm tracking-widest font-bold uppercase">{t.footer_credit}</h4>
            <div className="flex gap-6">
                {db.settings.socialLinks.instagram && (
                    <a href={db.settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors"><Instagram className="w-6 h-6" /></a>
                )}
                {db.settings.socialLinks.twitter && (
                    <a href={db.settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter className="w-6 h-6" /></a>
                )}
                {db.settings.socialLinks.facebook && (
                    <a href={db.settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors"><Facebook className="w-6 h-6" /></a>
                )}
                {db.settings.socialLinks.telegram && (
                    <a href={db.settings.socialLinks.telegram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0088cc] transition-colors"><Send className="w-6 h-6" /></a>
                )}
            </div>
            <p className="text-gray-600 text-xs">{t.footer_rights}</p>
        </div>
      </footer>

      {/* Blog Modal */}
      <AnimatePresence>
        {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      </AnimatePresence>
    </div>
  );

  const renderLogin = () => (
    <div className={`min-h-screen flex items-center justify-center relative ${fontClass}`}>
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] opacity-5 bg-cover pointer-events-none" />
      <motion.form 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleLogin}
        className="w-full max-w-md bg-black/80 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative"
      >
        <button type="button" onClick={() => setView('home')} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl text-white font-mono mb-8 flex items-center gap-2"><Lock className="w-5 h-5 text-cyber-green" /> AUTHENTICATION</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-cyber-green font-mono block mb-1">AGENT_ID</label>
            <input 
              type="text" 
              value={loginCreds.u}
              onChange={e => setLoginCreds({...loginCreds, u: e.target.value})}
              className="w-full bg-black border border-white/20 rounded p-2 text-white font-mono focus:border-cyber-green outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-cyber-green font-mono block mb-1">ACCESS_KEY</label>
            <input 
              type="password" 
              value={loginCreds.p}
              onChange={e => setLoginCreds({...loginCreds, p: e.target.value})}
              className="w-full bg-black border border-white/20 rounded p-2 text-white font-mono focus:border-cyber-green outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-cyber-green/10 border border-cyber-green text-cyber-green py-2 rounded font-mono hover:bg-cyber-green hover:text-black transition-all mt-4">
            INITIATE HANDSHAKE
          </button>
        </div>
      </motion.form>
    </div>
  );

  const renderAdmin = () => (
    <div className={`min-h-screen pt-24 px-6 max-w-6xl mx-auto ${fontClass}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-white font-bold">ADMINISTRATOR_CONTROL</h1>
        <button onClick={() => { setAuth(false); setView('home'); }} className="text-red-500 flex items-center gap-2 hover:underline font-mono text-sm">
          <LogOut className="w-4 h-4" /> DISCONNECT
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'settings', icon: SettingsIcon, label: 'SYSTEM_CONFIG' },
          { id: 'articles', icon: FileText, label: 'INTEL_DB' },
          { id: 'inbox', icon: Mail, label: 'INBOX' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm whitespace-nowrap transition-colors ${adminTab === tab.id ? 'bg-cyber-green text-black font-bold' : 'text-gray-400 hover:text-white bg-white/5'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-black/40 border border-white/10 p-8 rounded-xl backdrop-blur-md min-h-[500px]">
        {adminTab === 'settings' && (
          <div className="space-y-8 max-w-2xl">
             <div className="space-y-4">
               <h3 className="text-white border-b border-white/10 pb-2 flex items-center gap-2"><Database className="w-4 h-4" /> CORE CONFIG</h3>
               <div className="space-y-2">
                 <label className="text-sm text-cyber-green font-mono">GOOGLE_GEMINI_API_KEY</label>
                 <input 
                   type="password" 
                   value={db.settings.apiKey}
                   onChange={(e) => db.updateSettings({...db.settings, apiKey: e.target.value})}
                   className="w-full bg-black border border-white/20 p-3 rounded text-white font-mono focus:border-cyber-green outline-none"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm text-cyber-green font-mono">AI_MODEL_VERSION</label>
                 <select 
                   value={db.settings.model}
                   onChange={(e) => db.updateSettings({...db.settings, model: e.target.value})}
                   className="w-full bg-black border border-white/20 p-3 rounded text-white font-mono focus:border-cyber-green outline-none"
                 >
                   <option value="gemini-2.5-flash">Gemini 2.5 Flash (Standard)</option>
                   <option value="gemini-1.5-pro">Gemini 1.5 Pro (High Reasoning)</option>
                   <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                   <option value="gemini-pro-vision">Gemini Pro Vision (Legacy)</option>
                   <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Experimental)</option>
                 </select>
               </div>
             </div>
             
             <div className="space-y-4">
                <h3 className="text-white border-b border-white/10 pb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> SOCIAL UPLINKS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        placeholder="Instagram URL"
                        value={db.settings.socialLinks.instagram}
                        onChange={(e) => db.updateSettings({...db.settings, socialLinks: {...db.settings.socialLinks, instagram: e.target.value}})}
                        className="bg-black border border-white/20 p-3 rounded text-white text-sm focus:border-cyber-green outline-none"
                    />
                     <input 
                        placeholder="Twitter/X URL"
                        value={db.settings.socialLinks.twitter}
                        onChange={(e) => db.updateSettings({...db.settings, socialLinks: {...db.settings.socialLinks, twitter: e.target.value}})}
                        className="bg-black border border-white/20 p-3 rounded text-white text-sm focus:border-cyber-green outline-none"
                    />
                     <input 
                        placeholder="Facebook URL"
                        value={db.settings.socialLinks.facebook}
                        onChange={(e) => db.updateSettings({...db.settings, socialLinks: {...db.settings.socialLinks, facebook: e.target.value}})}
                        className="bg-black border border-white/20 p-3 rounded text-white text-sm focus:border-cyber-green outline-none"
                    />
                     <input 
                        placeholder="Telegram URL"
                        value={db.settings.socialLinks.telegram}
                        onChange={(e) => db.updateSettings({...db.settings, socialLinks: {...db.settings.socialLinks, telegram: e.target.value}})}
                        className="bg-black border border-white/20 p-3 rounded text-white text-sm focus:border-cyber-green outline-none"
                    />
                </div>
             </div>
          </div>
        )}

        {adminTab === 'articles' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-white border-b border-white/10 pb-2">NEW_ENTRY</h3>
                <input 
                  placeholder="Title"
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm focus:border-cyber-green outline-none"
                  value={newArticle.title}
                  onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                />
                
                <div className="relative">
                    <input 
                        type="file"
                        ref={cmsImageRef}
                        accept="image/*"
                        onChange={handleCmsImageUpload}
                        className="hidden" 
                    />
                    <div 
                        onClick={() => cmsImageRef.current?.click()}
                        className="w-full bg-black border border-white/20 border-dashed p-4 rounded text-center cursor-pointer hover:border-cyber-green text-xs text-gray-400"
                    >
                        {newArticle.image ? "IMAGE LOADED (CLICK TO CHANGE)" : "CLICK TO UPLOAD COVER IMAGE"}
                    </div>
                    {newArticle.image && <img src={newArticle.image} className="mt-2 h-20 w-auto object-cover rounded border border-white/10" alt="preview" />}
                </div>

                 <input 
                  placeholder="Hashtags (comma separated)"
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm focus:border-cyber-green outline-none"
                  value={Array.isArray(newArticle.hashtags) ? newArticle.hashtags.join(',') : ''}
                  onChange={e => setNewArticle({...newArticle, hashtags: e.target.value.split(',')})}
                />
                <textarea 
                  placeholder="Content body..."
                  rows={8}
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm focus:border-cyber-green outline-none"
                  value={newArticle.content}
                  onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                />
                <button onClick={handleSaveArticle} className="bg-cyber-green text-black px-4 py-2 rounded font-bold text-sm w-full hover:bg-white transition-colors">SAVE_TO_DB</button>
              </div>
              <div className="space-y-4">
                 <h3 className="text-white border-b border-white/10 pb-2">EXISTING_RECORDS</h3>
                 <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                   {db.articles.map(article => (
                     <div key={article.id} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/5 hover:border-cyber-green/30">
                        <div className="flex items-center gap-3 w-2/3">
                            <img src={article.image} className="w-8 h-8 rounded object-cover" alt="thumb" />
                            <span className="text-white text-sm truncate">{article.title}</span>
                        </div>
                        <button onClick={() => db.deleteArticle(article.id)} className="text-red-500 text-xs hover:underline bg-red-500/10 px-2 py-1 rounded">DELETE</button>
                     </div>
                   ))}
                   {db.articles.length === 0 && <p className="text-gray-500 text-xs">No records found.</p>}
                 </div>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'inbox' && (
          <div className="space-y-4">
             <h3 className="text-white border-b border-white/10 pb-2">ENCRYPTED_MESSAGES</h3>
             {db.messages.length === 0 ? (
               <p className="text-gray-500 font-mono text-sm">INBOX EMPTY.</p>
             ) : (
               <div className="grid gap-4">
                 {db.messages.map(msg => (
                   <div key={msg.id} className="bg-white/5 border border-white/10 p-4 rounded hover:border-cyber-green/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-cyber-green font-mono text-sm">{msg.email}</span>
                        <span className="text-gray-500 text-xs">{new Date(msg.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{msg.content}</p>
                      <button 
                        onClick={() => window.location.href = `mailto:${msg.email}?subject=RE: Inquiry`}
                        className="text-xs bg-white/10 px-3 py-1 rounded text-white hover:bg-white/20"
                      >
                        REPLY_SECURE
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-cyber-black transition-colors duration-300 ${lang === 'fa' ? 'rtl' : 'ltr'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      {renderNav()}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderHome()}
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderLogin()}
          </motion.div>
        )}
        {view === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderAdmin()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;