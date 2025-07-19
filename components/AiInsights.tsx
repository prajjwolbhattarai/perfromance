import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { getMarketingInsights } from '../services/geminiService';
import { SendIcon, BotIcon, KeyIcon, WarningIcon } from './icons';

interface AiInsightsProps {
  campaigns: Campaign[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ campaigns }) => {
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const suggestions = [
    "Which campaigns have the highest ROAS?",
    "Identify underperforming campaigns and suggest improvements.",
    "Summarize the performance of Meta Ads campaigns.",
    "What's the best platform for CTR?",
  ];

  const handleSaveKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini-api-key', tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setError('');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    setTempApiKey('');
  };

  const handleSubmit = async (currentPrompt: string) => {
    if (isOffline) {
        setError("You are offline. AI Insights require an internet connection.");
        return;
    }
    if (!currentPrompt || isLoading || !apiKey) return;
    
    setError('');
    setIsLoading(true);
    setResponse('');
    
    try {
      const result = await getMarketingInsights(currentPrompt, campaigns, apiKey);
      setResponse(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      if (errorMessage.includes("API key not valid")) {
        setError("API key not valid. Please check your key or enter a new one.");
      }
      setResponse('');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(prompt);
  }

  if (!apiKey) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center bg-gray-100/50 dark:bg-dark-bg p-6 rounded-lg text-center">
          <KeyIcon className="w-10 h-10 mb-4 text-brand-secondary" />
          <h3 className="text-lg font-bold">Enter Your Gemini API Key</h3>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            To use the AI features, please provide your Google Gemini API key.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your API key here"
              className="w-full px-4 py-2 rounded-md bg-light-border dark:bg-dark-border focus:ring-2 focus:ring-brand-primary focus:outline-none transition-colors"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-blue-600 transition-colors flex-shrink-0"
            >
              Save Key
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Your key is stored only in your browser's local storage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
        {error && 
          <div className="p-3 mb-4 rounded-md bg-red-500/10 text-red-500 flex items-start gap-2">
            <WarningIcon className="w-5 h-5 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm">{error}</p>
              {error.includes("API key not valid") && (
                 <button onClick={handleClearKey} className="mt-2 text-sm font-bold underline">Enter new key</button>
              )}
            </div>
          </div>
        }
        <div className="flex-grow bg-gray-100/50 dark:bg-dark-bg p-4 rounded-md mb-4 min-h-[200px] overflow-y-auto">
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                        <BotIcon className="w-10 h-10 text-brand-primary animate-spin-slow" />
                        <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">Analyzing data...</p>
                    </div>
                </div>
            )}
            {response && <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />}
            {!isLoading && !response && !error && (
                 <div className="text-center text-light-text-secondary dark:text-dark-text-secondary flex flex-col justify-center h-full">
                    {isOffline ? (
                        <p className="font-semibold">AI Insights are unavailable offline.</p>
                    ) : (
                        <>
                         <p>Ask a question about your campaign data.</p>
                         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {suggestions.map(s => (
                                <button key={s} onClick={() => handleSubmit(s)} className="p-2 bg-light-border dark:bg-dark-border rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    {s}
                                </button>
                            ))}
                         </div>
                        </>
                    )}
                 </div>
            )}
        </div>

        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isOffline ? "AI is unavailable offline" : "e.g., Suggest budget reallocations..."}
                className="w-full px-4 py-2 rounded-md bg-light-border dark:bg-dark-border focus:ring-2 focus:ring-brand-primary focus:outline-none transition-colors"
                disabled={isLoading || isOffline}
            />
            <button
                type="submit"
                disabled={isLoading || !prompt || isOffline}
                className="p-2 rounded-md bg-brand-primary text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex-shrink-0"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
         <div className="text-right mt-2">
            <button onClick={handleClearKey} className="text-xs text-gray-500 hover:text-red-500 dark:hover:text-red-400 underline transition-colors">
                Change API Key
            </button>
        </div>
    </div>
  );
};

export default AiInsights;