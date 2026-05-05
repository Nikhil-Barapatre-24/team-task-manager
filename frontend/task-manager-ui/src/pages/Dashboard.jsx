import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertTriangle, ListTodo, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/tasks";
import { getProjects } from "../api/projects";
import useAuthStore from "../store/authStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_PILL = {
  "To Do": "bg-indigo-50 text-indigo-600",
  "In Progress": "bg-orange-50 text-orange-600",
  "Done": "bg-emerald-50 text-emerald-700",
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, projectsData] = await Promise.all([
          getDashboardStats(),
          getProjects(),
        ]);
        setStats(statsData);
        setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 3) : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <AlertTriangle className="text-red-600" size={32} />
            <p className="font-semibold text-lg text-red-600">{error}</p>
            <Button variant="destructive" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: "Total Tasks", value: stats?.totalTasks || 0, icon: ListTodo, bg: "bg-indigo-500", card: "bg-indigo-50 border-indigo-100" },
    { label: "In Progress", value: stats?.tasksByStatus?.["In Progress"] || 0, icon: Clock, bg: "bg-orange-500", card: "bg-orange-50 border-orange-100" },
    { label: "Completed", value: stats?.tasksByStatus?.["Done"] || 0, icon: CheckCircle, bg: "bg-emerald-500", card: "bg-emerald-50 border-emerald-100" },
    { label: "Overdue", value: stats?.overdueTasks || 0, icon: AlertTriangle, bg: "bg-red-500", card: "bg-red-50 border-red-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-semibold text-gray-700">{user?.name?.split(" ")[0]}</span>! Here&apos;s your overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, bg, card }) => (
          <Card key={label} className={`${card} border shadow-none`}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-gray-900 leading-none">{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {stats && Object.entries(stats.tasksByStatus || {}).map(([label, count]) => {
              const pct = stats.totalTasks ? Math.round((count / stats.totalTasks) * 100) : 0;
              const colors = { "To Do": "bg-indigo-500", "In Progress": "bg-orange-400", "Done": "bg-emerald-500" };
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className={`${colors[label]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5">
            <CardTitle className="text-lg">Projects Overview</CardTitle>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
              See all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {projects.length > 0 ? (
              projects.map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.members?.length || 0} members</div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm italic">No projects found.</p>
                <Link to="/projects" className="text-indigo-600 text-xs font-semibold mt-2 inline-block">Create your first project</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
