
import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import { SpendRevenueBarChart, ConversionFunnelChart, SpendDistributionPieChart, PerformanceTrendChart } from './PerformanceChart';
import CampaignsTable from './CampaignsTable';
import { Campaign, Kpi, FunnelStageKey } from '../types';
import { PlusCircleIcon, MinusCircleIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons';

interface DashboardProps {
    campaigns: Campaign[];
}

const ALL_POSSIBLE_STAGES: { key: FunnelStageKey; name: string }[] = [
    { key: 'impressions', name: 'Impressions' },
    { key: 'clicks', name: 'Clicks' },
    { key: 'signups', name: 'Sign-ups' },
    { key: 'conversions', name: 'Conversions' },
    { key: 'sqls', name: 'SQLs' },
    { key: 'customers', name: 'Customers' },
    { key: 'onboarded', name: 'Onboarded' },
];

const calculateKpis = (campaigns: Campaign[]): Kpi[] => {
    if (campaigns.length === 0) return [];
    
    const totals = campaigns.reduce((acc, c) => {
        acc.spend += c.spend;
        acc.impressions += c.impressions;
        acc.clicks += c.clicks;
        acc.conversions += c.conversions;
        acc.revenue += c.spend * c.roas;
        return acc;
    }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount);
    const formatNumber = (amount: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount);

    const overallRoas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
    const overallCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    return [
        { title: 'ROAS', value: `${overallRoas.toFixed(1)}x`, change: '-', changeType: 'neutral' },
        { title: 'Spend', value: formatCurrency(totals.spend), change: '-', changeType: 'neutral' },
        { title: 'Impressions', value: formatNumber(totals.impressions), change: '-', changeType: 'neutral' },
        { title: 'Clicks', value: formatNumber(totals.clicks), change: '-', changeType: 'neutral' },
        { title: 'Conversions', value: formatNumber(totals.conversions), change: '-', changeType: 'neutral' },
        { title: 'CTR', value: `${overallCtr.toFixed(2)}%`, change: '-', changeType: 'neutral' },
    ];
};

const Dashboard: React.FC<DashboardProps> = ({ campaigns }) => {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [spendRevenueData, setSpendRevenueData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [spendDistributionData, setSpendDistributionData] = useState<any[]>([]);
  const [roasTrendData, setRoasTrendData] = useState<any[]>([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStageKey[]>(['impressions', 'clicks', 'conversions', 'customers']);
  
  const availableFunnelStages = ALL_POSSIBLE_STAGES.filter(s => !funnelStages.includes(s.key));
  
  useEffect(() => {
    setKpis(calculateKpis(campaigns));

    // Spend vs Revenue by Platform
    const platformData = campaigns.reduce((acc, c) => {
      if (!acc[c.platform]) {
        acc[c.platform] = { name: c.platform, spend: 0, revenue: 0 };
      }
      acc[c.platform].spend += c.spend;
      acc[c.platform].revenue += c.spend * c.roas;
      return acc;
    }, {} as Record<string, {name: string, spend: number, revenue: number}>);
    setSpendRevenueData(Object.values(platformData));

    // Conversion Funnel
    const funnelTotals = campaigns.reduce((acc, c) => {
        acc.impressions += c.impressions || 0;
        acc.clicks += c.clicks || 0;
        acc.conversions += c.conversions || 0;
        acc.signups += c.signups || 0;
        acc.sqls += c.sqls || 0;
        acc.customers += c.customers || 0;
        acc.onboarded += c.onboarded || 0;
        return acc;
    }, {impressions: 0, clicks: 0, conversions: 0, signups: 0, sqls: 0, customers: 0, onboarded: 0});
    
    const dynamicFunnelData = funnelStages
        .map(stageKey => {
            const stageInfo = ALL_POSSIBLE_STAGES.find(s => s.key === stageKey);
            return {
                name: stageInfo ? stageInfo.name : 'Unknown',
                value: funnelTotals[stageKey]
            };
        });
    setFunnelData(dynamicFunnelData);


    // Spend Distribution by Platform
    setSpendDistributionData(Object.values(platformData).map(p => ({ name: p.name, value: p.spend })));

    // ROAS Over Time
    const monthlyData: { [key: string]: { spend: number, revenue: number } } = {};
    campaigns.forEach(c => {
        try {
            const month = new Date(c.date).toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { spend: 0, revenue: 0 };
            }
            monthlyData[month].spend += c.spend;
            monthlyData[month].revenue += c.spend * c.roas;
        } catch (e) {
            console.warn(`Invalid date for campaign "${c.name}": ${c.date}`);
        }
    });
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = Object.entries(monthlyData).map(([date, data]) => ({
        date,
        ROAS: data.spend > 0 ? data.revenue / data.spend : 0,
    })).sort((a, b) => monthOrder.indexOf(a.date) - monthOrder.indexOf(b.date));
    setRoasTrendData(trendData);
  }, [campaigns, funnelStages]);
  
  const handleAddFunnelStage = (stage: FunnelStageKey) => {
      setFunnelStages(prev => [...prev, stage]);
  };

  const handleRemoveFunnelStage = (stage: FunnelStageKey) => {
      setFunnelStages(prev => prev.filter(s => s !== stage));
  };
  
  const handleMoveFunnelStage = (index: number, direction: 'up' | 'down') => {
      setFunnelStages(prev => {
          const newStages = [...prev];
          const item = newStages[index];
          if (direction === 'up' && index > 0) {
              newStages.splice(index, 1);
              newStages.splice(index - 1, 0, item);
          } else if (direction === 'down' && index < newStages.length - 1) {
              newStages.splice(index, 1);
              newStages.splice(index + 1, 0, item);
          }
          return newStages;
      });
  };

  return (
    <>
      <section id="kpis">
        <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      <section id="performance-trends">
           <h2 className="text-xl font-bold mb-4">Performance Visualizations</h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold mb-2">Spend vs. Revenue by Platform</h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">Crucial for identifying your most profitable channels at a glance.</p>
                  <div className="h-80">
                      <SpendRevenueBarChart data={spendRevenueData} />
                  </div>
              </div>
              <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md col-span-1 lg:col-span-2">
                   <h3 className="font-semibold">Interactive Conversion Funnel</h3>
                   <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 mb-4">Build and visualize your custom customer journey to identify drop-off points.</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 h-96">
                          <ConversionFunnelChart data={funnelData} />
                      </div>
                      <div className="space-y-4">
                          <div>
                              <h4 className="font-semibold text-sm mb-2">Your Funnel</h4>
                              <ul className="space-y-2">
                                  {funnelStages.map((stageKey, index) => {
                                      const stage = ALL_POSSIBLE_STAGES.find(s => s.key === stageKey);
                                      return (
                                          <li key={stageKey} className="flex items-center justify-between bg-light-bg dark:bg-dark-bg p-2 rounded-md text-sm">
                                              <span>{stage?.name}</span>
                                              <div className="flex items-center gap-1">
                                                   <button onClick={() => handleMoveFunnelStage(index, 'up')} disabled={index === 0} className="disabled:opacity-25"><ArrowUpCircleIcon className="w-5 h-5 text-gray-500 hover:text-brand-primary"/></button>
                                                   <button onClick={() => handleMoveFunnelStage(index, 'down')} disabled={index === funnelStages.length - 1} className="disabled:opacity-25"><ArrowDownCircleIcon className="w-5 h-5 text-gray-500 hover:text-brand-primary"/></button>
                                                   <button onClick={() => handleRemoveFunnelStage(stageKey)}><MinusCircleIcon className="w-5 h-5 text-red-500 hover:text-red-700"/></button>
                                              </div>
                                          </li>
                                      );
                                  })}
                              </ul>
                          </div>
                          <div>
                              <h4 className="font-semibold text-sm mb-2">Available Stages</h4>
                              <ul className="space-y-2">
                                  {availableFunnelStages.map(stage => (
                                      <li key={stage.key} className="flex items-center justify-between bg-light-bg dark:bg-dark-bg p-2 rounded-md text-sm">
                                          <span>{stage.name}</span>
                                          <button onClick={() => handleAddFunnelStage(stage.key)}><PlusCircleIcon className="w-5 h-5 text-green-500 hover:text-green-700"/></button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                   </div>
              </div>
               <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold mb-2">Spend Distribution</h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">Shows how your budget is allocated across platforms to verify strategic alignment.</p>
                  <div className="h-80">
                      <SpendDistributionPieChart data={spendDistributionData} />
                  </div>
              </div>
               <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold mb-2">ROAS Over Time</h3>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">Monitors the overall efficiency and profitability of your advertising efforts month by month.</p>
                  <div className="h-80">
                      <PerformanceTrendChart data={roasTrendData} />
                  </div>
              </div>
           </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
               <section id="campaigns">
                  <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
                  <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                      <CampaignsTable campaigns={campaigns} />
                  </div>
              </section>
          </div>
      </div>
    </>
  );
};

export default Dashboard;
