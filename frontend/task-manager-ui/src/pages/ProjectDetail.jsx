import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProjectDetails, addMemberToProject, removeMemberFromProject } from "../api/projects";
import { getTasksByProject, createTask, updateTaskStatus, updateTask } from "../api/tasks";
import { ArrowLeft, Plus, UserPlus, Loader2, AlertTriangle, Calendar, Circle, MoreVertical, Edit2, User, Clock, CheckCircle2, ChevronRight, Users, X, ChevronDown } from "lucide-react";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLS = ["To Do", "In Progress", "Review", "Done"];

const WORKFLOW = {
  "To Do": ["In Progress"],
  "In Progress": ["Review"],
  "Review": ["Done"],
  "Done": []
};

const COL_STYLES = {
  "To Do": { bg: "bg-slate-50 border-slate-200/50", header: "text-slate-700", dot: "bg-slate-400" },
  "In Progress": { bg: "bg-amber-50/80 border-amber-200/40", header: "text-amber-700", dot: "bg-amber-400" },
  "Review": { bg: "bg-indigo-50/80 border-indigo-200/40", header: "text-indigo-700", dot: "bg-indigo-400" },
  "Done": { bg: "bg-emerald-50 border-emerald-200/50", header: "text-emerald-700", dot: "bg-emerald-400" },
};

const PRIORITY_STYLES = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);

  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "", dueDate: "", assignedTo: [], status: "To Do" });
  const [submittingTask, setSubmittingTask] = useState(false);

  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAssigneeDropdown && !event.target.closest('.assignee-dropdown-container')) {
        setShowAssigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssigneeDropdown]);

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
      toast.error("Failed to load project data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", priority: "", dueDate: "", assignedTo: [], status: "To Do" });
    setAssigneeSearch("");
    setShowAssigneeDropdown(false);
    setShowTaskModal(true);
  };

  const handleOpenEditModal = (e, task) => {
    e.stopPropagation(); // Don't collapse the card
    setEditingTask(task);
    
    // Defensive date parsing
    let formattedDate = "";
    try {
      if (task.dueDate) {
        formattedDate = new Date(task.dueDate).toISOString().split("T")[0];
      }
    } catch (err) {
      console.error("Date parsing error:", err);
    }

    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: formattedDate,
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []),
      status: task.status
    });
    setAssigneeSearch("");
    setShowAssigneeDropdown(false);
    setShowTaskModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.description || !taskForm.priority || !taskForm.dueDate || !taskForm.assignedTo || taskForm.assignedTo.length === 0) {
      toast.error("All fields are required.");
      return;
    }

    setSubmittingTask(true);
    try {
      if (editingTask) {
        const updatedTask = await updateTask(editingTask._id, taskForm);
        setTasks(tasks.map(t => t._id === editingTask._id ? updatedTask : t));
        toast.success("Task updated.");
      } else {
        const newTask = await createTask({ ...taskForm, project: id });
        setTasks([...tasks, newTask]);
        toast.success("Task added.");
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;
    setAddingMember(true);
    try {
      await addMemberToProject(id, memberEmail);
      toast.success("Member added successfully.");
      setMemberEmail("");
      fetchProjectData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setRemovingMemberId(memberId);
    try {
      await removeMemberFromProject(id, memberId);
      toast.success("Member removed successfully.");
      fetchProjectData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member.");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const moveTask = async (e, taskId, newStatus) => {
    e.stopPropagation(); // Don't collapse the card
    const originalTasks = [...tasks];
    setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setTasks(originalTasks);
      toast.error("Movement failed.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <p className="text-gray-400 text-sm font-medium">Refining workspace...</p>
    </div>
  );

  if (!project) return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-center">
      <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
      <h2 className="text-xl font-bold text-gray-900">Project sync lost</h2>
      <Button render={<Link to="/projects" />} variant="link" className="mt-2 text-indigo-600">
        Return to Projects
      </Button>
    </div>
  );

  const isAdmin = (project.admin?._id || project.admin) === user?._id;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex-1">
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 mb-3 transition">
            <ArrowLeft size={12} /> BACK TO PROJECTS
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{project.name}</h1>
          <p className="text-gray-600 text-sm mt-1.5 max-w-xl leading-relaxed">{project.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 font-bold px-4 hover:border-indigo-200 transition-colors"
            onClick={() => setShowMemberModal(true)}>
            <Users size={14} className="mr-2" /> {project.members?.length || 0} Members
          </Button>
          {isAdmin && (
            <Button size="sm" className="h-9 font-bold px-4 bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              onClick={handleOpenCreateModal}>
              <Plus size={14} className="mr-2" /> Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Board Layout */}
      <div className="relative -mx-6 px-6 overflow-x-auto pb-8 elegant-scrollbar">
        <div className="flex gap-6 min-w-max">
          {STATUS_COLS.map((status) => {
            const s = COL_STYLES[status];
            const colTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="w-[280px] shrink-0 flex flex-col h-[calc(100vh-280px)]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-600">{status}</span>
                    <span className="ml-1 text-[10px] font-bold text-gray-400">{colTasks.length}</span>
                  </div>
                </div>

                {/* Task List */}
                <div className={cn("flex-1 min-h-0 p-2 rounded-2xl border transition-colors overflow-y-auto elegant-scrollbar flex flex-col gap-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]", s.bg)}>
                  {colTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20 min-h-[200px]">
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400/80">NO TASKS YET</div>
                    </div>
                  )}
                  {colTasks.map((task) => {
                    const isExpanded = expandedTaskIds.has(task._id);
                    const toggleExpand = () => setExpandedTaskIds(prev => {
                      const next = new Set(prev);
                      isExpanded ? next.delete(task._id) : next.add(task._id);
                      return next;
                    });
                    return (
                      <div key={task._id} className="px-0.5 py-0.5"> {/* Padding for scale effect */}
                        <Card onClick={toggleExpand}
                          className={cn(
                            "group border-none transition-all cursor-pointer ring-1 ring-black/[0.03] overflow-hidden relative shadow-[0_1px_3px_rgba(0,0,0,0.05)] w-full",
                            isExpanded ? "shadow-[0_8px_24px_rgba(0,0,0,0.12)] scale-[1.02] z-10" : "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98]"
                          )}>
                          {/* Priority left line overlay */}
                          <div className={cn("absolute left-0 top-0 bottom-0 w-1", PRIORITY_STYLES[task.priority])} />

                          <CardContent className="p-3 pl-4">
                            <div className="flex flex-col gap-1.5">
                              {/* Title — always truncated, tooltip shows full text */}
                              <h4
                                title={task.title}
                                className="text-[13px] font-bold text-gray-800 leading-tight transition-colors truncate group-hover:text-indigo-600"
                              >
                                {task.title}
                              </h4>

                              {/* Description — always 2-line clamp, tooltip shows full text */}
                              <p
                                title={task.description}
                                className="text-[11px] text-gray-400 leading-relaxed italic line-clamp-2"
                              >
                                {task.description || "No description provided."}
                              </p>

                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                                  {/* Metadata row */}
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                      <User size={11} className="text-indigo-400 shrink-0" />
                                      <span className="text-[10px] font-bold text-gray-600 truncate">
                                        {Array.isArray(task.assignedTo) 
                                          ? task.assignedTo.length > 0 
                                            ? task.assignedTo.map(a => a.name || a).join(", ")
                                            : "Unassigned"
                                          : (task.assignedTo?.name || task.assignedTo || "Unassigned")
                                        }
                                      </span>
                                    </div>
                                    <span className="text-gray-200">·</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <Calendar size={11} className="text-indigo-400 shrink-0" />
                                      <span className="text-[10px] font-bold text-gray-600">
                                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-1">
                                    <div className="flex-1 flex flex-col gap-2">
                                      {WORKFLOW[task.status].map((ns) => (
                                        <Button key={ns} onClick={(e) => moveTask(e, task._id, ns)}
                                          className="w-full h-9 font-black uppercase tracking-wider text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100">
                                          Move to {ns} <ChevronRight size={12} className="ml-1.5" />
                                        </Button>
                                      ))}
                                      {task.status === "Done" && (
                                        <div className="h-9 flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                          <CheckCircle2 size={14} />
                                          <span className="text-[10px] font-black uppercase tracking-wider">Completed</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {isAdmin && (
                                      <Button variant="outline" onClick={(e) => handleOpenEditModal(e, task)}
                                        className="h-9 w-9 p-0 rounded-xl border-gray-200 shrink-0 hover:bg-gray-50 transition-colors">
                                        <Edit2 size={13} className="text-gray-500" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Creation/Editing Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingTask ? <Edit2 size={20} className="text-indigo-600" /> : <Plus size={20} className="text-indigo-600" />}
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTask} className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">Title *</Label>
              <Input id="taskTitle" maxLength={60} placeholder="What needs to be done?" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDesc">Description *</Label>
              <textarea id="taskDesc" rows={4} maxLength={500} placeholder="Provide tactical details..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority *</Label>
                <Select value={taskForm.priority} onValueChange={(val) => setTaskForm({ ...taskForm, priority: val })} required>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Assignees *</Label>
              <div className="relative assignee-dropdown-container">
                <div 
                  className="border border-input rounded-md p-2 min-h-[42px] cursor-pointer bg-white flex justify-between items-center"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                >
                  <div className="flex flex-wrap gap-1">
                    {taskForm.assignedTo.length > 0 ? (
                      taskForm.assignedTo.map(assigneeId => {
                        const member = project.members.find(m => m._id === assigneeId);
                        return member ? (
                          <span key={assigneeId} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs">
                            {member.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskForm({ ...taskForm, assignedTo: taskForm.assignedTo.filter(id => id !== assigneeId) });
                              }}
                              className="hover:text-indigo-900"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">Select assignees...</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
                
                {showAssigneeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-input">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-sm border border-input rounded"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {project.members
                        .filter(member => 
                          member.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                          member.email.toLowerCase().includes(assigneeSearch.toLowerCase())
                        )
                        .map((member) => (
                          <div
                            key={member._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (taskForm.assignedTo.includes(member._id)) {
                                setTaskForm({ ...taskForm, assignedTo: taskForm.assignedTo.filter(id => id !== member._id) });
                              } else {
                                setTaskForm({ ...taskForm, assignedTo: [...taskForm.assignedTo, member._id] });
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={taskForm.assignedTo.includes(member._id)}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              {taskForm.assignedTo.length === 0 && (
                <p className="text-xs text-gray-500">Select at least one assignee</p>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)} disabled={submittingTask}>Cancel</Button>
              <Button type="submit" disabled={submittingTask} className="bg-indigo-600 hover:bg-indigo-700">
                {submittingTask ? <Loader2 className="animate-spin" /> : (editingTask ? "Save" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Members Management Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={20} className="text-indigo-600" /> Project Members
              <Badge variant="secondary" className="ml-2">
                {project.members?.length || 0}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1">
            {/* Add Member Form */}
            {isAdmin && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Add member by email..." 
                    value={memberEmail}
                    disabled={addingMember} 
                    onChange={(e) => setMemberEmail(e.target.value)} 
                    className="flex-1"
                  />
                  <Button type="submit" disabled={addingMember} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    {addingMember ? <Loader2 className="animate-spin h-4 w-4" /> : <UserPlus size={16} />}
                  </Button>
                </form>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {project.members?.map((member) => {
                const isCurrentUser = member._id === user?._id;
                const isMemberAdmin = member._id === (project.admin?._id || project.admin);
                const canRemove = isAdmin && !isCurrentUser && !isMemberAdmin;
                
                return (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                        {(member.name || "User").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {member.name}
                          {isMemberAdmin && (
                            <Badge variant="default" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                              Admin
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={removingMemberId === member._id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {removingMemberId === member._id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <X size={16} />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setShowMemberModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
