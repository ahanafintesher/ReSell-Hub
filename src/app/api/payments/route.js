import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { serverFetch } from '@/lib/api-client';
import { getSingleProduct } from '@/lib/actions/getSingleProduct';
import { stripe } from '@/lib/stripe';

export async function POST(request) {
  try {
    const headersList = await headers();
    const origin =
      headersList.get('origin') ||
      headersList.get('referer')?.replace(/\/[^/]*$/, '') ||
      'http://localhost:3000';

    const userSession = await auth.api.getSession({
      headers: headersList,
    });

    let productId;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      productId = body.productId;
    } else {
      const formData = await request.formData();
      productId = formData.get('productId');
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required for checkout' },
        { status: 400 }
      );
    }

    if (!userSession?.user) {
      return NextResponse.redirect(
        `${origin}/auth/login?redirect=${encodeURIComponent(`/products/${productId}`)}`,
        303
      );
    }

    // Try backend's authoritative /api/create-checkout-session endpoint first
    try {
      const backendRes = await serverFetch('/api/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.url) {
          return NextResponse.redirect(data.url, 303);
        }
      } else {
        const errorData = await backendRes.json().catch(() => ({}));
        if (errorData.message) {
          return NextResponse.redirect(
            `${origin}/products/${productId}?error=${encodeURIComponent(errorData.message)}`,
            303
          );
        }
      }
    } catch (backendErr) {
      console.warn('Backend create-checkout-session call note:', backendErr.message);
    }

    // Fallback: Authoritative DB lookup using getSingleProduct (never trusting client price)
    const product = await getSingleProduct(productId);
    if (!product || product.message) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status === 'sold') {
      return NextResponse.redirect(
        `${origin}/products/${productId}?error=${encodeURIComponent('This product has already been sold.')}`,
        303
      );
    }

    const authoritativePrice = Number(product.price);
    if (isNaN(authoritativePrice) || authoritativePrice <= 0) {
      return NextResponse.json(
        { error: 'Product does not have a valid price' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: userSession.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(authoritativePrice * 100),
            product_data: {
              name: product.title || 'Marketplace Product',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        price: String(authoritativePrice),
        buyerName: userSession.user.name || 'Buyer',
        userId: userSession.user.id,
        userEmail: userSession.user.email,
        productId: String(product._id || productId),
        title: product.title || 'Product',
        sellerInfo: product.sellerInfo || 'unknown',
        sellerName: product.sellerName || 'Seller',
      },
      mode: 'payment',
      success_url: `${origin}/success/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${productId}`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'ReSell Hub Payments API' });
}