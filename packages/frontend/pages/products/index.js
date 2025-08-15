import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Search, Filter, Upload, Grid, List } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ProductCard from '../../components/products/ProductCard';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showRFQMatching, setShowRFQMatching] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts();
      setProductList(response.data || response);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        setProductList(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const filteredProducts = productList.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockRFQs = [
    {
      id: 1,
      title: "LED Light Fixtures - 1000 units",
      buyer: "ABC Electronics",
      targetPrice: "$20.00",
      quantity: 1000,
      matchScore: 95
    },
    {
      id: 2,
      title: "Automotive Components - Bulk Order",
      buyer: "XYZ Motors",
      targetPrice: "$8.00",
      quantity: 2000,
      matchScore: 87
    }
  ];

  return (
    <>
      <Head>
        <title>Products - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your product catalog and listings
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowBulkUpload(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Link href="/products/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600">View:</span>
              <div className="flex border border-secondary-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* RFQ Matching Alert */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                New RFQ Matches Available
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                We found {mockRFQs.length} RFQs that match your products. 
                Review and respond to increase your sales opportunities.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRFQMatching(true)}
            >
              View Matches
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading products...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-red-800">
              <p className="font-medium">Error loading products</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-secondary-600">
              {searchTerm ? 'No products found matching your search.' : 'No products found. Add your first product to get started.'}
            </p>
            {!searchTerm && (
              <Link href="/products/add">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Products Grid/List */}
        {!loading && !error && filteredProducts.length > 0 && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      MOQ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-secondary-600">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {product.hsCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {product.moq}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/products/edit/${product.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          )
        )}
      </div>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Bulk Product Upload"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              CSV Upload Instructions
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Download our CSV template first</li>
              <li>• Fill in all required fields</li>
              <li>• Maximum 100 products per upload</li>
              <li>• Images should be uploaded separately</li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              Download Template
            </Button>
            <Button variant="outline">
              Upload CSV
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
            <p className="text-sm text-secondary-600">
              Drag and drop your CSV file here, or click to browse
            </p>
          </div>
        </div>
      </Modal>

      {/* RFQ Matching Modal */}
      <Modal
        isOpen={showRFQMatching}
        onClose={() => setShowRFQMatching(false)}
        title="RFQ Matches"
        size="lg"
      >
        <div className="space-y-4">
          {mockRFQs.map((rfq) => (
            <div key={rfq.id} className="p-4 border border-secondary-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-secondary-900">{rfq.title}</h4>
                <span className="text-sm font-medium text-green-600">
                  {rfq.matchScore}% match
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-secondary-600 mb-3">
                <div>Buyer: {rfq.buyer}</div>
                <div>Quantity: {rfq.quantity}</div>
                <div>Target Price: {rfq.targetPrice}</div>
                <div>Match Score: {rfq.matchScore}%</div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm">Send Quote</Button>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
