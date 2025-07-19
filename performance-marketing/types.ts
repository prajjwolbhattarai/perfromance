
export enum Theme {
    LIGHT = 'light',
    DARK = 'dark'
}

export enum Platform {
    Google = 'Google Ads',
    Meta = 'Meta Ads',
    LinkedIn = 'LinkedIn Ads',
    TikTok = 'TikTok Ads',
    Reddit = 'Reddit Ads',
    Spotify = 'Spotify Ads',
}

export interface Kpi {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    description?: string;
}

export interface ChartDataPoint {
    date: string;
    ROAS: number;
    Spend: number;
    CTR: number;
}

export type FunnelStageKey = 'impressions' | 'clicks' | 'conversions' | 'signups' | 'sqls' | 'customers' | 'onboarded';

export interface Campaign {
    id: number;
    name: string;
    platform: Platform | string;
    status: 'Active' | 'Paused' | 'Ended';
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
    cpc: number;
    ctr: number;
    channel: string;
    source: string;
    contentType: string;
    date: string; // YYYY-MM-DD format
    adSetName: string;

    // Optional detailed conversion metrics
    signups?: number;
    sqls?: number;
    customers?: number;
    onboarded?: number;
    churnedCustomers?: number;
}
