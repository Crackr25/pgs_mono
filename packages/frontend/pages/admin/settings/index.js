import Head from 'next/head';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function Settings() {
  return (
    <>
      <Head>
        <title>Settings - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure platform settings and preferences
            </p>
          </div>
        </div>

        {/* General Settings */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Pinoy Global Supply"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@pinoyglobalsupply.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Commission (%)
              </label>
              <input
                type="number"
                defaultValue="7"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Feature Toggles</h3>
          <div className="space-y-4">
            {[
              { name: 'User Registration', enabled: true },
              { name: 'Product Listings', enabled: true },
              { name: 'Chat System', enabled: true },
              { name: 'RFQ System', enabled: true },
              { name: 'Maintenance Mode', enabled: false }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={feature.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Email Settings */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  placeholder="587"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>TLS</option>
                  <option>SSL</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </>
  );
}
