import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  DollarSign, 
  Calendar, 
  Filter, 
  Download,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';

export default function BuyerTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock transaction data
      const mockTransactions = [
        {
          id: 'TXN-2024-001',
          supplier: 'Manila Manufacturing Corp',
          amount: 25000,
          status: 'completed',
          date: '2024-01-15',
          type: 'payment',
          description: 'LED Light Fixtures - 1000 units'
        },
        {
          id: 'TXN-2024-002',
          supplier: 'Cebu Industrial Solutions',
          amount: 42500,
          status: 'pending',
          date: '2024-01-14',
          type: 'payment',
          description: 'Industrial Pumps - 50 units'
        },
        {
          id: 'TXN-2024-003',
          supplier: 'Davao Steel Works',
          amount: 9000,
          status: 'failed',
          date: '2024-01-13',
          type: 'refund',
          description: 'Steel Pipes - Partial refund'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Transactions - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Transactions</h1>
            <p className="mt-1 text-sm text-secondary-600">
              View and manage your payment transactions
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Transactions</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary-500" />
              <span className="text-sm text-secondary-600">{transactions.length} transactions</span>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900">{transaction.description}</h3>
                    <p className="text-sm text-secondary-600">{transaction.supplier}</p>
                    <p className="text-xs text-secondary-500">ID: {transaction.id}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-secondary-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {transactions.length === 0 && (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No transactions found</h3>
            <p className="text-secondary-600">Your transaction history will appear here once you start making purchases.</p>
          </Card>
        )}
      </div>
    </>
  );
}
