// Check Kie.ai task status
async function checkStatus() {
    const API_KEY = "944ba8a01ae72b7efbdb3f506f2e8128";
    const taskId = "a9dd57a2cd722b3707dbe785406e4d30";

    console.log("Checking task status...\n");

    try {
        const response = await fetch(`https://api.kie.ai/api/v1/gpt4o-image/task/${taskId}`, {
            headers: {
                "Authorization": `Bearer ${API_KEY}`
            }
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.data?.info?.result_urls?.length > 0) {
            console.log("\n🎉 IMAGE GENERATED!");
            console.log("Image URL:", data.data.info.result_urls[0]);
        } else if (data.data?.status) {
            console.log("\nTask Status:", data.data.status);
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkStatus();
