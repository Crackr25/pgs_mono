import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
import Pagination from '../components/common/Pagination';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';
import { formatDate, getStatusColor } from '../lib/utils';

export default function Quotes() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quotedLeadTime, setQuotedLeadTime] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize state from URL on component mount and fetch data
  useEffect(() => {
    console.log('useEffect triggered - router.isReady:', router.isReady, 'isAuthenticated:', isAuthenticated);
    if (router.isReady && isAuthenticated) {
      const { page = 1, per_page = 10, search = '', status = 'all' } = router.query;
      
      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(per_page);
      
      // Only update state if values have actually changed
      if (searchTerm !== search || statusFilter !== status) {
        setSearchTerm(search);
        setStatusFilter(status);
      }
      
      // Update pagination info and fetch data together
      setPaginationInfo(prev => {
        const newPaginationInfo = {
          ...prev,
          current_page: currentPage,
          per_page: itemsPerPage
        };
        
        // Fetch data with the new pagination info
        fetchQuotesWithParams(currentPage, itemsPerPage, search, status);
        
        // Only fetch statistics on initial load or when specifically needed
        if (!statistics.total && !statisticsLoading) {
          fetchStatistics();
        }
        
        return newPaginationInfo;
      });
    } else if (router.isReady && !isAuthenticated) {
      console.log('User is not authenticated');
    }
  }, [router.isReady, router.query, isAuthenticated]);

  const updateURL = (params) => {
    const query = { ...router.query, ...params };
    
    // Remove default values to keep URL clean
    if (query.page === 1 || query.page === '1') delete query.page;
    if (query.per_page === 10 || query.per_page === '10') delete query.per_page;
    if (!query.search) delete query.search;
    if (query.status === 'all') delete query.status;
    
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const fetchQuotes = async () => {
    return fetchQuotesWithParams(
      paginationInfo.current_page, 
      paginationInfo.per_page, 
      searchTerm, 
      statusFilter
    );
  };

  const fetchQuotesWithParams = async (page, perPage, search, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page,
        per_page: perPage
      };
      
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      // Removed company_id filter to ensure 'All Status' shows all records consistently
      
      console.log('Fetching quotes with params:', params);
      const response = await apiService.getQuotes(params);
      console.log('Quotes response:', response);
      
      if (response && response.data) {
        setQuotes(response.data);
        setPaginationInfo(prev => ({
          ...prev,
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from || 0,
          to: response.to || 0
        }));
      } else if (Array.isArray(response)) {
        setQuotes(response);
        setPaginationInfo(prev => ({ ...prev, total: response.length, last_page: 1, from: response.length ? 1 : 0, to: response.length }));
      } else {
        console.log('Unexpected response for quotes:', response);
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics separately
  const [statistics, setStatistics] = useState({
    pending: 0,
    responded: 0,
    accepted: 0,
    rejected: 0,
    total: 0,
    responseRate: 0
  });

  const fetchStatistics = async () => {
    if (statisticsLoading) return; // Prevent multiple simultaneous calls
    
    setStatisticsLoading(true);
    try {
      console.log('Fetching statistics...');
      // Use backend aggregated stats to avoid pagination caps
      const params = {};
      if (user?.company?.id) params.company_id = user.company.id;
      const stats = await apiService.getQuoteStats(params);
      console.log('Statistics response:', stats);
      setStatistics({
        pending: stats.pending || 0,
        responded: stats.responded || 0,
        accepted: stats.accepted || 0,
        rejected: stats.rejected || 0,
        total: stats.total || 0,
        responseRate: stats.responseRate || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Set default statistics on error
      setStatistics({
        pending: 0,
        responded: 0,
        accepted: 0,
        rejected: 0,
        total: 0,
        responseRate: 0
      });
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Fetch statistics on component mount and after quote responses
  useEffect(() => {
    if (isAuthenticated) {
      fetchStatistics();
    }
  }, [isAuthenticated]);

  const handleQuoteResponse = async (quoteId, responseData) => {
    try {
      await apiService.respondToQuote(quoteId, responseData);
      // Refresh quotes after response
      fetchQuotes();
      // Refresh aggregated statistics too
      fetchStatistics();
      setSelectedQuote(null);
      setResponseText('');
      setQuotedPrice('');
      setQuotedLeadTime('');
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error responding to quote:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const applyTemplate = (templateId) => {
    const template = autoReplyTemplates.find(t => t.id === parseInt(templateId));
    if (template && selectedQuote) {
      let content = template.content;
      // Replace placeholders with actual data
      content = content.replace('{buyer_name}', selectedQuote.buyer_name);
      content = content.replace('{product_name}', selectedQuote.product?.name || 'Product');
      content = content.replace('{quantity}', selectedQuote.quantity);
      content = content.replace('{target_price}', selectedQuote.target_price);
      content = content.replace('{supplier_name}', user?.company?.name || 'Our Company');
      
      setResponseText(content);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    updateURL({ page: page === 1 ? undefined : page });
  };

  const handlePerPageChange = (perPage) => {
    updateURL({ 
      per_page: perPage === 10 ? undefined : perPage, 
      page: undefined 
    });
  };

  // Search and filter handlers
  const handleSearchChange = (value) => {
    updateURL({ 
      search: value || undefined, 
      page: undefined 
    });
  };

  const handleStatusFilterChange = (status) => {
    updateURL({ 
      status: status === 'all' ? undefined : status, 
      page: undefined 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'responded':
        return <CheckCircle className="w-4 h-4" />;
      case 'accepted':
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
      key: 'product',
      render: (_, row) => (
        <div>
          <div className="font-medium text-secondary-900">{row.product?.name || row.productName}</div>
          <div className="text-sm text-secondary-500">RFQ #{row.id.toString().padStart(4, '0')}</div>
        </div>
      )
    },
    {
      header: 'Buyer',
      key: 'buyer_name',
      render: (value, row) => (
        <div className="font-medium text-secondary-900">{value || row.buyerName}</div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (value) => (
        <span className="text-secondary-900">{parseInt(value || 0).toLocaleString()} units</span>
      )
    },
    {
      header: 'Target Price',
      key: 'target_price',
      render: (value, row) => (
        <span className="font-medium text-secondary-900">{value || row.targetPrice || 'N/A'}</span>
      )
    },
    {
      header: 'Deadline',
      key: 'deadline',
      render: (value) => (
        <span className="text-secondary-900">{value ? formatDate(value) : 'N/A'}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => (
        <Badge variant={value === 'pending' ? 'warning' : (value === 'responded' || value === 'accepted') ? 'success' : 'danger'}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(value)}
            <span>{value?.charAt(0).toUpperCase() + value?.slice(1) || 'Unknown'}</span>
          </div>
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedQuote(row)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Respond
            </Button>
          )}
          {row.status === 'responded' && (
            <Badge variant="info" className="text-xs">
              Awaiting Decision
            </Badge>
          )}
          {row.status === 'accepted' && (
            <Badge variant="success" className="text-xs">
              Accepted
            </Badge>
          )}
          {row.status === 'rejected' && (
            <Badge variant="danger" className="text-xs">
              Rejected
            </Badge>
          )}
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
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Manage Templates
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {statistics.pending}
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
                  {statistics.responded}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Accepted</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {statistics.accepted}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Rejected</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {statistics.rejected}
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
                <p className="text-2xl font-semibold text-secondary-900">{statistics.total}</p>
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
                <p className="text-2xl font-semibold text-secondary-900">{statistics.responseRate}%</p>
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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="accepted">Accepted</option>
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
          {loading ? (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-secondary-600">Loading quotes...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
            <Table columns={columns} data={quotes} />
          )}
        </Card>

        {/* Pagination */}
        {paginationInfo.last_page > 1 && (
          <Pagination
            currentPage={paginationInfo.current_page}
            lastPage={paginationInfo.last_page}
            total={paginationInfo.total}
            perPage={paginationInfo.per_page}
            from={paginationInfo.from}
            to={paginationInfo.to}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            showPerPageSelector={true}
            showInfo={true}
          />
        )}

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                // TODO: Implement bulk response functionality
                alert('Bulk response feature coming soon!');
              }}
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              Bulk Response
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                // Export quotes as CSV
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "ID,Product,Buyer,Quantity,Target Price,Deadline,Status\n"
                  + quotes.map(q => 
                    `${q.id},${q.productName},${q.buyerName},${q.quantity},${q.targetPrice},${q.deadline},${q.status}`
                  ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "quotes.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <FileText className="w-6 h-6 mb-2" />
              Export RFQs
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setShowTemplateModal(true)}
            >
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implement edit template functionality
                      console.log('Edit template:', template.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template.id.toString());
                      applyTemplate(template.id.toString());
                      setShowTemplateModal(false);
                    }}
                  >
                    Use
                  </Button>
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
                <div>Product: {selectedQuote.product?.name || 'N/A'}</div>
                <div>Buyer: {selectedQuote.buyer_name}</div>
                <div>Quantity: {selectedQuote.quantity} units</div>
                <div>Target Price: {selectedQuote.target_price}</div>
                <div>Deadline: {formatDate(selectedQuote.deadline)}</div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-secondary-600">Message:</p>
                <p className="text-sm text-secondary-900">{selectedQuote.message}</p>
              </div>
            </div>
            
            <div>
              <label className="form-label">Select Template</label>
              <select 
                className="form-input"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                  }
                }}
              >
                <option value="">Choose a template...</option>
                {autoReplyTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label">Your Response</label>
              <textarea
                rows={6}
                className="form-input"
                placeholder="Type your response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Quoted Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Lead Time</label>
                <select
                  className="form-input"
                  value={quotedLeadTime}
                  onChange={(e) => setQuotedLeadTime(e.target.value)}
                >
                  <option value="">Select lead time</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="4-6 weeks">4-6 weeks</option>
                  <option value="6-8 weeks">6-8 weeks</option>
                  <option value="8-12 weeks">8-12 weeks</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                Cancel
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button onClick={() => {
                if (!responseText.trim()) {
                  alert('Please enter a response message');
                  return;
                }
                if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
                  alert('Please enter a valid quoted price');
                  return;
                }
                if (!quotedLeadTime) {
                  alert('Please select a lead time');
                  return;
                }
                handleQuoteResponse(selectedQuote.id, {
                  response_message: responseText,
                  quoted_price: parseFloat(quotedPrice),
                  quoted_lead_time: quotedLeadTime,
                  template_id: selectedTemplate || null
                });
              }}>
                Send Response
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
