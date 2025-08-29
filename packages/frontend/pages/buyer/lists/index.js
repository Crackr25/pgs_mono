import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Bookmark, 
  Search, 
  Plus, 
  Heart,
  Star,
  Trash2,
  Eye,
  Filter,
  Grid,
  List
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';

export default function BuyerLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      // Mock lists data
      const mockLists = [
        {
          id: 1,
          name: 'Favorite Suppliers',
          type: 'suppliers',
          itemCount: 12,
          lastUpdated: '2024-01-15',
          description: 'My most trusted suppliers for regular orders',
          isPublic: false
        },
        {
          id: 2,
          name: 'Electronics Wishlist',
          type: 'products',
          itemCount: 25,
          lastUpdated: '2024-01-14',
          description: 'Electronic components for upcoming projects',
          isPublic: true
        },
        {
          id: 3,
          name: 'Machinery Vendors',
          type: 'suppliers',
          itemCount: 8,
          lastUpdated: '2024-01-13',
          description: 'Industrial machinery suppliers',
          isPublic: false
        },
        {
          id: 4,
          name: 'Construction Materials',
          type: 'products',
          itemCount: 18,
          lastUpdated: '2024-01-12',
          description: 'Building and construction supplies',
          isPublic: true
        }
      ];
      setLists(mockLists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getListIcon = (type) => {
    switch (type) {
      case 'suppliers': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'products': return <Heart className="w-5 h-5 text-red-500" />;
      default: return <Bookmark className="w-5 h-5 text-blue-500" />;
    }
  };

  const ListCard = ({ list }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
            {getListIcon(list.type)}
          </div>
          <div>
            <h3 className="font-medium text-secondary-900">{list.name}</h3>
            <p className="text-sm text-secondary-600 capitalize">{list.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {list.isPublic && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Public
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-secondary-600 mb-4">{list.description}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-secondary-600">{list.itemCount} items</span>
        <span className="text-xs text-secondary-500">
          Updated {new Date(list.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

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
        <title>My Lists - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Lists</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Organize your favorite suppliers and products
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </div>
        </div>

        {/* Search and View Controls */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">{filteredLists.length} lists</span>
              <div className="flex border border-secondary-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-secondary-600 hover:bg-secondary-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Lists Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredLists.map(list => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>

        {filteredLists.length === 0 && (
          <Card className="p-12 text-center">
            <Bookmark className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No lists found</h3>
            <p className="text-secondary-600 mb-4">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first list to organize suppliers and products.'}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
