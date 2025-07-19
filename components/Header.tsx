
import React from 'react';
import { SunIcon, MoonIcon, SignalIcon, LayoutDashboardIcon, TrendingUpIcon } from './icons';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeView: 'dashboard' | 'forecasting';
  setActiveView: (view: 'dashboard' | 'forecasting') => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, activeView, setActiveView }) => {
  const toggleTheme = () => {
    setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  const navs = [
    { name: 'Dashboard', view: 'dashboard', icon: <LayoutDashboardIcon className="w-5 h-5 mr-2" /> },
    { name: 'ROI & Forecasting Hub', view: 'forecasting', icon: <TrendingUpIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <SignalIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="ml-3 text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary hidden sm:block">
              Marketing Hub
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <nav className="flex space-x-1 sm:space-x-2 bg-gray-200/50 dark:bg-dark-bg p-1 rounded-lg">
                {navs.map((nav) => (
                    <button
                        key={nav.view}
                        onClick={() => setActiveView(nav.view as 'dashboard' | 'forecasting')}
                        className={`flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors duration-200 ${
                            activeView === nav.view
                            ? 'bg-white dark:bg-dark-card shadow text-brand-primary'
                            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                        }`}
                        >
                        {nav.icon}
                        {nav.name}
                    </button>
                ))}
            </nav>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-dark-card focus:ring-brand-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
