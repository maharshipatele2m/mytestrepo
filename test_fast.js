const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (!match) { console.log("No Key"); return; }
        const key = match[1].trim();
        const prompt = "A red banana";

        console.log("Testing models...");

        // Test 1: Imagen 4.0 Fast
        try {
            console.log("\n--- Attempting Imagen 4.0 FAST ---");
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${key}`, {
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

    } catch (e) {
        console.error(e);
    }
}
check();
