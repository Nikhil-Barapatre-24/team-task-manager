import API from "./client";

export const getDashboardStats = async () => {
  const { data } = await API.get("/tasks/dashboard");
  return data.stats || data;
};

export const getTasksByProject = async (projectId) => {
  const { data } = await API.get(`/tasks/project/${projectId}`);
  return data.tasks || data;
};

export const createTask = async (taskData) => {
  const { data } = await API.post("/tasks", taskData);
  return data.task || data;
};

export const updateTaskStatus = async (id, status) => {
  const { data } = await API.put(`/tasks/${id}/status`, { status });
  return data.task || data;
};

export const updateTask = async (id, taskData) => {
  const { data } = await API.put(`/tasks/${id}`, taskData);
  return data.task || data;
};
