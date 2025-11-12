import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const TestInvitation = () => {
    const router = useRouter();
    const [token, setToken] = useState('');

    const handleTestInvitation = () => {
        if (token.trim()) {
            router.push(`/agents/accept-invitation?token=${token.trim()}`);
        } else {
            alert('Please enter an invitation token');
        }
    };

    return (
        <>
            <Head>
                <title>Test Agent Invitation</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Test Agent Invitation
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter the invitation token to test the acceptance flow
                        </p>
                    </div>
                    
                    <div className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                                Invitation Token
                            </label>
                            <textarea
                                id="token"
                                name="token"
                                rows={4}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Paste the invitation token here..."
                            />
                        </div>

                        <div>
                            <button
                                onClick={handleTestInvitation}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Test Invitation
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h3 className="text-sm font-medium text-yellow-800">How to get the invitation token:</h3>
                            <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                <li>Create an agent from the Agent Management page</li>
                                <li>Check the database table `company_agents`</li>
                                <li>Copy the `invitation_token` value</li>
                                <li>Paste it here to test the invitation flow</li>
                            </ol>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h3 className="text-sm font-medium text-blue-800">Alternative: Direct Database Query</h3>
                            <code className="mt-2 block text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                SELECT invitation_token FROM company_agents WHERE invitation_token IS NOT NULL ORDER BY created_at DESC LIMIT 1;
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TestInvitation;
