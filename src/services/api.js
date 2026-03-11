const BASE_URL = "https://hrms-backend-lj2z.onrender.com";
// const BASE_URL = "http://localhost:8000";


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


export const markAttendanceForEmployee = async (employeeId, attendanceData) => {
  try {
    const response = await fetch(`${BASE_URL}/attendance/mark/${employeeId}`, {
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


// Reports APIs
export const getReportStatistics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports/statistics`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch statistics");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getReportDepartments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports/departments`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch department report");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getReportEmployees = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports/employees`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch employee report");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getReportTrend = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports/trend`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch trend report");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getReportToday = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports/today`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch today's report");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


// Leave APIs
export const applyLeave = async (leaveData) => {
  try {
    const response = await fetch(`${BASE_URL}/leaves/apply`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(leaveData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to apply for leave");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getMyLeaves = async () => {
  try {
    const response = await fetch(`${BASE_URL}/leaves/my-leaves`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch your leaves");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getPendingLeaves = async () => {
  try {
    const response = await fetch(`${BASE_URL}/leaves/pending`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch pending leaves");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const approveRejectLeave = async (leaveId, status) => {
  try {
    const response = await fetch(`${BASE_URL}/leaves/approve`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        leave_id: leaveId,
        status: status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to update leave");
    }

    return data;
  } catch (error) {
    throw error;
  }
};


export const getAllLeaves = async () => {
  try {
    const response = await fetch(`${BASE_URL}/leaves/all`, {
      method: "GET",
      headers: authHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch all leaves");
    }

    return data;
  } catch (error) {
    throw error;
  }
};