import API from "./client";

export const getProjects = async () => {
  const { data } = await API.get("/projects");
  return data.projects || data;
};

export const getProjectDetails = async (id) => {
  const { data } = await API.get(`/projects/${id}`);
  return data.project || data;
};

export const createProject = async (projectData) => {
  const { data } = await API.post("/projects", projectData);
  return data.project || data;
};
