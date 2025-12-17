import { useState, useEffect } from 'react';
import { AppSettings, Article, Message } from '../types';
import { INITIAL_SETTINGS, MOCK_ARTICLES } from '../constants';

export const useLocalStorageDB = () => {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedSettings = localStorage.getItem('forensics_settings');
        const storedArticles = localStorage.getItem('forensics_articles');
        const storedMessages = localStorage.getItem('forensics_messages');

        if (storedSettings) setSettings(JSON.parse(storedSettings));
        
        if (storedArticles) {
          setArticles(JSON.parse(storedArticles));
        } else {
          // Initialize with mock data if empty
          setArticles(MOCK_ARTICLES);
          localStorage.setItem('forensics_articles', JSON.stringify(MOCK_ARTICLES));
        }

        if (storedMessages) setMessages(JSON.parse(storedMessages));
      } catch (e) {
        console.error("Database Corruption Detected:", e);
      }
    };
    loadData();
  }, []);

  // CRUD Operations

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('forensics_settings', JSON.stringify(newSettings));
  };

  const addArticle = (article: Article) => {
    const updated = [article, ...articles];
    setArticles(updated);
    localStorage.setItem('forensics_articles', JSON.stringify(updated));
  };

  const deleteArticle = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    localStorage.setItem('forensics_articles', JSON.stringify(updated));
  };

  const addMessage = (msg: Message) => {
    const updated = [msg, ...messages];
    setMessages(updated);
    localStorage.setItem('forensics_messages', JSON.stringify(updated));
  };

  return {
    settings,
    articles,
    messages,
    updateSettings,
    addArticle,
    deleteArticle,
    addMessage
  };
};