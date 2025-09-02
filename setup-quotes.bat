@echo off
REM Laravel Database Setup and Seeding Script for Quotes
echo 🚀 Setting up Laravel database and seeding quotes...

REM Navigate to backend directory
cd packages\backend

echo ℹ️ Checking migration status...
php artisan migrate:status | findstr "quotes_table"

echo 🌱 Seeding database with comprehensive B2B sample data...
php artisan db:seed --class=ComprehensiveQuoteRFQSeeder

echo ✅ Setup complete!
echo.
echo 📊 Database now contains realistic B2B data:
echo - Detailed RFQs with technical specifications
echo - Multi-paragraph buyer requirements
echo - Professional supplier responses
echo - Various quote statuses and scenarios
echo - Real-world business terms and conditions
echo - Industry-specific requirements
echo - Quality certifications and compliance needs
echo.
echo 🎯 Your quotes page now shows enterprise-level RFQs!
