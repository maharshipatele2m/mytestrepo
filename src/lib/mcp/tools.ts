import { ChatCompletionTool } from "groq-sdk/resources/chat/completions";

export const MCP_TOOLS: ChatCompletionTool[] = [
    // Google Calendar
    {
        type: "function",
        function: {
            name: "google_calendar_list_events",
            description: "List upcoming events from Google Calendar",
            parameters: {
                type: "object",
                properties: {
                    timeMin: { type: "string", description: "ISO string for the minimum time to search from" },
                    maxResults: { type: "number", description: "Maximum number of events to return" },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "google_calendar_create_event",
            description: "Create a new event in Google Calendar",
            parameters: {
                type: "object",
                required: ["summary", "start", "end"],
                properties: {
                    summary: { type: "string", description: "Event title" },
                    description: { type: "string", description: "Event description" },
                    start: { type: "string", description: "Start time (ISO string)" },
                    end: { type: "string", description: "End time (ISO string)" },
                },
            },
        },
    },
    // Google Gmail
    {
        type: "function",
        function: {
            name: "google_gmail_list_messages",
            description: "List recent emails from Gmail",
            parameters: {
                type: "object",
                properties: {
                    maxResults: { type: "number", description: "Maximum number of messages to return" },
                    q: { type: "string", description: "Query string for searching emails" },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "google_gmail_get_message",
            description: "Get the content of a specific email by ID",
            parameters: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string", description: "The ID of the Gmail message" },
                },
            },
        },
    },
    // Google Drive
    {
        type: "function",
        function: {
            name: "google_drive_list_files",
            description: "List files from Google Drive",
            parameters: {
                type: "object",
                properties: {
                    pageSize: { type: "number", description: "Maximum number of files to return" },
                    q: { type: "string", description: "Query string for searching files" },
                },
            },
        },
    },
    // Google Docs
    {
        type: "function",
        function: {
            name: "google_docs_get_content",
            description: "Get the text content of a Google Doc",
            parameters: {
                type: "object",
                required: ["documentId"],
                properties: {
                    documentId: { type: "string", description: "The ID of the Google Doc" },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "google_docs_create",
            description: "Create a new Google Doc with specified title and content",
            parameters: {
                type: "object",
                required: ["title", "content"],
                properties: {
                    title: { type: "string", description: "Title of the new document" },
                    content: { type: "string", description: "Initial text content of the document" },
                },
            },
        },
    },
    // Web Search
    {
        type: "function",
        function: {
            name: "web_search",
            description: "Search the web for real-time information, latest news, current stock prices, weather, or any data beyond the model's training cutoff. Use this whenever the user asks for 'today's' or 'current' information.",
            parameters: {
                type: "object",
                required: ["query"],
                properties: {
                    query: { type: "string", description: "The search query (e.g., 'Nvidia stock price today')" },
                },
            },
        },
    },
    // RAG Search
    {
        type: "function",
        function: {
            name: "document_search",
            description: "Search inside the user's uploaded documents",
            parameters: {
                type: "object",
                required: ["query"],
                properties: {
                    query: { type: "string", description: "The query to search in documents" },
                },
            },
        },
    },
    // Image Generation
    {
        type: "function",
        function: {
            name: "image_generate",
            description: "Generate an image using Kie.ai GPT Image 1 (powered by OpenAI). Use this whenever the user asks to create, draw, or generate an image/picture.",
            parameters: {
                type: "object",
                properties: {
                    prompt: {
                        type: "string",
                        description: "A detailed description of the image to generate"
                    },
                    aspectRatio: {
                        type: "string",
                        enum: ["1:1", "16:9", "4:3", "3:4"],
                        description: "The aspect ratio of the generated image (default: 1:1)"
                    }
                },
                required: ["prompt"]
            }
        }
    }
];
