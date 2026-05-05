import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject } from "../api/projects";
import { Plus, Users, ArrowRight, Folder, X, Loader2, AlertTriangle } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Projects() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch projects.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    
    setCreating(true);
    try {
      const newProject = await createProject(form);
      setProjects([newProject, ...projects]);
      setForm({ name: "", description: "" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-gray-500 font-medium">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer shadow-sm shadow-indigo-200">
          <Plus size={16} /> New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const isAdmin = (p.admin._id || p.admin) === user?._id;
          return (
            <Link to={`/projects/${p._id}`} key={p._id}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                  {p.name.charAt(0)}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isAdmin ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                  {isAdmin ? "Admin" : "Member"}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{p.description || "No description provided."}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="flex -space-x-2 mr-1">
                    {p.members?.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 text-[10px] flex items-center justify-center font-bold text-indigo-600">
                        {(m.name || "U").charAt(0)}
                      </div>
                    ))}
                    {(p.members?.length || 0) > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500">
                        +{(p.members?.length || 0) - 3}
                      </div>
                    )}
                  </span>
                  <Users size={13} /> {p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? "s" : ""}
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
            </Link>
          );
        })}

        {/* Create New Card */}
        <button onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-48 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer">
          <Plus size={28} />
          <span className="text-sm font-medium">Create Project</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-[slideUp_0.2s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Folder size={18} /> New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Project Name *</label>
                <input type="text" placeholder="E.g. Website Redesign" value={form.name} disabled={creating}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition disabled:opacity-50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} placeholder="Brief description..." value={form.description} disabled={creating}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition resize-none disabled:opacity-50" />
              </div>
              <div className="flex gap-3 justify-end mt-1">
                <button type="button" onClick={() => setShowModal(false)} disabled={creating}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition cursor-pointer disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={creating}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition cursor-pointer disabled:opacity-70 flex items-center gap-2">
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
