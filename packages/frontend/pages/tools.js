import { useState } from 'react';
import Head from 'next/head';
import { 
  Calculator, 
  Truck, 
  Package, 
  CheckCircle, 
  Settings, 
  ExternalLink,
  Plus,
  Download,
  Upload,
  Globe,
  Shield
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Form, { FormField } from '../components/common/Form';
import Table from '../components/common/Table';

export default function Tools() {
  const [showShippingCalc, setShowShippingCalc] = useState(false);
  const [showSampleManager, setShowSampleManager] = useState(false);
  const [shippingData, setShippingData] = useState({
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    value: ''
  });

  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateShipping = (e) => {
    e.preventDefault();
    console.log('Calculating shipping for:', shippingData);
    // Mock calculation result
    alert('Estimated shipping cost: $45.50 via DHL Express (3-5 business days)');
  };

  const integrationCards = [
    {
      name: 'DHL Express',
      description: 'International express shipping and tracking',
      status: 'connected',
      icon: Truck,
      color: 'yellow'
    },
    {
      name: 'FedEx',
      description: 'Global shipping and logistics solutions',
      status: 'available',
      icon: Truck,
      color: 'purple'
    },
    {
      name: 'UPS',
      description: 'Worldwide package delivery and supply chain',
      status: 'available',
      icon: Truck,
      color: 'brown'
    },
    {
      name: 'Alibaba Trade Assurance',
      description: 'Secure payment and order protection',
      status: 'connected',
      icon: Shield,
      color: 'orange'
    },
    {
      name: 'PayPal',
      description: 'Online payment processing',
      status: 'connected',
      icon: Globe,
      color: 'blue'
    },
    {
      name: 'Stripe',
      description: 'Payment processing platform',
      status: 'available',
      icon: Globe,
      color: 'blue'
    }
  ];

  const sampleRequests = [
    {
      id: 1,
      product: 'LED Light Fixture 50W',
      buyer: 'ABC Electronics',
      quantity: 3,
      status: 'pending',
      requestDate: '2024-01-10',
      shippingAddress: '123 Main St, New York, NY'
    },
    {
      id: 2,
      product: 'Automotive Wire Harness',
      buyer: 'XYZ Motors',
      quantity: 5,
      status: 'shipped',
      requestDate: '2024-01-08',
      shippingAddress: '456 Oak Ave, Los Angeles, CA'
    },
    {
      id: 3,
      product: 'Solar Panel Kit',
      buyer: 'Green Energy Co',
      quantity: 2,
      status: 'delivered',
      requestDate: '2024-01-05',
      shippingAddress: '789 Pine St, Chicago, IL'
    }
  ];

  const complianceChecklist = [
    {
      item: 'Product Safety Certification (CE/UL)',
      status: 'completed',
      description: 'Ensure products meet safety standards'
    },
    {
      item: 'Export Documentation',
      status: 'completed',
      description: 'Commercial invoice, packing list, certificate of origin'
    },
    {
      item: 'HS Code Classification',
      status: 'completed',
      description: 'Proper customs classification for all products'
    },
    {
      item: 'REACH Compliance (EU)',
      status: 'pending',
      description: 'Chemical safety requirements for EU market'
    },
    {
      item: 'RoHS Compliance',
      status: 'completed',
      description: 'Restriction of hazardous substances'
    },
    {
      item: 'FDA Registration (if applicable)',
      status: 'not_applicable',
      description: 'Required for food, medical, and cosmetic products'
    }
  ];

  const sampleColumns = [
    {
      header: 'Product',
      key: 'product',
      render: (value) => (
        <div className="font-medium text-secondary-900">{value}</div>
      )
    },
    {
      header: 'Buyer',
      key: 'buyer',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (value) => (
        <span className="text-secondary-900">{value} pcs</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const getVariant = (status) => {
          switch (status) {
            case 'pending': return 'warning';
            case 'shipped': return 'info';
            case 'delivered': return 'success';
            default: return 'default';
          }
        };
        return (
          <Badge variant={getVariant(value)}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      }
    },
    {
      header: 'Request Date',
      key: 'requestDate',
      render: (value) => (
        <span className="text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {row.status === 'pending' && (
            <Button size="sm">
              Process
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>Integrations & Tools - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Integrations & Tools</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your business tools and third-party integrations
            </p>
          </div>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Browse Integrations
          </Button>
        </div>

        {/* Quick Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowShippingCalc(true)}>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-secondary-900">Shipping Calculator</h3>
                <p className="text-sm text-secondary-600">Calculate shipping costs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowSampleManager(true)}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-secondary-900">Sample Manager</h3>
                <p className="text-sm text-secondary-600">Track sample requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-secondary-900">Compliance Check</h3>
                <p className="text-sm text-secondary-600">Verify requirements</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-secondary-900">Export Tools</h3>
                <p className="text-sm text-secondary-600">Generate documents</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Logistics Integrations */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Logistics API Integrations</h3>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrationCards.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-secondary-100 rounded">
                        <Icon className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-secondary-900">{integration.name}</h4>
                        <p className="text-sm text-secondary-600">{integration.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={integration.status === 'connected' ? 'success' : 'default'}
                      size="xs"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                      </>
                    ) : (
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sample Request Manager */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">Sample Request Manager</h3>
            <Button variant="outline" size="sm" onClick={() => setShowSampleManager(true)}>
              <Package className="w-4 h-4 mr-2" />
              View All Requests
            </Button>
          </div>
          <Table columns={sampleColumns} data={sampleRequests} />
        </Card>

        {/* AI Compliance Checklist */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-secondary-900">AI Compliance Checklist</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="info" size="sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>AI Powered</span>
                </div>
              </Badge>
              <Button variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Run Check
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {complianceChecklist.map((item, index) => {
              const getStatusIcon = (status) => {
                switch (status) {
                  case 'completed':
                    return <CheckCircle className="w-5 h-5 text-green-600" />;
                  case 'pending':
                    return <div className="w-5 h-5 border-2 border-yellow-600 rounded-full" />;
                  case 'not_applicable':
                    return <div className="w-5 h-5 border-2 border-secondary-300 rounded-full" />;
                  default:
                    return <div className="w-5 h-5 border-2 border-secondary-300 rounded-full" />;
                }
              };

              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900">{item.item}</h4>
                    <p className="text-sm text-secondary-600">{item.description}</p>
                  </div>
                  <Badge 
                    variant={
                      item.status === 'completed' ? 'success' : 
                      item.status === 'pending' ? 'warning' : 'default'
                    }
                    size="xs"
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Export Tools */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Export & Documentation Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Commercial Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Packing List</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Certificate of Origin</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Shipping Calculator Modal */}
      <Modal
        isOpen={showShippingCalc}
        onClose={() => setShowShippingCalc(false)}
        title="Shipping Calculator"
        size="lg"
      >
        <Form onSubmit={calculateShipping} onCancel={() => setShowShippingCalc(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Origin Country"
              name="origin"
              value={shippingData.origin}
              onChange={handleShippingInputChange}
              required
              placeholder="Philippines"
            />
            
            <FormField
              label="Destination Country"
              name="destination"
              value={shippingData.destination}
              onChange={handleShippingInputChange}
              required
              placeholder="United States"
            />
            
            <FormField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={shippingData.weight}
              onChange={handleShippingInputChange}
              required
              placeholder="10"
            />
            
            <FormField
              label="Dimensions (L×W×H cm)"
              name="dimensions"
              value={shippingData.dimensions}
              onChange={handleShippingInputChange}
              required
              placeholder="50×30×20"
            />
          </div>
          
          <FormField
            label="Declared Value (USD)"
            name="value"
            type="number"
            value={shippingData.value}
            onChange={handleShippingInputChange}
            required
            placeholder="500"
          />
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Shipping costs are estimates and may vary based on actual 
              package dimensions, weight, and current shipping rates.
            </p>
          </div>
        </Form>
      </Modal>

      {/* Sample Manager Modal */}
      <Modal
        isOpen={showSampleManager}
        onClose={() => setShowSampleManager(false)}
        title="Sample Request Manager"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-secondary-600">
              Manage all your product sample requests in one place.
            </p>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Sample Request
            </Button>
          </div>
          
          <Table columns={sampleColumns} data={sampleRequests} />
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSampleManager(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
