import API from "./client";

export const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await API.post("/auth/signup", userData);
  return data;
};
