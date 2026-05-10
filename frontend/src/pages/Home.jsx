import { useState, useEffect, useRef } from "react";
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
  const [user, setUser] = useState(null);
  const [myLinks, setMyLinks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        return axios.get(`${API}/my-links`, { withCredentials: true });
      })
      .then((res) => setMyLinks(res.data.links))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  const handleLogout = () => {
    axios.get(`${API}/auth/logout`, { withCredentials: true }).then(() => {
      setUser(null);
      setMyLinks([]);
      setShowDropdown(false);
    });
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    if (!url) return setError("Please enter a URL");
    if (!user) return setError("Please log in to shorten URLs");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/shorten`,
        { url, alias: alias || undefined },
        { withCredentials: true },
      );
      setResult(res.data);
      const links = await axios.get(`${API}/my-links`, {
        withCredentials: true,
      });
      setMyLinks(links.data.links);
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">LinkForge</h1>
            <p className="text-gray-400 text-sm mt-1">
              Shorten URLs. Track clicks. Ship faster.
            </p>
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300">{user.name}</span>
                <span className="text-gray-500 text-xs">
                  {showDropdown ? "▲" : "▼"}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-10">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      My Links ({myLinks.length})
                    </p>
                    {myLinks.length === 0 ? (
                      <p className="text-gray-600 text-sm">No links yet</p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {myLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center justify-between gap-2 bg-gray-800 rounded-lg px-3 py-2"
                          >
                            <div className="flex flex-col min-w-0">
                              <p className="text-indigo-400 font-mono text-xs truncate">
                                /{link.short_code}
                              </p>
                              <p className="text-gray-500 text-xs truncate">
                                {link.original_url}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowDropdown(false);
                                navigate(`/dashboard/${link.short_code}`);
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 transition"
                            >
                              Stats
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-sm text-red-400 hover:text-red-300 text-left transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Sign in with Google
            </button>
          )}
        </div>

        {/* Shorten form */}
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
