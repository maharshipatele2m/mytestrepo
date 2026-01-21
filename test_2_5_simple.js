const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (!match) { console.log("No Key"); return; }
        const key = match[1].trim();
        const prompt = "Generate an image of a red banana";

        console.log("Testing gemini-2.5-flash-image with plain generateContent...\n");

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        console.log("Status:", res.status);
        const data = await res.json();

        if (res.ok) {
            console.log("\n✅ SUCCESS!");

            // Check for image in response
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts;

            if (parts) {
                console.log("Parts found:", parts.length);
                parts.forEach((p, i) => {
                    if (p.inlineData) {
                        console.log(`  Part ${i}: Image (${p.inlineData.mimeType}), size: ${p.inlineData.data.length} bytes`);
                    } else if (p.text) {
                        console.log(`  Part ${i}: Text - ${p.text.substring(0, 100)}`);
                    }
                });
            }
        } else {
            console.log("\n❌ Error:");
            console.log(JSON.stringify(data, null, 2).substring(0, 500));
        }

    } catch (e) {
        console.error("Exception:", e.message);
    }
}

// Wait 3 seconds before running to avoid quota
setTimeout(check, 3000);
console.log("Waiting 3 seconds to avoid quota...");
