import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Vet } from '../types';
import Toast from '../components/ui/Toast';

interface WebsiteManagementPageProps {
    vet: Vet;
}

const WebsiteManagementPage: React.FC<WebsiteManagementPageProps> = ({ vet }) => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const getPublicUrl = () => {
        const url = new URL(window.location.origin);
        url.searchParams.set('view', 'vet');
        url.searchParams.set('id', vet.id);
        return url.toString();
    };

    const publicUrl = getPublicUrl();
    const mockSubdomain = `${vet.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.vetsync.ai`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setToast({ message: 'Copied to clipboard!', type: 'success' });
        }).catch(() => {
            setToast({ message: 'Failed to copy.', type: 'error' });
        });
    };

    const embedCode = `<a href="${publicUrl}" 
   target="_blank" 
   style="display: inline-block; padding: 12px 24px; background-color: #0d9488; color: white; text-decoration: none; font-family: sans-serif; border-radius: 8px; font-weight: bold;">
  Book on VetSync AI
</a>`;

    return (
        <PageWrapper title="My Public Website">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="space-y-8 max-w-4xl mx-auto">
                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Public Website Link</h2>
                    <p className="text-gray-600 mb-4">This is your direct, shareable link. Use this link to allow clients to view your profile and book appointments.</p>
                    
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-500">Shareable Link:</p>
                        <input 
                            type="text" 
                            readOnly 
                            value={publicUrl}
                            className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button onClick={() => copyToClipboard(publicUrl)}>Copy Link</Button>
                        <Button variant="secondary" onClick={() => window.open(publicUrl, '_blank')}>
                            View My Site
                        </Button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Integrate on Your Existing Website</h2>
                    <p className="text-gray-600 mb-4">Want to add a booking button to your own website? Copy and paste the code snippet below into your site's HTML where you want the button to appear.</p>

                    <div>
                        <pre className="p-4 bg-gray-800 text-white rounded-md text-sm overflow-x-auto">
                            <code>
                                {embedCode}
                            </code>
                        </pre>
                        <div className="mt-4 text-right">
                            <Button variant="secondary" onClick={() => copyToClipboard(embedCode)}>Copy Code Snippet</Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Branded Subdomain (Future Feature)</h2>
                    <p className="text-gray-600 mb-4">For a more professional look, we plan to offer branded subdomains. Once enabled, your site could look like this:</p>
                     <div className="p-4 bg-gray-100 rounded-lg text-center">
                        <p className="text-xl font-medium text-gray-500">{mockSubdomain}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Note: This feature is not yet active. Please use the shareable link provided above.</p>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default WebsiteManagementPage;