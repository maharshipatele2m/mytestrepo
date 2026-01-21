const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (!match) { console.log("No Key"); return; }
        const key = match[1].trim();
        const prompt = "A futuristic cyberpunk city";

        console.log("Testing gemini-2.0-flash-exp-image-generation...");

        // Test 1: predict endpoint (Imagen style)
        try {
            console.log("\n--- Attempting :predict ---");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:predict?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: prompt }],
                    parameters: { aspectRatio: "1:1", sampleCount: 1 }
                })
            });
            console.log("Status:", res.status);
            console.log("Response:", (await res.text()).substring(0, 300));
        } catch (e) { console.error(e); }

        // Test 2: generateContent endpoint (Gemini style)
        try {
            console.log("\n--- Attempting :generateContent ---");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${key}`, {
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
            console.log("Response:", (await res.text()).substring(0, 300));
        } catch (e) { console.error(e); }

    } catch (e) {
        console.error(e);
    }
}
check();
