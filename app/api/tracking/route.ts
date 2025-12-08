import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // We force ThaiPost, but let's keep the variable for clarity
        const trackingNumber = searchParams.get('tracking_number');

        if (!trackingNumber) {
            return NextResponse.json({ message: 'Missing tracking number' }, { status: 400 });
        }

        const apiKey = process.env.CM_TRACKING_API_KEY;
        // Thailand Post API requires the Token from the dashboard
        if (!apiKey) {
            return NextResponse.json({ message: 'Server Config Error: Missing Thailand Post API Token' }, { status: 500 });
        }

        // 1. Authenticate to get Access Token
        // The key in .env is likely the "Dashboard Token", which is used to get an "Access Token".
        const authUrl = 'https://trackapi.thailandpost.co.th/post/api/v1/authenticate/token';

        console.log("Debug: Authenticating with Dashboard Token...");
        const authRes = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!authRes.ok) {
            console.error("Debug: Auth Failed", authRes.status);
            const authErr = await authRes.text();
            console.error("Debug: Auth Error Body", authErr);
            return NextResponse.json({ message: 'Failed to authenticate with Thailand Post', details: authErr }, { status: authRes.status });
        }

        const authData = await authRes.json();
        const accessToken = authData.token;
        console.log("Debug: Got Access Token (Length: " + (accessToken ? accessToken.length : 0) + ")");

        // 2. Track using Access Token
        const trackUrl = process.env.CM_TRACKING_API_URL || 'https://trackapi.thailandpost.co.th/post/api/v1/track';

        const payload = {
            status: "all",
            language: "TH",
            barcode: [trackingNumber]
        };

        const res = await fetch(trackUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Debug: Track Failed Status:", res.status);
            console.error("Debug: Track Error Body:", errorText);

            let errorJson = {};
            try { errorJson = JSON.parse(errorText); } catch (e) { errorJson = { raw: errorText }; }

            return NextResponse.json({ message: 'Error from Thailand Post Tracking', details: errorJson }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Tracking API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
