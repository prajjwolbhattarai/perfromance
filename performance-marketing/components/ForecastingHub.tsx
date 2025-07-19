
import React, { useState, useMemo } from 'react';
import { Campaign, Kpi } from '../types';
import KpiCard from './KpiCard';
import { ForecastChart } from './PerformanceChart';
import ForecastingTable from './ForecastingTable';
import { TrendingUpIcon } from './icons';

interface ForecastingHubProps {
    campaigns: Campaign[];
}

const formatCurrency = (amount: number, compact = false) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard' }).format(amount);

const ForecastingHub: React.FC<ForecastingHubProps> = ({ campaigns }) => {
    const [spendIncrease, setSpendIncrease] = useState(0); // 0, 10, 20
    const [avgDealSize, setAvgDealSize] = useState(5000);
    const [avgAnnualValue, setAvgAnnualValue] = useState(2000);

    const { forecastedCampaigns, totals } = useMemo(() => {
        const multiplier = 1 + (spendIncrease / 100);
        const forecasted = campaigns.map(c => {
            const scaledSpend = c.spend * multiplier;
            // Assuming linear scaling for other metrics based on spend. A more complex model could be used here.
            const efficiencyFactor = c.roas > 0 ? 1 : 0; // Don't scale metrics if campaign was unprofitable
            return {
                ...c,
                spend: scaledSpend,
                impressions: c.impressions * multiplier * efficiencyFactor,
                clicks: c.clicks * multiplier * efficiencyFactor,
                conversions: c.conversions * multiplier * efficiencyFactor,
                signups: (c.signups || 0) * multiplier * efficiencyFactor,
                sqls: (c.sqls || 0) * multiplier * efficiencyFactor,
                customers: (c.customers || 0) * multiplier * efficiencyFactor,
                // ROAS, CPC, CTR are assumed to stay constant in this simple model
            };
        });

        const newTotals = forecasted.reduce((acc, c) => {
            acc.spend += c.spend;
            acc.impressions += c.impressions;
            acc.clicks += c.clicks;
            acc.conversions += c.conversions;
            acc.revenue += c.spend * c.roas;
            acc.sqls += c.sqls || 0;
            acc.customers += c.customers || 0;
            acc.churnedCustomers += c.churnedCustomers || 0;
            return acc;
        }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, sqls: 0, customers: 0, churnedCustomers: 0 });

        return { forecastedCampaigns: forecasted, totals: newTotals };
    }, [campaigns, spendIncrease]);

    const kpis = useMemo<Kpi[]>(() => {
        const { spend, impressions, clicks, revenue, sqls, customers, churnedCustomers } = totals;
        const roas = spend > 0 ? revenue / spend : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cac = customers > 0 ? spend / customers : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const cpsql = sqls > 0 ? spend / sqls : 0;
        const pipelineValue = sqls * avgDealSize;
        const arr = customers * avgAnnualValue;
        const churnRate = customers > 0 ? (churnedCustomers / customers) * 100 : 0;

        return [
            { title: 'Forecasted ROAS', value: `${roas.toFixed(2)}x`, change: `+${spendIncrease}% spend`, changeType: 'neutral', description: 'Return On Ad Spend (Revenue / Spend). Shows profitability.' },
            { title: 'Forecasted Spend', value: formatCurrency(spend, true), change: `Total ad spend`, changeType: 'neutral', description: 'Total amount spent on advertising.'},
            { title: 'Forecasted Revenue', value: formatCurrency(revenue, true), change: 'Projected revenue', changeType: 'neutral', description: 'Total revenue generated from campaigns.' },
            { title: 'CAC', value: formatCurrency(cac), change: 'Customer Acquisition Cost', changeType: 'neutral', description: 'The average cost to acquire one new customer (Spend / Customers).' },
            { title: 'CPC', value: formatCurrency(cpc), change: 'Cost Per Click', changeType: 'neutral', description: 'The average amount you pay for each click on your ad.' },
            { title: 'CTR', value: `${ctr.toFixed(2)}%`, change: 'Click-Through Rate', changeType: 'neutral', description: 'Percentage of impressions that result in a click (Clicks / Impressions).' },
            { title: 'CPM', value: formatCurrency(cpm), change: 'Cost Per 1,000 Impressions', changeType: 'neutral', description: 'The average cost for one thousand ad impressions.' },
            { title: 'Cost Per SQL', value: formatCurrency(cpsql), change: `Based on ${sqls.toLocaleString()} SQLs`, changeType: 'neutral', description: 'The average cost to generate one Sales-Qualified Lead (Spend / SQLs).' },
            { title: 'Pipeline Value', value: formatCurrency(pipelineValue, true), change: 'Potential revenue', changeType: 'neutral', description: 'Estimated value of the sales pipeline generated (SQLs * Avg. Deal Size).' },
            { title: 'Forecasted ARR', value: formatCurrency(arr, true), change: 'Annual Recurring Revenue', changeType: 'neutral', description: 'Projected annual recurring revenue from new customers (Customers * Avg. Annual Value).' },
            { title: 'Churn Rate', value: `${churnRate.toFixed(2)}%`, change: 'Customer churn', changeType: 'neutral', description: 'Percentage of customers who churned in the period (Churned / Total Customers).' },
        ];
    }, [totals, spendIncrease, avgDealSize, avgAnnualValue]);

    const originalTotals = useMemo(() => {
        return campaigns.reduce((acc, c) => {
            acc.revenue += c.spend * c.roas;
            acc.sqls += c.sqls || 0;
            acc.customers += c.customers || 0;
            return acc;
        }, { revenue: 0, sqls: 0, customers: 0 });
    }, [campaigns]);

    const forecastChartData = [
        { name: 'Revenue', current: originalTotals.revenue, forecast: totals.revenue },
        { name: 'Customers', current: originalTotals.customers, forecast: totals.customers },
        { name: 'Pipeline', current: originalTotals.sqls * avgDealSize, forecast: totals.sqls * avgDealSize },
    ];

    return (
        <div className="space-y-8">
            <section id="forecasting-controls" className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold flex items-center"><TrendingUpIcon className="w-6 h-6 mr-2 text-brand-secondary"/>Spend Forecasting Controls</h2>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Simulate the impact of changing your ad spend.</p>
                    </div>
                    <div>
                         <label htmlFor="avg-deal-size" className="block text-sm font-medium mb-1">Avg. Deal Size ($)</label>
                         <input
                            id="avg-deal-size"
                            type="number"
                            value={avgDealSize}
                            onChange={(e) => setAvgDealSize(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-primary"
                         />
                    </div>
                     <div>
                         <label htmlFor="avg-annual-value" className="block text-sm font-medium mb-1">Avg. Annual Value ($)</label>
                         <input
                            id="avg-annual-value"
                            type="number"
                            value={avgAnnualValue}
                            onChange={(e) => setAvgAnnualValue(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-primary"
                         />
                    </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => setSpendIncrease(0)} className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-colors ${spendIncrease === 0 ? 'bg-brand-primary text-white shadow' : 'bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Current</button>
                    <button onClick={() => setSpendIncrease(10)} className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-colors ${spendIncrease === 10 ? 'bg-brand-primary text-white shadow' : 'bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600'}`}>+10% Spend</button>
                    <button onClick={() => setSpendIncrease(20)} className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-colors ${spendIncrease === 20 ? 'bg-brand-primary text-white shadow' : 'bg-gray-200 dark:bg-dark-border hover:bg-gray-300 dark:hover:bg-gray-600'}`}>+20% Spend</button>
                </div>
            </section>
            
            <section id="forecasted-kpis">
                <h2 className="text-xl font-bold mb-4">Forecasted Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {kpis.slice(0, 6).map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                    {kpis.slice(6).map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
                </div>
            </section>

            <section id="forecast-visuals">
                <h2 className="text-xl font-bold mb-4">Forecast Visualizations</h2>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-2">Current vs. Forecast</h3>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">Projected growth in key areas based on a {spendIncrease}% spend increase.</p>
                        <div className="h-96">
                           <ForecastChart data={forecastChartData} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                         <h3 className="font-semibold mb-2">Forecast Breakdown</h3>
                         <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-4">Detailed comparison of current and forecasted performance by platform.</p>
                         <div className="h-96 overflow-y-auto">
                            <ForecastingTable originalData={campaigns} forecastedData={forecastedCampaigns} />
                         </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForecastingHub;
