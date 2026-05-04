import { mockDashboardStats, mockProjects, mockTasks, mockUser } from "../mocks";
import { CheckCircle, Clock, AlertTriangle, ListTodo, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_PILL = {
  "To Do": "bg-indigo-50 text-indigo-600",
  "In Progress": "bg-orange-50 text-orange-600",
  "Done": "bg-emerald-50 text-emerald-700",
};

const PRIORITY_DOT = { High: "bg-red-500", Medium: "bg-amber-400", Low: "bg-emerald-500" };

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentTasks = mockTasks.slice(0, 3);

  const statCards = [
    { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, bg: "bg-indigo-500", card: "bg-indigo-50" },
    { label: "In Progress", value: stats.tasksByStatus["In Progress"], icon: Clock, bg: "bg-orange-500", card: "bg-orange-50" },
    { label: "Completed", value: stats.tasksByStatus["Done"], icon: CheckCircle, bg: "bg-emerald-500", card: "bg-emerald-50" },
    { label: "Overdue", value: stats.overdueTasks, icon: AlertTriangle, bg: "bg-red-500", card: "bg-red-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-semibold text-gray-700">{mockUser.name.split(" ")[0]}</span>! Here&apos;s your overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, bg, card }) => (
          <div key={label} className={`${card} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900 leading-none">{value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Task Distribution</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(stats.tasksByStatus).map(([label, count]) => {
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
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-gray-900">Recent Tasks</h2>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentTasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                  <span className="text-sm font-medium text-gray-800 truncate max-w-36">{t.title}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_PILL[t.status]}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Projects */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-gray-900">My Projects</h2>
          <Link to="/projects" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {mockProjects.map((p) => (
            <Link key={p._id} to={`/projects/${p._id}`}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-colors group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400">{p.members.length} members</div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
