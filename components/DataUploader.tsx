import React, { useState, useRef, useEffect } from 'react';
import { Campaign } from '../types';
import { DownloadIcon, UploadIcon, GoogleSheetsIcon, WarningIcon } from './icons';

declare global {
    var gapi: any;
    var google: any;
}

interface DataUploaderProps {
    onDataUploaded: (data: Campaign[]) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onDataUploaded }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Google Sheets State
    const [googleClientId, setGoogleClientId] = useState('');
    const [scriptUrl, setScriptUrl] = useState('');
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isFetchingSheets, setIsFetchingSheets] = useState(false);
    let tokenClient: any = null;

    useEffect(() => {
        const storedClientId = localStorage.getItem('google-client-id') || '';
        const storedScriptUrl = localStorage.getItem('google-script-url') || '';
        setGoogleClientId(storedClientId);
        setScriptUrl(storedScriptUrl);
        
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (!isOffline) {
            gapi.load('client:oauth2', () => {
                 gapi.client.init({}).then(() => {
                    setIsGapiReady(true);
                 });
            });
        }

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
    }, [isOffline]);

    const initTokenClient = () => {
         if (!googleClientId) {
            setError("Google Client ID is missing. Please set it in the input field.");
            return;
        }
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            callback: (tokenResponse: any) => {
                if (tokenResponse.error) {
                    setError(`Google Sign-In Error: ${tokenResponse.error}`);
                    return;
                }
                setIsSignedIn(true);
                fetchDataFromSheets(tokenResponse.access_token);
            },
        });
    };

    const handleAuthClick = () => {
        if (!googleClientId.trim()) {
            setError('Please enter your Google Client ID first.');
            return;
        }
        if (!scriptUrl.trim()) {
            setError('Please enter your Apps Script URL first.');
            return;
        }
        localStorage.setItem('google-client-id', googleClientId.trim());
        localStorage.setItem('google-script-url', scriptUrl.trim());
        initTokenClient();
        if (tokenClient) {
            tokenClient.requestAccessToken({prompt: ''});
        }
    };

    const handleSignoutClick = () => {
        setIsSignedIn(false);
        setSuccessMessage('Signed out from Google.');
    }

    const fetchDataFromSheets = (accessToken: string) => {
        if (!scriptUrl) {
            setError("Apps Script URL is not set.");
            return;
        }
        setIsFetchingSheets(true);
        setError(null);
        setSuccessMessage(null);

        const fetchUrl = `${scriptUrl}?accessToken=${accessToken}`;

        fetch(fetchUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to fetch data from script.') });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            if (!Array.isArray(data) || data.length === 0) {
                 throw new Error("No data returned from Google Sheets. Ensure sheets are named correctly and not empty.");
            }
            onDataUploaded(data);
            setSuccessMessage(`${data.length} campaigns loaded successfully from Google Sheets!`);
        })
        .catch(err => {
            setError(`Google Sheets Error: ${err.message}`);
        })
        .finally(() => {
            setIsFetchingSheets(false);
        });
    }

    const handleDownloadTemplate = () => {
        const headers = "id,name,platform,status,spend,impressions,clicks,conversions,roas,cpc,ctr,channel,source,contentType,adSetName,date,signups,sqls,customers,onboarded,churnedCustomers";
        const exampleRow = `1,Q4 Promo,"Google Ads",Active,5000,100000,5000,250,6.0,1.00,5.0,"Paid Search","google.com","Search Ad","TOF Bofu",2024-10-05,500,250,100,80,10`;
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "campaign_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const parseCSV = (text: string): Campaign[] => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("CSV must have a header and at least one data row.");
        const header = lines[0].trim().split(',').map(h => h.trim());
        const requiredHeaders = ['id', 'name', 'platform', 'status', 'spend', 'impressions', 'clicks', 'conversions', 'roas', 'cpc', 'ctr', 'date'];
        
        const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
        if (missingHeaders.length > 0) throw new Error(`Invalid CSV headers. Missing required headers: ${missingHeaders.join(', ')}`);
        
        const headerIndexMap = header.reduce((acc, h, i) => ({...acc, [h]: i}), {} as Record<string, number>);

        return lines.slice(1).map((rowStr, index) => {
            const values = (rowStr.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []).map(v => v.replace(/"/g, ''));
            // Pad values if row is shorter than header
            while (values.length < header.length) {
                values.push('');
            }
            try {
                 const status = values[headerIndexMap.status] as 'Active' | 'Paused' | 'Ended';
                 if (!['Active', 'Paused', 'Ended'].includes(status)) throw new Error(`Invalid status value "${status}"`);
                const campaign: Campaign = {
                    id: parseInt(values[headerIndexMap.id], 10) || index,
                    name: values[headerIndexMap.name] || 'N/A',
                    platform: values[headerIndexMap.platform] || 'N/A',
                    status,
                    spend: parseFloat(values[headerIndexMap.spend]) || 0,
                    impressions: parseInt(values[headerIndexMap.impressions], 10) || 0,
                    clicks: parseInt(values[headerIndexMap.clicks], 10) || 0,
                    conversions: parseInt(values[headerIndexMap.conversions], 10) || 0,
                    roas: parseFloat(values[headerIndexMap.roas]) || 0,
                    cpc: parseFloat(values[headerIndexMap.cpc]) || 0,
                    ctr: parseFloat(values[headerIndexMap.ctr]) || 0,
                    channel: values[headerIndexMap.channel] || 'N/A',
                    source: values[headerIndexMap.source] || 'N/A',
                    contentType: values[headerIndexMap.contentType] || 'N/A',
                    adSetName: values[headerIndexMap.adSetName] || 'N/A',
                    date: values[headerIndexMap.date] || new Date().toISOString().split('T')[0],
                    signups: parseInt(values[headerIndexMap.signups], 10) || 0,
                    sqls: parseInt(values[headerIndexMap.sqls], 10) || 0,
                    customers: parseInt(values[headerIndexMap.customers], 10) || 0,
                    onboarded: parseInt(values[headerIndexMap.onboarded], 10) || 0,
                    churnedCustomers: parseInt(values[headerIndexMap.churnedCustomers], 10) || 0,
                };
                return campaign;
            } catch (e) { throw new Error(`Error parsing data in row ${index + 2}: ${(e as Error).message}.`); }
        }).filter((c): c is Campaign => c !== null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsedData = parseCSV(text);
                onDataUploaded(parsedData);
                setSuccessMessage(`${parsedData.length} campaigns loaded successfully from CSV!`);
            } catch (err) { setError(err instanceof Error ? err.message : 'Failed to parse CSV.'); } finally {
                setIsLoading(false);
                if(fileInputRef.current) { fileInputRef.current.value = ""; }
            }
        };
        reader.onerror = () => { setError('Failed to read file.'); setIsLoading(false); };
        reader.readAsText(file);
    };

    return (
        <section id="data-import" className="bg-light-card dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md space-y-6">
            <div>
                <h2 className="text-xl font-bold">Import & Analyze Your Data</h2>
                <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Choose a method to import your campaign data for analysis.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Google Sheets Importer --- */}
                <div className="border border-light-border dark:border-dark-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <GoogleSheetsIcon className="w-6 h-6"/>
                        <h3 className="font-semibold">Connect to Google Sheets</h3>
                    </div>
                    {isOffline ? (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Google Sheets connection is disabled while offline.</p>
                    ) : (
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            Automate your workflow by fetching data directly. You'll need a Google Client ID and an Apps Script deployment URL.
                        </p>
                    )}
                    <div>
                        <label className="text-xs font-medium" htmlFor="google-client-id">Google Client ID</label>
                        <input
                            id="google-client-id"
                            type="text"
                            placeholder="Your Google Client ID"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-sm rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                            disabled={isOffline}
                         />
                    </div>
                     <div>
                        <label className="text-xs font-medium" htmlFor="script-url">Apps Script URL</label>
                        <input
                            id="script-url"
                            type="text"
                            placeholder="Your Apps Script URL"
                            value={scriptUrl}
                            onChange={(e) => setScriptUrl(e.target.value)}
                             className="mt-1 w-full px-3 py-2 text-sm rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                             disabled={isOffline}
                         />
                    </div>
                    <div>
                        {!isSignedIn ? (
                            <button
                                onClick={handleAuthClick}
                                disabled={!isGapiReady || isFetchingSheets || isOffline}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-primary text-white hover:bg-blue-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isFetchingSheets ? 'Fetching...' : 'Connect & Fetch Data'}
                            </button>
                        ) : (
                             <button
                                onClick={handleSignoutClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* --- CSV Uploader --- */}
                 <div className="border border-light-border dark:border-dark-border rounded-lg p-4 space-y-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <UploadIcon className="w-6 h-6"/>
                        <h3 className="font-semibold">Upload via CSV</h3>
                    </div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Manually upload a CSV file. Use our template for the correct format.
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-4">
                        <button
                            onClick={handleDownloadTemplate}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Template
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-secondary text-white hover:bg-teal-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Upload CSV'}
                        </button>
                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
            </div>

            {(error || successMessage) && (
                <div className="mt-4 text-sm">
                    {error && <div className="p-3 rounded-md bg-red-500/10 text-red-500 flex items-center gap-2"><WarningIcon className="w-5 h-5"/>{error}</div>}
                    {successMessage && <div className="p-3 rounded-md bg-green-500/10 text-green-500">{successMessage}</div>}
                </div>
            )}
        </section>
    );
};

export default DataUploader;