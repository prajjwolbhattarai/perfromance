
import React, { useMemo } from 'react';
import { Campaign } from '../types';
import { Platform } from '../types';
import { GoogleIcon, MetaIcon, LinkedInIcon, TikTokIcon, RedditIcon, SpotifyIcon, SignalIcon } from './icons';

interface ForecastingTableProps {
    originalData: Campaign[];
    forecastedData: Campaign[];
}

const platformIcons: Record<string, React.ReactNode> = {
  [Platform.Google]: <GoogleIcon className="w-5 h-5" />,
  [Platform.Meta]: <MetaIcon className="w-5 h-5" />,
  [Platform.LinkedIn]: <LinkedInIcon className="w-5 h-5" />,
  [Platform.TikTok]: <TikTokIcon className="w-5 h-5" />,
  [Platform.Reddit]: <RedditIcon className="w-5 h-5" />,
  [Platform.Spotify]: <SpotifyIcon className="w-5 h-5" />,
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
const formatPercentage = (current: number, original: number) => {
    if (original === 0) return <span className="text-gray-500">-</span>;
    const change = ((current - original) / original) * 100;
    const color = change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
    return <span className={color}>{change.toFixed(0)}%</span>;
};


const ForecastingTable: React.FC<ForecastingTableProps> = ({ originalData, forecastedData }) => {
    
    const platformData = useMemo(() => {
        const platformMap: Record<string, { originalSpend: number, originalRevenue: number, forecastedSpend: number, forecastedRevenue: number }> = {};
        
        originalData.forEach(c => {
            if (!platformMap[c.platform]) platformMap[c.platform] = { originalSpend: 0, originalRevenue: 0, forecastedSpend: 0, forecastedRevenue: 0 };
            platformMap[c.platform].originalSpend += c.spend;
            platformMap[c.platform].originalRevenue += c.spend * c.roas;
        });

        forecastedData.forEach(c => {
            if (!platformMap[c.platform]) platformMap[c.platform] = { originalSpend: 0, originalRevenue: 0, forecastedSpend: 0, forecastedRevenue: 0 };
            platformMap[c.platform].forecastedSpend += c.spend;
            platformMap[c.platform].forecastedRevenue += c.spend * c.roas;
        });

        return Object.entries(platformMap).map(([platform, data]) => ({ platform, ...data }));

    }, [originalData, forecastedData]);

    return (
         <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase">
                    <tr>
                        <th className="py-2 px-2 text-left">Platform</th>
                        <th className="py-2 px-2 text-right">Spend</th>
                        <th className="py-2 px-2 text-right">Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {platformData.map(({ platform, originalSpend, originalRevenue, forecastedSpend, forecastedRevenue }) => (
                        <tr key={platform}>
                            <td className="py-2 px-2 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0 h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary">
                                        {platformIcons[platform] || <SignalIcon />}
                                    </div>
                                    <span className="font-medium">{platform}</span>
                                </div>
                            </td>
                            <td className="py-2 px-2 text-right">
                                <div className="font-semibold">{formatCurrency(forecastedSpend)}</div>
                                <div className="text-xs text-gray-500">{formatCurrency(originalSpend)}</div>
                            </td>
                            <td className="py-2 px-2 text-right">
                                <div className="font-semibold">{formatCurrency(forecastedRevenue)}</div>
                                <div className="text-xs text-gray-500">{formatCurrency(originalRevenue)}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ForecastingTable;
