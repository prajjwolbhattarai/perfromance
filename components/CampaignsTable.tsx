
import React from 'react';
import { Campaign, Platform } from '../types';
import { GoogleIcon, MetaIcon, LinkedInIcon, TikTokIcon, RedditIcon, SpotifyIcon, SignalIcon } from './icons';

interface CampaignsTableProps {
  campaigns: Campaign[];
}

const platformIcons: Record<string, React.ReactNode> = {
  [Platform.Google]: <GoogleIcon className="w-5 h-5 text-red-500" />,
  [Platform.Meta]: <MetaIcon className="w-5 h-5 text-blue-600" />,
  [Platform.LinkedIn]: <LinkedInIcon className="w-5 h-5 text-blue-800" />,
  [Platform.TikTok]: <TikTokIcon className="w-5 h-5 text-black dark:text-white" />,
  [Platform.Reddit]: <RedditIcon className="w-5 h-5 text-orange-500" />,
  [Platform.Spotify]: <SpotifyIcon className="w-5 h-5 text-green-500" />,
};

const statusColors = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Ended: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const CampaignsTable: React.FC<CampaignsTableProps> = ({ campaigns }) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {['Campaign', 'Status', 'Channel', 'Ad Set', 'Source', 'Content', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'ROAS', 'CPC', 'CTR'].map(header => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-light-card dark:bg-dark-card divide-y divide-light-border dark:divide-dark-border">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6">
                    {platformIcons[campaign.platform] || <SignalIcon className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">{campaign.name}</div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.platform}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[campaign.status]}`}>
                  {campaign.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.channel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.adSetName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.source}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{campaign.contentType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(campaign.spend)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.impressions.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.clicks.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.conversions.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{campaign.roas.toFixed(1)}x</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(campaign.cpc)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{(campaign.ctr).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignsTable;
