import React from 'react';
import ProductMessageHeader from '../chat/ProductMessageHeader';

const ChatMessageTest = () => {
  // Test data for different scenarios
  const testMessages = [
    {
      id: 1,
      product_context: {
        id: 1,
        name: "Premium Steel Pipes",
        image: "/storage/products/steel-pipes.jpg",
        has_image: true,
        price: "25.50",
        unit: "meter",
        company_name: "Steel Works Ltd"
      },
      message_type: "message"
    },
    {
      id: 2,
      product_context: {
        id: 2,
        name: "Industrial Valves Set",
        image: null,
        has_image: false,
        price: "150.00",
        unit: "set",
        company_name: "Valve Masters Inc"
      },
      message_type: "quote"
    },
    {
      id: 3,
      product_context: {
        id: 3,
        name: "High-Quality Bearings",
        image: "https://example.com/bearings.jpg",
        has_image: true,
        price: "45.99",
        unit: "piece",
        company_name: "Bearing Solutions"
      },
      message_type: "message"
    }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Chat Message Product Header Test</h1>
      
      <div className="space-y-6">
        {testMessages.map((message) => (
          <div key={message.id} className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-3">
              Test Case {message.id}: {message.product_context.has_image ? 'With Image' : 'No Image'} 
              ({message.message_type})
            </h3>
            
            <ProductMessageHeader 
              productContext={message.product_context}
              messageType={message.message_type}
            />
            
            <div className="mt-4 p-3 bg-blue-600 text-white rounded-lg max-w-md">
              <p className="text-sm">
                Sample message content about {message.product_context.name}
              </p>
              <div className="text-xs mt-1 opacity-75">
                10:30 AM
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Check if product images load correctly when available</li>
          <li>2. Verify placeholder displays when no image is available</li>
          <li>3. Confirm different message types show correct icons</li>
          <li>4. Test responsive layout on different screen sizes</li>
          <li>5. Verify product details (name, price, company) display properly</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatMessageTest;
