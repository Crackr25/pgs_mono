#!/bin/bash

# Laravel Database Setup and Seeding Script for Quotes
echo "🚀 Setting up Laravel database and seeding quotes..."

# Navigate to backend directory
cd packages/backend

echo "ℹ️ Checking migration status..."
php artisan migrate:status | grep "quotes_table"

echo "🌱 Seeding database with sample data..."
php artisan db:seed --class=QuoteSeeder

echo "✅ Setup complete!"
echo ""
echo "📊 Database now contains:"
echo "- Sample companies and products"
echo "- 53+ sample quotes/RFQs with different statuses:"
echo "  • 20 pending quotes"
echo "  • 15 responded quotes"  
echo "  • 10 accepted quotes"
echo "  • 5 rejected quotes"
echo "  • 3 specific sample quotes"
echo ""
echo "🔗 You can now test the quotes page in the frontend!"
