
import { Kpi, ChartDataPoint, Campaign, Platform } from '../types';

export const kpis: Kpi[] = [
  { title: 'ROAS', value: '4.5x', change: '+12%', changeType: 'positive' },
  { title: 'Spend', value: '$150k', change: '+5%', changeType: 'negative' },
  { title: 'Impressions', value: '2.1M', change: '+8%', changeType: 'positive' },
  { title: 'Clicks', value: '84k', change: '+15%', changeType: 'positive' },
  { title: 'Conversions', value: '5.2k', change: '+18%', changeType: 'positive' },
  { title: 'CTR', value: '4.0%', change: '+7%', changeType: 'positive' },
];

export const chartData: ChartDataPoint[] = [
  { date: 'Jan', ROAS: 3.2, Spend: 12000, CTR: 2.5 },
  { date: 'Feb', ROAS: 3.8, Spend: 15000, CTR: 2.8 },
  { date: 'Mar', ROAS: 4.1, Spend: 18000, CTR: 3.1 },
  { date: 'Apr', ROAS: 4.0, Spend: 17500, CTR: 3.5 },
  { date: 'May', ROAS: 4.8, Spend: 22000, CTR: 3.8 },
  { date: 'Jun', ROAS: 5.2, Spend: 25000, CTR: 4.2 },
  { date: 'Jul', ROAS: 4.9, Spend: 23000, CTR: 4.1 },
  { date: 'Aug', ROAS: 4.5, Spend: 21000, CTR: 4.0 },
];

export const campaigns: Campaign[] = [
  { id: 1, name: 'Q3 Lead Gen - Search', platform: Platform.Google, status: 'Active', spend: 25000, impressions: 500000, clicks: 20000, conversions: 1200, roas: 5.1, cpc: 1.25, ctr: 4.0, channel: 'Paid Search', source: 'google.com', contentType: 'Text Ad', date: '2024-08-05', adSetName: 'Top of Funnel', signups: 3000, sqls: 1500, customers: 1000, onboarded: 950, churnedCustomers: 50 },
  { id: 2, name: 'Summer Sale - Retargeting', platform: Platform.Meta, status: 'Active', spend: 18000, impressions: 800000, clicks: 15000, conversions: 950, roas: 6.2, cpc: 1.20, ctr: 1.88, channel: 'Paid Social', source: 'facebook.com', contentType: 'Carousel Ad', date: '2024-07-20', adSetName: 'Bottom of Funnel', signups: 2000, sqls: 1100, customers: 900, onboarded: 850, churnedCustomers: 30 },
  { id: 3, name: 'B2B Webinar Promotion', platform: Platform.LinkedIn, status: 'Ended', spend: 12000, impressions: 150000, clicks: 3000, conversions: 200, roas: 4.0, cpc: 4.00, ctr: 2.0, channel: 'Paid Social', source: 'linkedin.com', contentType: 'Sponsored Content', date: '2024-06-15', adSetName: 'Mid-Funnel Content', signups: 500, sqls: 250, customers: 150, onboarded: 140, churnedCustomers: 15 },
  { id: 4, name: 'Brand Awareness - Gen Z', platform: Platform.TikTok, status: 'Active', spend: 35000, impressions: 2500000, clicks: 75000, conversions: 1500, roas: 3.5, cpc: 0.47, ctr: 3.0, channel: 'Paid Social', source: 'tiktok.com', contentType: 'Video Ad', date: '2024-08-10', adSetName: 'Awareness Campaign', signups: 4000, sqls: 1800, customers: 1400, onboarded: 1300, churnedCustomers: 80 },
  { id: 5, name: 'Community Engagement', platform: Platform.Reddit, status: 'Paused', spend: 5000, impressions: 100000, clicks: 2500, conversions: 50, roas: 2.0, cpc: 2.00, ctr: 2.5, channel: 'Organic Social', source: 'reddit.com', contentType: 'Community Post', date: '2024-05-25', adSetName: 'Community Building', signups: 100, sqls: 60, customers: 40, onboarded: 30, churnedCustomers: 8 },
  { id: 6, name: 'Podcast Sponsorships', platform: Platform.Spotify, status: 'Active', spend: 8000, impressions: 300000, clicks: 1200, conversions: 100, roas: 4.8, cpc: 6.67, ctr: 0.4, channel: 'Paid Audio', source: 'spotify.com', contentType: 'Audio Ad', date: '2024-07-30', adSetName: 'Audio Branding', signups: 200, sqls: 120, customers: 90, onboarded: 90, churnedCustomers: 5 },
  { id: 7, name: 'Q3 Brand - Display', platform: Platform.Google, status: 'Active', spend: 22000, impressions: 1200000, clicks: 6000, conversions: 400, roas: 3.9, cpc: 3.67, ctr: 0.5, channel: 'Paid Display', source: 'google.com', contentType: 'Banner Ad', date: '2024-07-10', adSetName: 'Display Awareness', signups: 800, sqls: 450, customers: 350, onboarded: 300, churnedCustomers: 25 },
  { id: 8, name: 'Holiday Promo - Carousel Ads', platform: Platform.Meta, status: 'Paused', spend: 15000, impressions: 600000, clicks: 12000, conversions: 800, roas: 5.5, cpc: 1.25, ctr: 2.0, channel: 'Paid Social', source: 'instagram.com', contentType: 'Carousel Ad', date: '2024-06-28', adSetName: 'Seasonal Promotion', signups: 1500, sqls: 900, customers: 750, onboarded: 700, churnedCustomers: 40 },
];
