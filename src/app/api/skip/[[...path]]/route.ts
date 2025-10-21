import { NextRequest, NextResponse } from 'next/server';

const SKIP_API_KEY = process.env.SKIP_API_KEY;
const SKIP_API_BASE_URL = 'https://api.skip.build';

interface RouteContext {
  params: {
    path?: string[];
  };
}

async function proxyToSkipApi(request: NextRequest, context: RouteContext, method: string) {
  if (!SKIP_API_KEY) {
    console.error('SKIP_API_KEY is not configured');
    return NextResponse.json({ error: 'Skip API key not configured on server' }, { status: 500 });
  }

  try {
    const pathSegments = context.params.path || [];
    const skipPath = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const skipUrl = `${SKIP_API_BASE_URL}${skipPath}${queryString ? `?${queryString}` : ''}`;

    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.text();
    }

    const skipResponse = await fetch(skipUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: SKIP_API_KEY,
        Accept: 'application/json',
      },
      body: body || undefined,
    });

    const responseData = await skipResponse.text();

    return new NextResponse(responseData, {
      status: skipResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Skip Proxy Error]:', error);
    return NextResponse.json(
      {
        error: 'Failed to proxy request to Skip API',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToSkipApi(request, context, 'GET');
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToSkipApi(request, context, 'POST');
}
