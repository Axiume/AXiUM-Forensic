import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, Upload, AlertTriangle, Terminal, Lock, LogOut, 
  Settings as SettingsIcon, LayoutDashboard, Mail, FileText,
  CheckCircle, Globe, Send, X, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLocalStorageDB } from './hooks/useLocalStorageDB';
import { analyzeImage } from './services/geminiService';
import { DICTIONARY } from './constants';
import { Language, AnalysisResult, Article } from './types';

// --- Sub-Components (Defined here for single-file robustness per instructions) ---

const LoadingScan = () => (
  <div className="relative w-full h-64 bg-black/50 border border-cyber-green/30 rounded-lg overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
    <motion.div 
      className="absolute top-0 left-0 w-full h-1 bg-cyber-green shadow-[0_0_20px_#00FFA3]"
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
    />
    <div className="flex flex-col items-center z-10">
      <Scan className="w-16 h-16 text-cyber-green animate-pulse mb-4" />
      <p className="text-cyber-green font-mono text-lg animate-pulse tracking-widest">INITIALIZING DEEP SCAN...</p>
      <div className="mt-2 text-xs text-cyber-green/60 font-mono">
        {Array.from({ length: 5 }).map((_, i) => (
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
    }, 10);
    return () => clearInterval(timer);
  }, [text]);

  return <p className="font-mono text-sm md:text-base leading-relaxed text-gray-300">{displayed}<span className="animate-blink">_</span></p>;
};

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'admin' | 'login'>('home');
  const [auth, setAuth] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ u: '', p: '' });
  
  // Database Hook
  const db = useLocalStorageDB();
  const t = DICTIONARY[lang];

  // Scanner State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Admin State
  const [adminTab, setAdminTab] = useState<'settings' | 'articles' | 'inbox'>('settings');
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', content: '', hashtags: [], image: '' });

  // Contact State
  const [contactForm, setContactForm] = useState({ email: '', content: '' });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effects
  useEffect(() => {
    // Dynamic Meta Theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#00FFA3');
  }, []);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
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
    } catch (err: any) {
      setError(`ANALYSIS FAILED: ${err.message || "UNKNOWN ERROR"}`);
    } finally {
      setIsAnalyzing(false);
    }
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
      hashtags: typeof newArticle.hashtags === 'string' ? (newArticle.hashtags as string).split(',') : [],
      date: new Date().toISOString().split('T')[0]
    } as Article);
    setNewArticle({ title: '', content: '', hashtags: [], image: '' });
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

  // Render Helpers
  const renderNav = () => (
    <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
        <Scan className="w-8 h-8 text-cyber-green" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tighter text-white font-mono">{t.title}</h1>
          <span className="text-[10px] text-cyber-green tracking-widest">VER 2.5.0 // BETA</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setLang(l => l === 'en' ? 'fa' : 'en')} className="p-2 text-white hover:text-cyber-green transition-colors">
          <Globe className="w-5 h-5" />
        </button>
        {auth ? (
          <button onClick={() => setView('admin')} className="text-sm font-mono text-cyber-green hover:underline">
            ADMIN_PANEL
          </button>
        ) : (
          <button onClick={() => setView('login')} className="flex items-center gap-2 text-xs font-mono border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition">
            <Lock className="w-3 h-3" /> {t.admin_login}
          </button>
        )}
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto space-y-24">
      {/* Hero / Scanner Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white font-mono tracking-tighter">
              {lang === 'fa' ? 'کشف حقیقت.' : 'UNCOVER THE TRUTH.'}
              <span className="block text-cyber-green">{lang === 'fa' ? 'تحلیل هوشمند' : 'AI FORENSICS'}</span>
            </h2>
            <p className="text-gray-400 max-w-md border-l-2 border-cyber-green pl-4">
              {t.subtitle}
            </p>
          </motion.div>

          <div 
            className={`border-2 border-dashed ${selectedImage ? 'border-cyber-green' : 'border-white/20'} bg-white/5 rounded-xl p-8 text-center transition-all hover:border-cyber-green/50 cursor-pointer relative overflow-hidden group`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                 const reader = new FileReader();
                 reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
                 reader.readAsDataURL(file);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
            <div className="absolute inset-0 bg-cyber-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {selectedImage ? (
              <img src={selectedImage} alt="Analysis Target" className="max-h-64 mx-auto rounded shadow-[0_0_15px_rgba(0,255,163,0.3)]" />
            ) : (
              <div className="py-12 flex flex-col items-center gap-4 text-gray-500">
                <Upload className="w-12 h-12" />
                <p className="font-mono text-sm tracking-widest">{t.upload_drop}</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing}
            className="w-full bg-cyber-green text-black font-bold py-4 rounded font-mono hover:bg-[#00cc82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <span className="animate-spin">⟳</span> : <Scan className="w-5 h-5" />}
            {isAnalyzing ? t.analyzing : t.upload_btn}
          </button>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 font-mono text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        <div className="relative min-h-[500px] border border-white/10 bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-2xl">
           <div className="absolute top-0 left-0 px-3 py-1 bg-white/10 text-[10px] text-white font-mono rounded-br">OUTPUT_CONSOLE</div>
           
           {isAnalyzing ? (
             <LoadingScan />
           ) : result ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-full flex flex-col">
               <div className="flex justify-between items-center border-b border-white/10 pb-4">
                 <h3 className="text-xl font-mono text-white">{t.results_title}</h3>
                 <span className={`px-3 py-1 rounded text-xs font-bold ${result.is_ai_generated ? 'bg-red-500/20 text-red-500' : 'bg-cyber-green/20 text-cyber-green'}`}>
                   {result.is_ai_generated ? t.verdict_ai : t.verdict_real}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 p-4 rounded border border-white/5">
                   <p className="text-xs text-gray-400 font-mono mb-2">{t.confidence}</p>
                   <div className="text-3xl font-bold text-white font-mono">{result.confidence_score}%</div>
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
                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="flex-1 bg-black/30 p-4 rounded border border-white/5 overflow-y-auto font-mono text-sm max-h-96 custom-scrollbar">
                 <div className="text-cyber-green mb-2 opacity-50 text-xs">Analysis Log >_</div>
                 <TypewriterText text={result.detailed_analysis} />
               </div>
             </motion.div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
               <Terminal className="w-16 h-16" />
               <p className="font-mono text-sm">AWAITING INPUT DATA...</p>
             </div>
           )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="space-y-8">
        <h3 className="text-2xl font-mono text-white border-l-4 border-cyber-green pl-4">{t.blog_title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {db.articles.map((article) => (
             <motion.div 
               key={article.id}
               whileHover={{ y: -5 }}
               className="group bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-cyber-green/50 transition-colors"
             >
               <div className="h-48 overflow-hidden relative">
                 <div className="absolute inset-0 bg-cyber-green/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                 <img src={article.image} alt={article.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
               </div>
               <div className="p-6 space-y-4">
                 <div className="flex gap-2 text-[10px] text-cyber-green font-mono">
                   {article.hashtags.map(tag => <span key={tag}>{tag}</span>)}
                 </div>
                 <h4 className="text-xl font-bold text-white">{article.title}</h4>
                 <p className="text-gray-400 text-sm line-clamp-3">{article.content}</p>
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 font-mono">
                   <span>{article.date}</span>
                   <button className="flex items-center gap-1 hover:text-white transition-colors">READ <ChevronRight className="w-3 h-3" /></button>
                 </div>
               </div>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-white/10 pt-12 pb-12">
        <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-24 h-24 bg-cyber-green/20 blur-3xl rounded-full pointer-events-none" />
          <h3 className="text-xl font-mono text-white mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-cyber-green" /> {t.contact_us}</h3>
          <form onSubmit={handleContactSubmit} className="space-y-4 relative z-10">
            <input 
              type="email" 
              placeholder="user@encrypted.net" 
              required
              value={contactForm.email}
              onChange={e => setContactForm({...contactForm, email: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyber-green focus:outline-none font-mono"
            />
            <textarea 
              placeholder="Enter message coordinates..." 
              required
              rows={4}
              value={contactForm.content}
              onChange={e => setContactForm({...contactForm, content: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-cyber-green focus:outline-none font-mono"
            />
            <button type="submit" className="bg-white/10 text-cyber-green border border-cyber-green/50 px-6 py-2 rounded font-mono text-sm hover:bg-cyber-green hover:text-black transition-all flex items-center gap-2">
              <Send className="w-4 h-4" /> {t.send}
            </button>
          </form>
        </div>
      </section>

      <footer className="text-center text-gray-600 text-xs font-mono pb-8">
        {t.footer_rights}
      </footer>
    </div>
  );

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center relative">
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
    <div className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-white font-mono">ADMINISTRATOR_CONTROL</h1>
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
          <div className="space-y-6 max-w-xl">
             <div className="space-y-2">
               <label className="text-sm text-cyber-green font-mono">GOOGLE_GEMINI_API_KEY</label>
               <input 
                 type="password" 
                 value={db.settings.apiKey}
                 onChange={(e) => db.updateSettings({...db.settings, apiKey: e.target.value})}
                 className="w-full bg-black border border-white/20 p-3 rounded text-white font-mono focus:border-cyber-green outline-none"
               />
               <p className="text-xs text-gray-500">Required for analysis engine connectivity.</p>
             </div>
             <div className="space-y-2">
               <label className="text-sm text-cyber-green font-mono">AI_MODEL_VERSION</label>
               <select 
                 value={db.settings.model}
                 onChange={(e) => db.updateSettings({...db.settings, model: e.target.value})}
                 className="w-full bg-black border border-white/20 p-3 rounded text-white font-mono focus:border-cyber-green outline-none"
               >
                 <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                 <option value="gemini-1.5-pro">Gemini 1.5 Pro (Legacy)</option>
                 <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
               </select>
             </div>
             <div className="pt-4">
                <div className="flex items-center gap-2 text-cyber-green text-sm">
                  <CheckCircle className="w-4 h-4" /> CONFIG_SYNCED_LOCALLY
                </div>
             </div>
          </div>
        )}

        {adminTab === 'articles' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-white font-mono border-b border-white/10 pb-2">NEW_ENTRY</h3>
                <input 
                  placeholder="Title"
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm"
                  value={newArticle.title}
                  onChange={e => setNewArticle({...newArticle, title: e.target.value})}
                />
                <input 
                  placeholder="Image URL (or upload feature pending)"
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm"
                  value={newArticle.image}
                  onChange={e => setNewArticle({...newArticle, image: e.target.value})}
                />
                 <input 
                  placeholder="Hashtags (comma separated)"
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm"
                  value={Array.isArray(newArticle.hashtags) ? newArticle.hashtags.join(',') : newArticle.hashtags}
                  onChange={e => setNewArticle({...newArticle, hashtags: e.target.value})}
                />
                <textarea 
                  placeholder="Content body..."
                  rows={6}
                  className="w-full bg-black border border-white/20 p-2 rounded text-white text-sm"
                  value={newArticle.content}
                  onChange={e => setNewArticle({...newArticle, content: e.target.value})}
                />
                <button onClick={handleSaveArticle} className="bg-cyber-green text-black px-4 py-2 rounded font-bold text-sm w-full">SAVE_TO_DB</button>
              </div>
              <div className="space-y-4">
                 <h3 className="text-white font-mono border-b border-white/10 pb-2">EXISTING_RECORDS</h3>
                 <div className="space-y-2 max-h-[400px] overflow-y-auto">
                   {db.articles.map(article => (
                     <div key={article.id} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/5">
                        <span className="text-white text-sm truncate w-2/3">{article.title}</span>
                        <button onClick={() => db.deleteArticle(article.id)} className="text-red-500 text-xs hover:underline">DELETE</button>
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
             <h3 className="text-white font-mono border-b border-white/10 pb-2">ENCRYPTED_MESSAGES</h3>
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