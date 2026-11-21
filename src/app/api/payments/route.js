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
    let quantity = 1;
    let shippingAddress = '';
    let buyerPhone = '';
    let buyerName = '';
    let notes = '';

    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (isJson) {
      const body = await request.json();
      productId = body.productId;
      quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
      shippingAddress = body.shippingAddress || '';
      buyerPhone = body.buyerPhone || '';
      buyerName = body.buyerName || '';
      notes = body.notes || '';
    } else {
      const formData = await request.formData();
      productId = formData.get('productId');
      quantity = Math.max(1, parseInt(formData.get('quantity'), 10) || 1);
      shippingAddress = formData.get('shippingAddress') || '';
      buyerPhone = formData.get('buyerPhone') || '';
      buyerName = formData.get('buyerName') || '';
      notes = formData.get('notes') || '';
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required for checkout' },
        { status: 400 }
      );
    }

    if (!userSession?.user) {
      if (isJson) {
        return NextResponse.json(
          { error: 'Authentication required to checkout', redirectUrl: `/auth/login?redirect=${encodeURIComponent(`/checkout?productId=${productId}`)}` },
          { status: 401 }
        );
      }
      return NextResponse.redirect(
        `${origin}/auth/login?redirect=${encodeURIComponent(`/checkout?productId=${productId}`)}`,
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
          if (isJson) {
            return NextResponse.json({ url: data.url });
          }
          return NextResponse.redirect(data.url, 303);
        }
      } else {
        const errorData = await backendRes.json().catch(() => ({}));
        if (errorData.code === 'ACCOUNT_BLOCKED') {
          if (isJson) {
            return NextResponse.json(
              { error: errorData.message, code: 'ACCOUNT_BLOCKED', redirectUrl: '/account/blocked' },
              { status: 403 }
            );
          }
          return NextResponse.redirect(`${origin}/account/blocked`, 303);
        }
        if (errorData.message) {
          if (isJson) {
            return NextResponse.json({ error: errorData.message }, { status: backendRes.status || 400 });
          }
          return NextResponse.redirect(
            `${origin}/checkout?productId=${productId}&error=${encodeURIComponent(errorData.message)}`,
            303
          );
        }
      }
    } catch (backendErr) {
      if (typeof backendErr?.digest === "string" && backendErr.digest.startsWith("NEXT_REDIRECT")) {
        throw backendErr;
      }
      console.warn('Backend create-checkout-session call note:', backendErr.message);
    }

    // Fallback: Authoritative DB lookup using getSingleProduct (never trusting client price)
    const product = await getSingleProduct(productId);
    if (!product || product.message) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status === 'sold') {
      const msg = 'This product has already been sold.';
      if (isJson) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      return NextResponse.redirect(
        `${origin}/checkout?productId=${productId}&error=${encodeURIComponent(msg)}`,
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
          quantity: quantity,
        },
      ],
      metadata: {
        price: String(authoritativePrice),
        buyerName: buyerName || userSession.user.name || 'Buyer',
        buyerPhone: buyerPhone || '',
        shippingAddress: shippingAddress || '',
        notes: notes || '',
        userId: userSession.user.id,
        userEmail: userSession.user.email,
        productId: String(product._id || productId),
        title: product.title || 'Product',
        sellerInfo: product.sellerInfo || 'unknown',
        sellerName: product.sellerName || 'Seller',
        quantity: String(quantity),
      },
      mode: 'payment',
      success_url: `${origin}/success/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?productId=${productId}&cancelled=true`,
    });

    if (isJson) {
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    if (typeof err?.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
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
