// Test Kie.ai GPT Image 1 API
async function testKieAI() {
    const API_KEY = "944ba8a01ae72b7efbdb3f506f2e8128";

    console.log("Testing Kie.ai GPT Image 1 API...\n");

    try {
        const response = await fetch("https://api.kie.ai/api/v1/gpt4o-image/generate", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: "A red banana on a white background",
                size: "1:1",
                enableFallback: true,
                fallbackModel: "GPT_IMAGE_1"
            })
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.code === 200 && data.data?.taskId) {
            console.log("\n✅ Task created successfully!");
            console.log("Task ID:", data.data.taskId);

            // Wait a bit and check status
            console.log("\nWaiting 5 seconds before checking status...");
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Check task status
            const statusResponse = await fetch(`https://api.kie.ai/api/v1/gpt4o-image/task/${data.data.taskId}`, {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`
                }
            });

            const statusData = await statusResponse.json();
            console.log("\nTask Status:", JSON.stringify(statusData, null, 2));

            if (statusData.data?.info?.result_urls?.length > 0) {
                console.log("\n🎉 IMAGE GENERATED!");
                console.log("Image URL:", statusData.data.info.result_urls[0]);
            }
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

testKieAI();
