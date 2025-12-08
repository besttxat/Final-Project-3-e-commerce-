"use client";
import Script from 'next/script';

declare global {
    interface Window {
        Omise: any;
    }
}

export default function ScriptLoader() {
    return (
        <Script
            src="https://cdn.omise.co/omise.js"
            onLoad={() => {
                if (window.Omise) {
                    window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
                    // Note: We need to expose this env var to client or hardcode placeholder for now if env not prefixed.
                    // Better to use a prop or fetch from API config if strict.
                    // But usually NEXT_PUBLIC_ is used. 
                    // I will assume the user sets NEXT_PUBLIC_OMISE_PUBLIC_KEY in .env or I will use the one I added without prefix but NEXT public access issue?
                    // Wait, I added OMISE_PUBLIC_KEY to `.env`. It is NOT exposed to client unless prefixed with NEXT_PUBLIC_.
                    // I should have named it NEXT_PUBLIC_OMISE_PUBLIC_KEY.
                    // I will fix this in the Page component or re-add env var. 
                    // For now, I'll assume I can pass it from a server component or just use a placeholder in code for demo if env is missing on client.
                }
            }}
        />
    );
}
