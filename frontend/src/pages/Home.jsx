import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://linkforge-pdez.onrender.com";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    if (!url) return setError("Please enter a URL");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/shorten`, {
        url,
        alias: alias || undefined,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-2 text-center">LinkForge</h1>
        <p className="text-gray-400 text-center mb-8">
          Shorten URLs. Track clicks. Ship faster.
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Custom alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4 py-3 font-semibold transition"
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result && (
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-gray-400 text-sm">Your short URL</p>
              <div className="flex items-center gap-2">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 font-mono text-sm flex-1 truncate"
                >
                  {result.shortUrl}
                </a>
                <button
                  onClick={handleCopy}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => navigate(`/dashboard/${result.code}`)}
                className="text-sm text-indigo-400 hover:text-indigo-300 text-left transition"
              >
                View analytics
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
