// Test complete Kie.ai workflow
async function testComplete() {
    const API_KEY = "944ba8a01ae72b7efbdb3f506f2e8128";

    console.log("=== STEP 1: Generate Image ===\n");

    // Step 1: Generate
    const genResponse = await fetch("https://api.kie.ai/api/v1/gpt4o-image/generate", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            prompt: "A red banana on a white background, photorealistic",
            size: "1:1",
            enableFallback: true,
            fallbackModel: "GPT_IMAGE_1"
        })
    });

    const genData = await genResponse.json();
    console.log("Generation Response:", JSON.stringify(genData, null, 2));

    if (genData.code !== 200 || !genData.data?.taskId) {
        console.error("❌ Generation failed!");
        return;
    }

    const taskId = genData.data.taskId;
    console.log("\n✅ Task created:", taskId);

    // Step 2: Poll for completion
    console.log("\n=== STEP 2: Polling for completion ===\n");

    for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

        const statusResponse = await fetch(`https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`
            }
        });

        const statusData = await statusResponse.json();
        console.log(`Poll ${i + 1}:`, statusData.data?.status || statusData.msg);

        if (statusData.data?.status === "SUCCESS" && statusData.data?.response?.resultUrls?.length > 0) {
            console.log("\n🎉 IMAGE GENERATED SUCCESSFULLY!");
            console.log("Image URL:", statusData.data.response.resultUrls[0]);
            console.log("\nFull Response:", JSON.stringify(statusData, null, 2));
            return statusData.data.response.resultUrls[0];
        }

        if (statusData.data?.status === "FAILED") {
            console.error("\n❌ Generation failed:", statusData.data?.errorMessage);
            return null;
        }
    }

    console.log("\n⏱️ Timeout waiting for image");
}

testComplete().then(url => {
    if (url) {
        console.log("\n✅ FINAL IMAGE URL:", url);
    }
}).catch(err => console.error("Error:", err));
