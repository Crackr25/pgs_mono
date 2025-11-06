import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';

export default function BuyerContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Mock contacts data
      const mockContacts = [
        {
          id: 1,
          name: 'Manila Manufacturing Corp',
          contactPerson: 'Juan Dela Cruz',
          email: 'juan@manilamfg.com',
          phone: '+63 2 123 4567',
          location: 'Metro Manila',
          rating: 4.8,
          orders: 15,
          lastContact: '2024-01-15',
          category: 'supplier'
        },
        {
          id: 2,
          name: 'Cebu Industrial Solutions',
          contactPerson: 'Maria Santos',
          email: 'maria@cebuindustrial.com',
          phone: '+63 32 987 6543',
          location: 'Cebu',
          rating: 4.9,
          orders: 12,
          lastContact: '2024-01-14',
          category: 'supplier'
        },
        {
          id: 3,
          name: 'Davao Steel Works',
          contactPerson: 'Pedro Rodriguez',
          email: 'pedro@davaosteel.com',
          phone: '+63 82 555 1234',
          location: 'Davao',
          rating: 4.7,
          orders: 8,
          lastContact: '2024-01-13',
          category: 'supplier'
        }
      ];
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || contact.category === filter;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
        <title>Contacts - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Contacts</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your supplier and business contacts
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Contacts</option>
                <option value="supplier">Suppliers</option>
                <option value="buyer">Buyers</option>
                <option value="partner">Partners</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary-500" />
              <span className="text-sm text-secondary-600">{filteredContacts.length} contacts</span>
            </div>
          </div>
        </Card>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-600">
                      {contact.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900">{contact.name}</h3>
                    <p className="text-sm text-secondary-600">{contact.contactPerson}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Mail className="w-4 h-4" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <MapPin className="w-4 h-4" />
                  <span>{contact.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(contact.rating)}
                  <span className="text-sm text-secondary-600 ml-1">({contact.rating})</span>
                </div>
                <span className="text-sm text-secondary-600">{contact.orders} orders</span>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t border-secondary-200">
                <p className="text-xs text-secondary-500">
                  Last contact: {new Date(contact.lastContact).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No contacts found</h3>
            <p className="text-secondary-600">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Start building your network by adding contacts.'}
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
