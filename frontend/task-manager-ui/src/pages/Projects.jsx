import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProjects, createProject } from "../api/projects";
import { Plus, Users, ArrowRight, Folder, X, Loader2, AlertTriangle } from "lucide-react";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Projects() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch projects.");
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
      const response = await createProject(form);
      const newProject = response.project || response;
      // Ensure the project has properly populated members with user data
      const projectWithUserData = {
        ...newProject,
        members: newProject.members?.map(member => 
          typeof member === 'object' ? member : { _id: member, name: user?.name || 'User', email: user?.email }
        ) || [{ _id: user?._id, name: user?.name || 'User', email: user?.email }]
      };
      setProjects([projectWithUserData, ...projects]);
      setForm({ name: "", description: "" });
      setShowModal(false);
      toast.success("Project created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project. Please try again.");
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} active project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="h-11 shadow-indigo-100 shadow-md cursor-pointer"
        >
          <Plus size={16} className="mr-2" /> New Project
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const isAdmin = (p.admin?._id || p.admin) === user?._id;
          return (
            <Link to={`/projects/${p._id}`} key={p._id} className="group">
              <Card className="hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all border-gray-100 h-full">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                      {p.name.charAt(0)}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isAdmin ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{p.description || "No description provided."}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
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
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Create New Card Trigger */}
        <Card 
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-indigo-400 group transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
        >
          <CardContent className="flex flex-col items-center gap-3 p-6 text-gray-400 group-hover:text-indigo-500 transition-colors">
            <Plus size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold tracking-tight">Create New Project</span>
          </CardContent>
        </Card>
      </div>

      {/* Single Dialog for both triggers */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder size={20} className="text-indigo-600" /> New Project
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="E.g. Website Redesign"
                value={form.name}
                disabled={creating}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief description..."
                value={form.description}
                disabled={creating}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
