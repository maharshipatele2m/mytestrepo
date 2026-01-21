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
            try {
                console.log(`\n--- Attempting ${model} ---`);
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "image/jpeg"
                        }
                    })
                });
                console.log("Status:", res.status);
                const text = await res.text();
                // Check if response contains image tag or binary
                if (text.includes("image/png") || text.includes("image/jpeg")) {
                    console.log("SUCCESS! Image found in response.");
                    // console.log(text.substring(0, 500)); 
                } else {
                    console.log("Response:", text.substring(0, 300));
                }
            } catch (e) { console.error(e); }
        }

    } catch (e) {
        console.error(e);
    }
}
check();
