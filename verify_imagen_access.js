const fs = require('fs');

async function check() {
    try {
        // 1. Get Key
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (!match) { console.log("No Key"); return; }
        const key = match[1].trim();

        console.log("Testing with Key ending in ...", key.slice(-4));

        // 2. Make Request
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${key}`;
        const body = {
            instances: [{ prompt: "A small red ball" }],
            parameters: { aspectRatio: "1:1", sampleCount: 1 }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response Preview:", text.substring(0, 200));

    } catch (e) {
        console.error(e);
    }
}
check();
