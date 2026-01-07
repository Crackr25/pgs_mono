import { useState } from 'react';
import Head from 'next/head';
import { 
  HelpCircle, 
  Book, 
  Video, 
  MessageSquare, 
  Phone, 
  Mail,
  Calendar,
  Star,
  Clock,
  Users,
  Play,
  Download,
  Search,
  ChevronRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { knowledgeBase, webinars } from '../lib/dummyData';

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);

  const supportCategories = [
    { id: 'all', name: 'All Topics', count: 24 },
    { id: 'basics', name: 'Getting Started', count: 8 },
    { id: 'products', name: 'Product Management', count: 6 },
    { id: 'orders', name: 'Orders & Payments', count: 5 },
    { id: 'shipping', name: 'Shipping & Logistics', count: 3 },
    { id: 'marketing', name: 'Marketing & SEO', count: 2 }
  ];

  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const faqItems = [
    {
      question: "How do I verify my company account?",
      answer: "To verify your company account, you need to complete the onboarding process by uploading your business registration documents, providing KYC information, and submitting factory tour materials. Our verification team will review your submission within 2-3 business days."
    },
    {
      question: "What are the platform fees?",
      answer: "SupplierHub charges a 10% commission on successful transactions. There are no monthly fees or listing fees. You only pay when you make a sale."
    },
    {
      question: "How do I optimize my product listings?",
      answer: "To optimize your listings: 1) Use clear, descriptive titles with relevant keywords, 2) Upload high-quality images from multiple angles, 3) Provide detailed specifications, 4) Set competitive pricing, 5) Maintain good response times to inquiries."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support various payment methods including bank transfers, GCash, Maya (PayMaya), and SWIFT wire transfers for international payments. Payouts are processed bi-weekly with a minimum threshold of $100."
    },
    {
      question: "How do I handle international shipping?",
      answer: "Use our integrated shipping calculator to estimate costs. Ensure you have proper export documentation including commercial invoices, packing lists, and certificates of origin. Our logistics partners can help with customs clearance."
    }
  ];

  return (
    <>
      <Head>
        <title>Support & Education - SupplierHub</title>
      </Head>

      <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="text-center px-3 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">Support & Education Center</h1>
          <p className="mt-2 text-sm sm:text-base text-secondary-600">
            Get help, learn best practices, and grow your business
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 md:p-6 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowContactModal(true)}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-secondary-900 mb-1">Live Chat</h3>
            <p className="text-xs sm:text-sm text-secondary-600">Get instant help</p>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-secondary-900 mb-1">Phone Support</h3>
            <p className="text-xs sm:text-sm text-secondary-600">+63-2-123-4567</p>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-secondary-900 mb-1">Email Support</h3>
            <p className="text-xs sm:text-sm text-secondary-600">support@supplierhub.com</p>
          </Card>

          <Card className="p-4 sm:p-5 md:p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-secondary-900 mb-1">Schedule Call</h3>
            <p className="text-xs sm:text-sm text-secondary-600">Book a consultation</p>
          </Card>
        </div>

        {/* Knowledge Center */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-secondary-900">Knowledge Center</h3>
            <div className="flex items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <h4 className="text-sm sm:text-base font-medium text-secondary-900 mb-2 sm:mb-3">Categories</h4>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {supportCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-50'
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="default" size="xs">{category.count}</Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Articles */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredKnowledge.map((article) => (
                  <div key={article.id} className="p-3 sm:p-4 border border-secondary-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Book className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-500 flex-shrink-0" />
                        <Badge variant="default" size="xs" className="text-xs truncate">{article.category}</Badge>
                      </div>
                      <div className="flex items-center text-xs text-secondary-500 flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    <h4 className="text-sm sm:text-base font-medium text-secondary-900 mb-2 line-clamp-2">{article.title}</h4>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-secondary-500">
                        <span className="truncate">Updated Jan 10</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-secondary-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Webinars & Live Demos */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-secondary-900">Webinars & Live Demos</h3>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              View Calendar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {webinars.map((webinar) => (
              <div key={webinar.id} className="p-3 sm:p-4 border border-secondary-200 rounded-lg">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-secondary-900 mb-2 line-clamp-2">{webinar.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-secondary-600 mb-2 sm:mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {webinar.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {webinar.time}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Badge 
                        variant={webinar.status === 'upcoming' ? 'info' : 'success'}
                        size="sm"
                      >
                        {webinar.status}
                      </Badge>
                      <Button size="sm" className="w-full sm:w-auto text-xs">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {webinar.status === 'upcoming' ? 'Register' : 'Watch'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ Section */}
        <Card>
          <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-4 sm:mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3 sm:space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="border border-secondary-200 rounded-lg">
                <details className="group">
                  <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-secondary-50">
                    <h4 className="text-sm sm:text-base font-medium text-secondary-900 pr-2">{faq.question}</h4>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm text-secondary-600">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </Card>

        {/* Premium Account Manager */}
        <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-medium text-secondary-900">Premium Account Manager</h3>
                <p className="text-xs sm:text-sm text-secondary-600 mb-2">
                  Get dedicated support from our premium account managers
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span className="truncate">Sarah Chen - Online</span>
                  </div>
                  <span className="hidden sm:inline text-secondary-500">|</span>
                  <span className="text-secondary-600 truncate">Response time: &lt; 2 hours</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <Button variant="outline" className="w-full sm:flex-1 lg:w-auto text-xs sm:text-sm">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Chat Now
              </Button>
              <Button className="w-full sm:flex-1 lg:w-auto text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Schedule Call
              </Button>
            </div>
          </div>
        </Card>

        {/* Resource Downloads */}
        <Card>
          <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-3 sm:mb-4">Resource Downloads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary-50 rounded-lg gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-secondary-900 truncate">Supplier Handbook</p>
                  <p className="text-xs text-secondary-500">PDF • 2.4 MB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs flex-shrink-0">Download</Button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary-50 rounded-lg gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-secondary-900 truncate">Export Guide</p>
                  <p className="text-xs text-secondary-500">PDF • 1.8 MB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs flex-shrink-0">Download</Button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary-50 rounded-lg gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-secondary-900 truncate">Product Templates</p>
                  <p className="text-xs text-secondary-500">ZIP • 5.2 MB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs flex-shrink-0">Download</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Support"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            Choose how you'd like to get in touch with our support team.
          </p>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-2 sm:p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-secondary-900">Live Chat</p>
                  <p className="text-xs sm:text-sm text-secondary-600">Average response: 2 minutes</p>
                </div>
              </div>
              <Badge variant="success" size="xs" className="flex-shrink-0">Online</Badge>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-secondary-900">Phone Support</p>
                  <p className="text-xs sm:text-sm text-secondary-600 truncate">+63-2-123-4567</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-secondary-500 flex-shrink-0">24/7</span>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-secondary-900">Email Support</p>
                  <p className="text-xs sm:text-sm text-secondary-600 truncate">support@supplierhub.com</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-secondary-500 flex-shrink-0">&lt; 4 hours</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowContactModal(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button className="w-full sm:w-auto">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Start Live Chat
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
