import API from "./client";

export const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await API.post("/auth/signup", userData);
  return data;
};
export const updateProfile = async (profileData) => {
  const { data } = await API.put("/auth/profile", profileData);
  return data;
};

export const updatePassword = async (passwordData) => {
  const { data } = await API.put("/auth/password", passwordData);
  return data;
};
