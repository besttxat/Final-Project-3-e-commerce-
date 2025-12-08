import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const carrier = searchParams.get('carrier');
        const trackingNumber = searchParams.get('tracking_number');

        if (!carrier || !trackingNumber) {
            return NextResponse.json({ message: 'Missing carrier or tracking number' }, { status: 400 });
        }

        const apiKey = process.env.CM_TRACKING_API_KEY;
        // Construct the external API URL
        // Example from specs: https://domain.com/?carrier=JT&tracking_number=123456&api_key=1234
        // The user didn't provide the exact domain, just "dm for url". 
        // I'll use the placeholder env var.

        const baseUrl = process.env.CM_TRACKING_API_URL || 'https://api.example.com';

        // Note: The specs say "Rate Limit : 1 call / 5s". 
        // In a real app, we might need a server-side queue or cache to respect this if high traffic.
        // For now, we pass through.

        const externalUrl = `${baseUrl}?carrier=${carrier}&tracking_number=${trackingNumber}&api_key=${apiKey}`;

        const res = await fetch(externalUrl);

        if (!res.ok) {
            // Handle specific codes from spec if needed
            // 300 Key Invalid, 329 Key Expired, 429 Rate Limit, etc.
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ message: 'Error from tracking provider', details: errorData }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Tracking API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
