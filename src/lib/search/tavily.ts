export async function searchWeb(query: string) {
    const apiKey = process.env.TAVILY_API_KEY;
    console.log('Tavily Search Triggered. Query:', query, 'API Key Present:', !!apiKey);

    if (!apiKey) {
        throw new Error('TAVILY_API_KEY is not set in environment variables');
    }

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'basic',
            include_answer: true,
            max_results: 5,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavily API error:', response.status, errorText);
        throw new Error(`Tavily search failed (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tavily raw data:', JSON.stringify(data).slice(0, 500));

    if (!data.results || !Array.isArray(data.results)) {
        return { message: "No search results found for this query.", results: [] };
    }

    return data.results.map((r: any) => ({
        title: r.title || 'No Title',
        url: r.url || '#',
        content: r.content || r.snippet || 'No content available.',
        snippet: r.snippet || r.content?.slice(0, 100) || 'No snippet available.',
    }));
}
