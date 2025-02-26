import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const GeminiChat = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const API_KEY = "AIzaSyAYJaYaKLhGUfddS9_MPK4BjmReiupeVig"; // Replace with your API key

    const fetchGeminiResponse = async () => {
        if (!input) return;
        setLoading(true);

        try {
            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: input }],
                        },
                    ],
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            // Extract response text correctly
            setResponse(res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response found");
        } catch (error) {
            console.error("Error fetching response:", error?.response?.data || error.message);
            setResponse("Error fetching response. Try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Google Gemini AI Chat</h1>
            <textarea
                className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows="3"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                onClick={fetchGeminiResponse}
                disabled={loading}
            >
                {loading ? "Loading..." : "Ask Gemini"}
            </button>
            {response && (
                <div className="mt-4 p-3 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <ReactMarkdown>{response}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default GeminiChat;
