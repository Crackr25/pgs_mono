import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Filter,
  Search,
  Plus
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';
import { formatDate, getStatusColor } from '../lib/utils';

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuotes();
    }
  }, [isAuthenticated]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getQuotes();
      setQuotes(response.data || response);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteResponse = async (quoteId, responseData) => {
    try {
      await apiService.respondToQuote(quoteId, responseData);
      // Refresh quotes after response
      fetchQuotes();
    } catch (error) {
      console.error('Error responding to quote:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = (quote.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.buyer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'responded':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const autoReplyTemplates = [
    {
      id: 1,
      name: 'Standard Quote Response',
      subject: 'Re: Your Product Inquiry',
      content: `Dear {buyer_name},

Thank you for your interest in our {product_name}.

Based on your requirements:
- Quantity: {quantity} units
- Target Price: {target_price}

We are pleased to offer:
- Our Price: $XX.XX per unit
- MOQ: XXX units
- Lead Time: XX-XX days
- Payment Terms: 30% advance, 70% before shipment

Please let us know if you need any additional information.

Best regards,
{supplier_name}`
    },
    {
      id: 2,
      name: 'Sample Request Response',
      subject: 'Sample Availability - {product_name}',
      content: `Dear {buyer_name},

Thank you for your inquiry about {product_name}.

We would be happy to provide samples for your evaluation:
- Sample Cost: $XX.XX per piece
- Shipping: Via DHL/FedEx
- Lead Time: 3-5 business days

Please confirm your shipping address and we'll send you a proforma invoice.

Best regards,
{supplier_name}`
    },
    {
      id: 3,
      name: 'Custom Requirements',
      subject: 'Custom Solution for {product_name}',
      content: `Dear {buyer_name},

Thank you for your detailed requirements for {product_name}.

We can customize the product according to your specifications:
- Custom Features: [List customizations]
- Additional Cost: $XX.XX per unit
- Extended Lead Time: XX-XX days

Would you like to schedule a call to discuss further?

Best regards,
{supplier_name}`
    }
  ];

  const columns = [
    {
      header: 'Product',
      key: 'productName',
      render: (value, row) => (
        <div>
          <div className="font-medium text-secondary-900">{value}</div>
          <div className="text-sm text-secondary-500">RFQ #{row.id.toString().padStart(4, '0')}</div>
        </div>
      )
    },
    {
      header: 'Buyer',
      key: 'buyerName',
      render: (value) => (
        <div className="font-medium text-secondary-900">{value}</div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (value) => (
        <span className="text-secondary-900">{value.toLocaleString()} units</span>
      )
    },
    {
      header: 'Target Price',
      key: 'targetPrice',
      render: (value) => (
        <span className="font-medium text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Deadline',
      key: 'deadline',
      render: (value) => (
        <span className="text-secondary-900">{formatDate(value)}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => (
        <Badge variant={value === 'pending' ? 'warning' : value === 'responded' ? 'success' : 'danger'}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(value)}
            <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
          </div>
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedQuote(row)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Respond
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>Quotes - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Quotes & RFQs</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage incoming requests for quotations and respond to buyers
            </p>
          </div>
          <Button onClick={() => setShowTemplateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Manage Templates
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {quotes.filter(q => q.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Responded</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {quotes.filter(q => q.status === 'responded').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total RFQs</p>
                <p className="text-2xl font-semibold text-secondary-900">{quotes.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Response Rate</p>
                <p className="text-2xl font-semibold text-secondary-900">85%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Quotes Table */}
        <Card>
          <Table columns={columns} data={filteredQuotes} />
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="w-6 h-6 mb-2" />
              Bulk Response
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              Export RFQs
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              Create Template
            </Button>
          </div>
        </Card>
      </div>

      {/* Auto-Reply Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Auto-Reply Templates"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            Manage your auto-reply templates to respond quickly to RFQs.
          </p>
          
          {autoReplyTemplates.map((template) => (
            <div key={template.id} className="p-4 border border-secondary-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-secondary-900">{template.name}</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Use</Button>
                </div>
              </div>
              <p className="text-sm text-secondary-600 mb-2">Subject: {template.subject}</p>
              <div className="bg-secondary-50 p-3 rounded text-sm text-secondary-700 whitespace-pre-line">
                {template.content.substring(0, 200)}...
              </div>
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Close
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quote Response Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Respond to RFQ #${selectedQuote.id.toString().padStart(4, '0')}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">RFQ Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Product: {selectedQuote.productName}</div>
                <div>Buyer: {selectedQuote.buyerName}</div>
                <div>Quantity: {selectedQuote.quantity} units</div>
                <div>Target Price: {selectedQuote.targetPrice}</div>
                <div>Deadline: {formatDate(selectedQuote.deadline)}</div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-secondary-600">Message:</p>
                <p className="text-sm text-secondary-900">{selectedQuote.message}</p>
              </div>
            </div>
            
            <div>
              <label className="form-label">Select Template</label>
              <select className="form-input">
                <option>Choose a template...</option>
                {autoReplyTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Your Response</label>
              <textarea
                rows={8}
                className="form-input"
                placeholder="Type your response here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                Cancel
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button>
                Send Response
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
