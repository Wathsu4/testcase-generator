import { useState, useRef, useEffect } from "react";

// Load environment variables
const API_BASE_URL =
  import.meta.env.VITE_ENVIRONMENT === "production"
    ? "/api/generate_tests/"
    : "http://localhost:8000/generate_tests/";

function App() {
  const [prompt, setPrompt] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");

  // Ref for the bottom of the scrollable output area
  const messagesEndRef = useRef(null);

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleGenerateClick = async () => {
    // Prevent sending empty prompts
    if (!prompt.trim()) {
      setError("Please enter some code or requirements.");
      return;
    }

    setLastPrompt(prompt); // Store the prompt that was sent
    setTestCases([]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_or_requirements: prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setTestCases(data.test_cases || []);
    } catch (error) {
      console.error("Error generating test cases:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setPrompt(""); // Clear the input field after sending
    }
  };

  // Effect to scroll to the bottom when new messages appear or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [testCases, error, isLoading]); // Dependencies: reruns when these states change

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-black text-gray-100 p-4 font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-400 mb-8 animate-text-glow">
          AI Test Case Generator
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl shadow-purple-900/50 mb-8 border border-gray-700 border-b-4 border-purple-600">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">
            Enter Code or Requirements:
          </h2>
          <textarea
            className="w-full p-3 rounded-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4 h-40 font-mono"
            placeholder="Paste your code or describe your requirements here..."
            value={prompt}
            onChange={handlePromptChange}
          />
          <button
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transform"
            onClick={handleGenerateClick}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Test Cases"}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl shadow-purple-900/50 border border-gray-700 border-b-4 border-purple-600 max-h-[60vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-gray-800 flex flex-col ">
          <h2 className="text-xl font-semibold text-gray-200 sticky top-0 bg-gray-800 pb-4 z-10 -mt-0">
            Generated Test Cases:
          </h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-purple-400 text-center mt-4">
                Generating test cases, please wait...
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-center py-8 animate-pulse">
              Error: {error}
            </p>
          )}

          {!isLoading && !error && testCases.length === 0 && !lastPrompt && (
            <p className="text-gray-400 text-center py-8">
              Enter your code or requirements and click "Generate".
            </p>
          )}

          {/* Display the last prompt sent by the user */}
          {!isLoading && !error && lastPrompt && (
            <div className="mb-4 p-4 rounded-lg bg-gray-700/50 border border-gray-600 self-end text-right">
              <span className="block text-sm text-gray-400 mb-1">
                Your Prompt:
              </span>
              <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm max-h-40 overflow-y-auto">
                {lastPrompt}
              </pre>
            </div>
          )}

          {/* Display generated test cases */}
          {!isLoading && !error && testCases.length > 0 && (
            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-4 rounded-lg border border-purple-800 shadow-lg relative overflow-hidden"
                >
                  {/* Optional: Add a subtle animated border/glow effect */}
                  <div className="absolute inset-0 border border-purple-500 rounded-lg animate-border-pulse opacity-20 -z-10"></div>
                  <span className="block text-sm text-purple-400 mb-1 animate-text-glow">
                    AI Response:
                  </span>
                  <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm">
                    <code>{testCase}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
          {/* Empty div to scroll to the end of content */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;
