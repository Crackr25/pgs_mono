export const companies = [
  {
    id: 1,
    name: "Manila Manufacturing Corp",
    registration: "DTI-123456789",
    pezaId: "PEZA-2023-001",
    location: "Laguna, Philippines",
    yearEstablished: 2015,
    factorySize: "50,000 sqm",
    productLines: ["Electronics", "Automotive Parts"],
    employees: 250
  }
];

export const products = [
  {
    id: 1,
    name: "Industrial LED Light Fixture",
    specs: "50W, IP65 Rating, 5000K Color Temperature",
    images: ["/images/placeholder-product.jpg"],
    moq: 100,
    leadTime: "15-20 days",
    hsCode: "9405.40.90",
    variants: ["50W", "100W", "150W"],
    price: "$25.50",
    category: "Lighting"
  },
  {
    id: 2,
    name: "Automotive Wire Harness",
    specs: "12V DC, Copper Core, PVC Insulation",
    images: ["/images/placeholder-product.jpg"],
    moq: 500,
    leadTime: "10-15 days",
    hsCode: "8544.30.00",
    variants: ["Standard", "Heavy Duty"],
    price: "$8.75",
    category: "Automotive"
  }
];

export const quotes = [
  {
    id: 1,
    productName: "Industrial LED Light Fixture",
    buyerName: "ABC Trading Co.",
    quantity: 500,
    targetPrice: "$22.00",
    deadline: "2024-01-15",
    status: "pending",
    message: "Looking for bulk order with custom packaging"
  },
  {
    id: 2,
    productName: "Automotive Wire Harness",
    buyerName: "XYZ Motors",
    quantity: 1000,
    targetPrice: "$7.50",
    deadline: "2024-01-20",
    status: "responded",
    message: "Need samples first before bulk order"
  }
];

export const orders = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    productName: "Industrial LED Light Fixture",
    quantity: 300,
    totalAmount: "$7,650.00",
    status: "in_production",
    paymentStatus: "paid",
    estimatedDelivery: "2024-01-25",
    progress: 60
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    productName: "Automotive Wire Harness",
    quantity: 750,
    totalAmount: "$6,562.50",
    status: "shipped",
    paymentStatus: "paid",
    estimatedDelivery: "2024-01-18",
    progress: 100
  }
];

export const messages = [
  {
    id: 1,
    sender: "John Smith",
    company: "ABC Trading Co.",
    message: "Hi, I'm interested in your LED fixtures. Can you provide samples?",
    timestamp: "2024-01-10 14:30",
    unread: true
  },
  {
    id: 2,
    sender: "Maria Garcia",
    company: "XYZ Motors",
    message: "Thank you for the quote. We'd like to proceed with the order.",
    timestamp: "2024-01-10 13:15",
    unread: false
  }
];

export const analyticsData = {
  totalProducts: 45,
  totalQuotes: 128,
  totalOrders: 67,
  totalRevenue: "$145,230",
  mostViewedProducts: [
    { name: "Industrial LED Light Fixture", views: 1250 },
    { name: "Automotive Wire Harness", views: 890 },
    { name: "Solar Panel Kit", views: 675 }
  ],
  buyerEngagement: [
    { buyer: "ABC Trading Co.", inquiries: 15, orders: 8, value: "$25,400" },
    { buyer: "XYZ Motors", inquiries: 12, orders: 6, value: "$18,750" },
    { buyer: "Global Electronics", inquiries: 8, orders: 4, value: "$12,300" }
  ]
};

export const payments = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    amount: "$765.00",
    commission: "$76.50",
    status: "completed",
    date: "2024-01-15"
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    amount: "$656.25",
    commission: "$65.63",
    status: "pending",
    date: "2024-01-18"
  }
];

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' }
];

export const messageTemplates = [
  {
    id: 1,
    name: "Welcome Message",
    content: "Thank you for your inquiry. We'll get back to you within 24 hours."
  },
  {
    id: 2,
    name: "Quote Follow-up",
    content: "Hi! Just following up on our quote. Do you have any questions?"
  },
  {
    id: 3,
    name: "Sample Request",
    content: "We'd be happy to send samples. Please provide your shipping address."
  }
];

export const knowledgeBase = [
  {
    id: 1,
    title: "Getting Started Guide",
    category: "Basics",
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Product Photography Best Practices",
    category: "Marketing",
    readTime: "8 min"
  },
  {
    id: 3,
    title: "International Shipping Guidelines",
    category: "Logistics",
    readTime: "12 min"
  }
];

export const webinars = [
  {
    id: 1,
    title: "Maximizing Your Product Visibility",
    date: "2024-01-20",
    time: "2:00 PM PHT",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Export Documentation Essentials",
    date: "2024-01-25",
    time: "10:00 AM PHT",
    status: "upcoming"
  }
];
