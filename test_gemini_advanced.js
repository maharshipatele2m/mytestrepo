const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (!match) { console.log("No Key"); return; }
        const key = match[1].trim();
        const prompt = "A red banana";

        console.log("Testing 2.5 Flash Image & Nano Banana...");

        const models = [
            "gemini-2.5-flash-image",
            "nano-banana-pro-preview"
        ];

        for (const model of models) {
            console.log(`\n=== Testing ${model} ===`);

            // Test A: generateContent WITHOUT mime type
            try {
                console.log(`[A] generateContent (Plain Text Request)`);
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                console.log("Status:", res.status);
                const text = await res.text();
                if (res.ok) console.log("Response Preview:", text.substring(0, 200));
                else console.log("Error:", text.substring(0, 200));
            } catch (e) { console.error(e); }

            // Test B: predict (Imagen Style)
            try {
                console.log(`[B] predict (Imagen Style)`);
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: prompt }],
                        parameters: { sampleCount: 1 }
                    })
                });
                console.log("Status:", res.status);
                const text = await res.text();
                if (res.ok) console.log("Response Preview:", text.substring(0, 200));
                else console.log("Error:", text.substring(0, 200));
            } catch (e) { console.error(e); }
        }

    } catch (e) {
        console.error(e);
    }
}
check();
