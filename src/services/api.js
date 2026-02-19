const BASE_URL = "https://hrms-backend-lj2z.onrender.com";


const authHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};


export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const createUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create user");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getAllUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch users");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "User not found");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to delete user");
    }

    return data;
  } catch (error) {
    throw error;
  }
};



export const markAttendance = async (attendanceData) => {
  try {
    const response = await fetch(`${BASE_URL}/attendance/`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(attendanceData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to mark attendance");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getMyAttendance = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/attendance/${userId}`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch attendance");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getWeeklyAttendance = async () => {
  try {
    const response = await fetch(`${BASE_URL}/attendance/weekly`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch weekly attendance");
    }

    return data;
  } catch (error) {
    throw error;
  }
};