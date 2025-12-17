# Stripe Webhook Setup Guide

## Why Webhooks Are Needed

When a buyer completes payment on Stripe Checkout, they might:
- Close the browser before returning to your site
- Have network issues
- Not click the "Return to merchant" button

Without webhooks, the payment status would stay "pending" even though Stripe successfully charged the card.

**Webhooks solve this** by letting Stripe notify your server immediately when payment succeeds, regardless of what the buyer does.

---

## Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint is:
```
https://yourdomain.com/api/stripe/webhook
```

For local testing with Stripe CLI:
```
http://localhost:8000/api/stripe/webhook
```

### 2. Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click **"Add endpoint"**

### 3. Get Webhook Signing Secret

After creating the webhook:
1. Click on the webhook you just created
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)

### 4. Add to .env File

Add the webhook secret to your backend `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Test Locally with Stripe CLI (Optional)

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to http://localhost:8000/api/stripe/webhook

# This will give you a webhook secret like: whsec_...
# Add it to your .env as STRIPE_WEBHOOK_SECRET
```

### 6. Test the Webhook

1. Create a payment link as an agent
2. Pay as a buyer using Stripe test card: `4242 4242 4242 4242`
3. Check your Laravel logs: `storage/logs/laravel.log`
4. You should see:
   ```
   Checkout session completed
   Payment status updated
   Payment confirmation message sent
   ```

---

## How It Works

### Flow Diagram

```
Buyer clicks "Proceed to Payment"
    ↓
Redirected to Stripe Checkout
    ↓
Buyer enters card details
    ↓
Payment succeeds on Stripe
    ↓
Stripe sends webhook to your server ← INSTANT
    ↓
Your server updates payment status to "paid"
    ↓
Confirmation message sent in chat
    ↓
Buyer sees "Payment Received" message
```

### What the Webhook Does

1. **Receives event from Stripe** (`checkout.session.completed`)
2. **Verifies signature** (ensures it's really from Stripe)
3. **Extracts payment_link_id** from session metadata
4. **Updates payment status** to "paid"
5. **Sends confirmation message** in chat
6. **Broadcasts via WebSocket** so both parties see it instantly

---

## Webhook Events Handled

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Checkout session finished | Update status to "paid" |
| `payment_intent.succeeded` | Payment successfully processed | Update status to "paid" |
| `payment_intent.payment_failed` | Payment failed | Log error (optional: update status) |

---

## Security

✅ **Webhook signature verification** - Only accepts requests from Stripe
✅ **Idempotent updates** - Won't process the same payment twice
✅ **Logging** - All webhook events logged for debugging
✅ **No authentication required** - Webhook route is public (Stripe can't authenticate)

---

## Troubleshooting

### Payment status not updating?

1. **Check webhook is created in Stripe Dashboard**
   - Go to Stripe Dashboard → Webhooks
   - Verify endpoint URL is correct
   - Check "Events" tab for recent deliveries

2. **Check webhook secret in .env**
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

3. **Check Laravel logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test webhook manually**
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Select `checkout.session.completed`

### Webhook signature verification fails?

- Make sure `STRIPE_WEBHOOK_SECRET` in `.env` matches the secret in Stripe Dashboard
- Run `php artisan config:clear`
- Check the secret starts with `whsec_`

### Payment works but no confirmation message?

- Check WebSocket is running: `php artisan websockets:serve`
- Check Laravel logs for errors
- Verify `MessageSent` event is broadcasting

---

## Production Checklist

- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret added to `.env`
- [ ] Config cache cleared: `php artisan config:clear`
- [ ] HTTPS enabled on production domain
- [ ] Webhook URL uses production domain (not localhost)
- [ ] Test payment completed successfully
- [ ] Confirmation message appears in chat
- [ ] Payment status updates to "paid"

---

## Webhook URL Examples

**Local Development (with Stripe CLI):**
```
http://localhost:8000/api/stripe/webhook
```

**Production:**
```
https://yourdomain.com/api/stripe/webhook
```

**Testing (ngrok):**
```
https://abc123.ngrok.io/api/stripe/webhook
```

---

## Need Help?

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks Locally](https://stripe.com/docs/webhooks/test)
