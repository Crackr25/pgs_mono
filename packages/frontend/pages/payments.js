import { useState } from 'react';
import Head from 'next/head';
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  Settings, 
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Building,
  Smartphone
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Form, { FormField } from '../components/common/Form';
import { payments } from '../lib/dummyData';
import { formatDate } from '../lib/utils';

export default function Payments() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSettings, setPayoutSettings] = useState({
    method: 'bank',
    bankName: '',
    accountNumber: '',
    accountName: '',
    swiftCode: '',
    gcashNumber: '',
    mayaNumber: ''
  });

  const handlePayoutSettingsChange = (e) => {
    const { name, value } = e.target;
    setPayoutSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePayoutSettings = (e) => {
    e.preventDefault();
    console.log('Saving payout settings:', payoutSettings);
    setShowPayoutModal(false);
  };

  const commissionColumns = [
    {
      header: 'Order Number',
      key: 'orderNumber',
      render: (value) => (
        <div className="font-medium text-secondary-900">{value}</div>
      )
    },
    {
      header: 'Order Amount',
      key: 'amount',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Commission (10%)',
      key: 'commission',
      render: (value) => (
        <span className="font-medium text-red-600">-{value}</span>
      )
    },
    {
      header: 'Net Amount',
      key: 'netAmount',
      render: (_, row) => {
        const net = parseFloat(row.amount.replace('$', '')) - parseFloat(row.commission.replace('$', ''));
        return (
          <span className="font-medium text-green-600">${net.toFixed(2)}</span>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => (
        <Badge variant={value === 'completed' ? 'success' : 'warning'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      header: 'Date',
      key: 'date',
      render: (value) => (
        <span className="text-secondary-900">{formatDate(value)}</span>
      )
    }
  ];

  const taxReceipts = [
    {
      id: 1,
      period: 'Q4 2023',
      amount: '$2,450.00',
      taxAmount: '$245.00',
      status: 'available',
      downloadUrl: '#'
    },
    {
      id: 2,
      period: 'Q3 2023',
      amount: '$3,120.00',
      taxAmount: '$312.00',
      status: 'available',
      downloadUrl: '#'
    },
    {
      id: 3,
      period: 'Q2 2023',
      amount: '$2,890.00',
      taxAmount: '$289.00',
      status: 'available',
      downloadUrl: '#'
    }
  ];

  const paymentMethods = [
    { value: 'bank', label: 'Bank Transfer', icon: Building },
    { value: 'gcash', label: 'GCash', icon: Smartphone },
    { value: 'maya', label: 'Maya (PayMaya)', icon: Smartphone },
    { value: 'swift', label: 'SWIFT Wire Transfer', icon: Building }
  ];

  return (
    <>
      <Head>
        <title>Payments & Fees - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Payments & Fees</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your payouts, commissions, and tax receipts
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowPayoutModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Payout Settings
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Statement
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-secondary-900">$12,450</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="ml-1 text-sm font-medium text-green-600">+18%</span>
              <span className="ml-1 text-sm text-secondary-500">this month</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Commission Paid</p>
                <p className="text-2xl font-semibold text-secondary-900">$1,245</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-secondary-500">10% platform fee</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending Payout</p>
                <p className="text-2xl font-semibold text-secondary-900">$2,150</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-secondary-500">Next payout: Jan 15</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Available Balance</p>
                <p className="text-2xl font-semibold text-secondary-900">$8,905</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Button size="sm" className="text-xs">Request Payout</Button>
            </div>
          </Card>
        </div>

        {/* Commission Tracker */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Commission Tracker</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <Table columns={commissionColumns} data={payments} />
        </Card>

        {/* Payout History & Tax Receipts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payout History */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Recent Payouts</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">Bank Transfer</p>
                  <p className="text-xs text-secondary-500">Jan 1, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+$2,450.00</p>
                  <Badge variant="success" size="xs">Completed</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">GCash Transfer</p>
                  <p className="text-xs text-secondary-500">Dec 15, 2023</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+$1,890.00</p>
                  <Badge variant="success" size="xs">Completed</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">Bank Transfer</p>
                  <p className="text-xs text-secondary-500">Dec 1, 2023</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">$2,150.00</p>
                  <Badge variant="warning" size="xs">Processing</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Tax Receipts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Tax Receipts</h3>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Request Receipt
              </Button>
            </div>
            <div className="space-y-3">
              {taxReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{receipt.period}</p>
                    <p className="text-xs text-secondary-500">
                      Earnings: {receipt.amount} | Tax: {receipt.taxAmount}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success" size="xs">Available</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Information */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-secondary-900 mb-3">Commission Structure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Platform Fee:</span>
                  <span className="font-medium">10% per transaction</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Payment Processing:</span>
                  <span className="font-medium">2.9% + $0.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Currency Conversion:</span>
                  <span className="font-medium">3.5% (if applicable)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-secondary-900 mb-3">Payout Schedule</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Frequency:</span>
                  <span className="font-medium">Bi-weekly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Next Payout:</span>
                  <span className="font-medium">January 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Minimum Payout:</span>
                  <span className="font-medium">$100.00</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payout Settings Modal */}
      <Modal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Payout Settings"
        size="lg"
      >
        <Form onSubmit={handleSavePayoutSettings} onCancel={() => setShowPayoutModal(false)}>
          <div className="space-y-6">
            <div>
              <label className="form-label">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        payoutSettings.method === method.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method.value}
                        checked={payoutSettings.method === method.value}
                        onChange={handlePayoutSettingsChange}
                        className="sr-only"
                      />
                      <Icon className="w-5 h-5 mr-2 text-secondary-600" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {(payoutSettings.method === 'bank' || payoutSettings.method === 'swift') && (
              <div className="space-y-4">
                <FormField
                  label="Bank Name"
                  name="bankName"
                  value={payoutSettings.bankName}
                  onChange={handlePayoutSettingsChange}
                  required
                  placeholder="Enter bank name"
                />
                
                <FormField
                  label="Account Number"
                  name="accountNumber"
                  value={payoutSettings.accountNumber}
                  onChange={handlePayoutSettingsChange}
                  required
                  placeholder="Enter account number"
                />
                
                <FormField
                  label="Account Name"
                  name="accountName"
                  value={payoutSettings.accountName}
                  onChange={handlePayoutSettingsChange}
                  required
                  placeholder="Enter account holder name"
                />
                
                {payoutSettings.method === 'swift' && (
                  <FormField
                    label="SWIFT Code"
                    name="swiftCode"
                    value={payoutSettings.swiftCode}
                    onChange={handlePayoutSettingsChange}
                    required
                    placeholder="Enter SWIFT/BIC code"
                  />
                )}
              </div>
            )}

            {payoutSettings.method === 'gcash' && (
              <FormField
                label="GCash Mobile Number"
                name="gcashNumber"
                value={payoutSettings.gcashNumber}
                onChange={handlePayoutSettingsChange}
                required
                placeholder="+63 9XX XXX XXXX"
              />
            )}

            {payoutSettings.method === 'maya' && (
              <FormField
                label="Maya Mobile Number"
                name="mayaNumber"
                value={payoutSettings.mayaNumber}
                onChange={handlePayoutSettingsChange}
                required
                placeholder="+63 9XX XXX XXXX"
              />
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please ensure all payment details are accurate. 
                Incorrect information may delay your payouts or result in failed transfers.
              </p>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}
