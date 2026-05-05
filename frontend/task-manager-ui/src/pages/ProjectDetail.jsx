import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectDetails, addMemberToProject } from "../api/projects";
import { getTasksByProject, createTask, updateTaskStatus } from "../api/tasks";
import { ArrowLeft, Plus, UserPlus, Loader2, AlertTriangle, Calendar, Circle } from "lucide-react";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_COLS = ["To Do", "In Progress", "Done"];

const COL_STYLES = {
  "To Do": { bg: "bg-indigo-50/50", header: "text-indigo-700", dot: "bg-indigo-400" },
  "In Progress": { bg: "bg-amber-50/50", header: "text-amber-700", dot: "bg-amber-400" },
  "Done": { bg: "bg-emerald-50/50", header: "text-emerald-700", dot: "bg-emerald-400" },
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-600 border-red-100",
  Medium: "bg-amber-50 text-amber-600 border-amber-100",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "Medium", dueDate: "", assignedTo: "" });
  const [creatingTask, setCreatingTask] = useState(false);
  
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

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
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      toast.error("Failed to load project details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate || !taskForm.assignedTo) {
      toast.error("Please fill in all required fields.");
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
      toast.success("Task created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create task.");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;

    setAddingMember(true);
    try {
      await addMemberToProject(id, memberEmail);
      toast.success("Member added successfully!");
      setMemberEmail("");
      setShowMemberModal(false);
      fetchProjectData(); // Refresh to show new member
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
      toast.error("Failed to update task status.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-gray-500 font-medium">Loading project tasks...</p>
    </div>
  );

  if (!project) return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <AlertTriangle className="text-red-600" size={32} />
          <p className="font-semibold text-lg text-red-600">Project not found</p>
          <Button asChild variant="destructive">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const isAdmin = (project.admin?._id || project.admin) === user?._id;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition mb-5 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Projects
      </Link>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">{project.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2.5">
          {isAdmin && (
            <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11">
                  <UserPlus size={16} className="mr-2" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus size={20} className="text-indigo-600" /> Invite Member
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Member Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={memberEmail}
                      disabled={addingMember}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={() => setShowMemberModal(false)} disabled={addingMember}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addingMember}>
                      {addingMember ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {isAdmin && (
            <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
              <DialogTrigger asChild>
                <Button className="h-11 shadow-indigo-100 shadow-md">
                  <Plus size={16} className="mr-2" /> New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus size={20} className="text-indigo-600" /> Create New Task
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="grid gap-5 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taskTitle">Title *</Label>
                    <Input id="taskTitle" placeholder="What needs to be done?" value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="taskDesc">Description</Label>
                    <textarea id="taskDesc" rows={3} placeholder="Add some details..." value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Priority</Label>
                      <Select value={taskForm.priority} onValueChange={(val) => setTaskForm({ ...taskForm, priority: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input id="dueDate" type="date" value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Assign To *</Label>
                    <Select value={taskForm.assignedTo} onValueChange={(val) => setTaskForm({ ...taskForm, assignedTo: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.members.map((m) => (
                          <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)} disabled={creatingTask}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creatingTask}>
                      {creatingTask ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Task"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Members Row */}
      <div className="flex items-center gap-3 mb-8 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-fit">
        <div className="flex">
          {project.members.map((m, i) => (
            <div key={m._id} title={m.name}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center shrink-0"
              style={{ marginLeft: i === 0 ? 0 : "-8px", zIndex: project.members.length - i }}>
              {m.name.charAt(0)}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Activity</span>
          <span className="text-xs text-gray-600 font-medium">{project.members.map((m) => m.name).join(", ")}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-6">
        {STATUS_COLS.map((status) => {
          const s = COL_STYLES[status];
          const colTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className={`${s.bg} rounded-3xl p-5 border border-white/50 backdrop-blur-sm`}>
              <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-2.5">
                  <Circle className={`w-2.5 h-2.5 fill-current ${s.dot} text-transparent`} />
                  <span className={`font-bold tracking-tight ${s.header}`}>{status}</span>
                </div>
                <Badge variant="secondary" className="font-bold">{colTasks.length}</Badge>
              </div>

              <div className="flex flex-col gap-4 min-h-32">
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-300 opacity-60">
                    <p className="text-xs font-semibold italic">Empty Column</p>
                  </div>
                )}
                {colTasks.map((task) => (
                  <Card key={task._id} className="shadow-sm hover:shadow-md transition-all border-white/80 group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-tight ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed italic">
                          &ldquo;{task.description}&rdquo;
                        </p>
                      )}
                      <div className="flex justify-between items-center bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center border border-indigo-200">
                            {task.assignedTo?.name?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{task.assignedTo?.name?.split(" ")[0] ?? "Unassigned"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar size={10} />
                          <span className="text-[10px] font-bold">
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Move buttons */}
                      <div className="flex gap-1.5 mt-4 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        {STATUS_COLS.filter((s) => s !== status).map((s) => (
                          <Button key={s} size="sm" variant="ghost" onClick={() => moveTask(task._id, s)}
                            className="h-7 text-[10px] px-2.5 font-bold hover:bg-indigo-600 hover:text-white rounded-lg">
                            Move to {s}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
