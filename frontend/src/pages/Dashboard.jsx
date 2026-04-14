import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API = "http://localhost:3000";
const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function Dashboard() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/stats/${code}`)
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load stats"));
  }, [code]);

  if (error)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );

  if (!stats)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-400 font-mono mt-1">/{code}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back
          </button>
        </div>

        {/* Total clicks */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-1">Total clicks</p>
          <p className="text-5xl font-bold text-indigo-400">
            {stats.totalClicks}
          </p>
        </div>

        {/* By country */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-4">Clicks by country</p>
          {stats.byCountry.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.byCountry}>
                <XAxis dataKey="country" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "none" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By device */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-4">Clicks by device</p>
          {stats.byDevice.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.byDevice}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.byDevice.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111827", border: "none" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
