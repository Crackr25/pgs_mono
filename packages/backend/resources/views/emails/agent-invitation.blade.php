<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Invitation - {{ $companyAgent->company->company_name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .invitation-details {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .company-info {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .company-logo {
            width: 50px;
            height: 50px;
            background-color: #667eea;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            margin-right: 15px;
        }
        
        .company-details h3 {
            color: #2c3e50;
            font-size: 20px;
            margin-bottom: 5px;
        }
        
        .company-details p {
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .role-info {
            margin-top: 15px;
        }
        
        .role-badge {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .alternative-link {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            font-size: 12px;
            color: #6c757d;
        }
        
        .alternative-link p {
            margin-bottom: 8px;
        }
        
        .token-display {
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #495057;
            word-break: break-all;
        }
        
        .benefits {
            margin: 30px 0;
        }
        
        .benefits h4 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .benefits ul {
            list-style: none;
            padding: 0;
        }
        
        .benefits li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            color: #555;
        }
        
        .benefits li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer .support-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }
        
        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .company-info {
                flex-direction: column;
                text-align: center;
            }
            
            .company-logo {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join our team as a company agent</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                Hello <strong>{{ $companyAgent->user->name }}</strong>,
            </div>
            
            <p>You've been invited to join <strong>{{ $companyAgent->company->company_name }}</strong> as a company agent on the Pinoy Global Supply platform. This is an exciting opportunity to represent and manage business operations for one of our valued suppliers.</p>
            
            <!-- Company Information -->
            <div class="invitation-details">
                <div class="company-info">
                    <div class="company-logo">
                        {{ strtoupper(substr($companyAgent->company->company_name, 0, 2)) }}
                    </div>
                    <div class="company-details">
                        <h3>{{ $companyAgent->company->company_name }}</h3>
                        <p>{{ $companyAgent->company->business_type ?? 'Supplier' }} • {{ $companyAgent->company->country ?? 'Philippines' }}</p>
                    </div>
                </div>
                
                <div class="role-info">
                    <span class="role-badge">{{ ucfirst($companyAgent->role) }} Agent</span>
                    @if($companyAgent->permissions)
                        @foreach(json_decode($companyAgent->permissions, true) as $permission)
                            <span class="role-badge">{{ ucfirst(str_replace('_', ' ', $permission)) }}</span>
                        @endforeach
                    @endif
                </div>
            </div>
            
            <!-- Benefits -->
            <div class="benefits">
                <h4>As a company agent, you'll be able to:</h4>
                <ul>
                    <li>Manage product listings and inventory</li>
                    <li>Respond to buyer inquiries and RFQs</li>
                    <li>Process orders and track shipments</li>
                    <li>Access company analytics and reports</li>
                    <li>Communicate with buyers through our platform</li>
                    <li>Represent {{ $companyAgent->company->company_name }} professionally</li>
                </ul>
            </div>
            
            <!-- Call to Action -->
            <div class="cta-section">
                <a href="{{ $invitationUrl }}" class="cta-button">
                    Accept Invitation & Get Started
                </a>
                
                <div class="alternative-link">
                    <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                    <div class="token-display">{{ $invitationUrl }}</div>
                </div>
            </div>
            
            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it as soon as possible to secure your access.
            </div>
            
            <p>Once you accept this invitation, you'll be able to set up your password and start managing operations for {{ $companyAgent->company->company_name }}.</p>
            
            <p>If you have any questions about this invitation or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Pinoy Global Supply</strong></p>
            <p>Connecting Filipino businesses with global opportunities</p>
            
            <div class="support-info">
                <p>Need help? Contact us:</p>
                <p>📧 support@pinoyglobalsupply.com | 📞 +63 (2) 8123-4567</p>
                <p>🌐 <a href="{{ config('app.url') }}" style="color: #667eea;">www.pinoyglobalsupply.com</a></p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #adb5bd;">
                This email was sent to {{ $companyAgent->user->email }}. If you received this email by mistake, please ignore it.
            </p>
        </div>
    </div>
</body>
</html>
