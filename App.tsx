
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DataUploader from './components/DataUploader';
import Dashboard from './components/Dashboard';
import ForecastingHub from './components/ForecastingHub';
import AiInsights from './components/AiInsights';
import { campaigns as initialCampaigns } from './data/mockData';
import { Theme, Campaign } from './types';
import { BotIcon } from './components/icons';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeView, setActiveView] = useState<'dashboard' | 'forecasting'>('dashboard');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleDataUploaded = (newCampaigns: Campaign[]) => {
      setCampaigns(newCampaigns);
  };
  
  return (
    <div className="min-h-screen text-light-text-primary dark:text-dark-text-primary">
      <Header theme={theme} setTheme={setTheme} activeView={activeView} setActiveView={setActiveView} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        <DataUploader onDataUploaded={handleDataUploaded} />
        
        {activeView === 'dashboard' && <Dashboard campaigns={campaigns} />}
        {activeView === 'forecasting' && <ForecastingHub campaigns={campaigns} />}

        <section id="ai-insights">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <BotIcon className="w-6 h-6 mr-2 text-brand-primary" />
                AI-Powered Insights
            </h2>
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md">
                <AiInsights campaigns={campaigns} />
            </div>
        </section>
      </main>
      <footer className="text-center py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        Performance Marketing Intelligence Hub &copy; 2024
      </footer>
    </div>
  );
};

export default App;
