import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectDetails } from "../api/projects";
import { getTasksByProject, createTask, updateTaskStatus } from "../api/tasks";
import { ArrowLeft, Plus, UserPlus, X, Loader2, AlertTriangle, Calendar } from "lucide-react";
import useAuthStore from "../store/authStore";

const STATUS_COLS = ["To Do", "In Progress", "Done"];

const COL_STYLES = {
  "To Do": { bg: "bg-indigo-50", header: "text-indigo-700", count: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-400" },
  "In Progress": { bg: "bg-amber-50", header: "text-amber-700", count: "bg-amber-100 text-amber-600", dot: "bg-amber-400" },
  "Done": { bg: "bg-emerald-50", header: "text-emerald-700", count: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-400" },
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-700",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projData, tasksData] = await Promise.all([
        getProjectDetails(id),
        getTasksByProject(id),
      ]);
      setProject(projData);
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to load project details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate || !taskForm.assignedTo) {
      alert("Please fill in all required fields.");
      return;
    }

    setCreatingTask(true);
    try {
      const newTask = await createTask({
        ...taskForm,
        project: id
      });
      setTasks([...tasks, newTask]);
      setTaskForm({ title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });
      setShowTaskModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create task. " + (err.response?.data?.message || ""));
    } finally {
      setCreatingTask(false);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    // Optimistic update
    const originalTasks = [...tasks];
    setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error(err);
      setTasks(originalTasks); // Revert on failure
      alert("Failed to update task status.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium">Loading project tasks...</p>
    </div>
  );

  if (error || !project) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-4">
        <AlertTriangle size={32} />
        <p className="font-semibold text-lg">{error || "Project not found"}</p>
        <Link to="/projects" className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition">Back to Projects</Link>
      </div>
    </div>
  );

  const isAdmin = (project.admin?._id || project.admin) === user?._id;
  const inputCls = "px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition w-full font-[inherit]";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition mb-5">
        <ArrowLeft size={14} /> Projects
      </Link>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{project.description || "No description."}</p>
        </div>
        <div className="flex gap-2.5">
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer">
              <UserPlus size={15} /> Add Member
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition hover:-translate-y-0.5 cursor-pointer shadow-sm shadow-indigo-200">
              <Plus size={15} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Members Row */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex">
          {project.members.map((m, i) => (
            <div key={m._id} title={m.name}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white text-white text-xs font-bold flex items-center justify-center"
              style={{ marginLeft: i === 0 ? 0 : "-6px", zIndex: project.members.length - i }}>
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-400">{project.members.map((m) => m.name).join(", ")}</span>
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-4">
        {STATUS_COLS.map((status) => {
          const s = COL_STYLES[status];
          const colTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className={`${s.bg} rounded-2xl p-4`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-sm font-bold ${s.header}`}>{status}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.count}`}>{colTasks.length}</span>
              </div>

              <div className="flex flex-col gap-3 min-h-16">
                {colTasks.length === 0 && (
                  <div className="text-center text-xs text-gray-300 py-8 italic font-medium">No tasks yet</div>
                )}
                {colTasks.map((task) => (
                  <div key={task._id} className="bg-white rounded-xl p-3.5 shadow-sm border border-white/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1 leading-tight">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                          {task.assignedTo?.name?.charAt(0) ?? "?"}
                        </div>
                        <span className="text-xs text-gray-400">{task.assignedTo?.name ?? "Unassigned"}</span>
                      </div>
                      <span className="text-xs text-gray-300">
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {/* Move buttons */}
                    <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-gray-100 flex-wrap">
                      {STATUS_COLS.filter((s) => s !== status).map((s) => (
                        <button key={s} onClick={() => moveTask(task._id, s)}
                          className="text-xs px-2.5 py-1 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-500 rounded-lg transition cursor-pointer font-medium">
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Plus size={18} /> New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <input type="text" placeholder="Task title..." value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} placeholder="Optional details..." value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className={inputCls + " resize-none"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className={inputCls}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Due Date *</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required className={inputCls} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Assign To</label>
                <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })} className={inputCls}>
                  <option value="">Select member</option>
                  {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-1">
                <button type="button" onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 rounded-xl transition cursor-pointer">Cancel</button>
                <button type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMemberModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><UserPlus size={18} /> Add Member</h2>
              <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Member Email</label>
                <input type="email" placeholder="member@example.com" className={inputCls} />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 rounded-xl transition cursor-pointer">Cancel</button>
                <button onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer">Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
