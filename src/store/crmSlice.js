// Single Redux slice managing all CRM application state
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginApi,
  getDashboardApi,
  getLeadsApi,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
  getCompaniesApi,
  getCompanyLeadsApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
  getUsersApi,
  getErrorMessage,
} from "../api";

// Initial state reading token and user from localStorage if present
const initialToken = localStorage.getItem("token") || null;
let initialUser = null;
try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    initialUser = JSON.parse(storedUser);
  }
} catch {
  initialUser = null;
}

const initialState = {
  token: initialToken,
  user: initialUser,
  login: { status: "idle", error: null },
  dashboard: { data: null, status: "idle", error: null },
  leads: { items: [], total: 0, totalPages: 1, status: "idle", error: null },
  companies: {
    items: [],
    total: 0,
    totalPages: 1,
    selectedId: null,
    associatedLeads: [],
    status: "idle",
    error: null,
  },
  tasks: { items: [], total: 0, totalPages: 1, status: "idle", error: null },
  users: [],
  companyOptions: [],
  leadOptions: [],
  saveStatus: "idle",
  saveError: null,
  toasts: [],
};

// ==========================================
// ===== AUTH THUNKS ========================
// ==========================================

// Authenticates user and stores credentials
export const loginUser = createAsyncThunk(
  "crm/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response = await loginApi(credentials);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== DASHBOARD THUNKS ===================
// ==========================================

// Fetches summary KPIs, recent leads, and upcoming tasks
export const fetchDashboard = createAsyncThunk(
  "crm/fetchDashboard",
  async (_, thunkAPI) => {
    try {
      const response = await getDashboardApi();
      return response.data.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== LEADS THUNKS =======================
// ==========================================

// Fetches paginated, searchable, and filtered leads
export const fetchLeads = createAsyncThunk(
  "crm/fetchLeads",
  async (params, thunkAPI) => {
    try {
      const response = await getLeadsApi(params);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Creates or updates a lead
export const saveLead = createAsyncThunk(
  "crm/saveLead",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = id
        ? await updateLeadApi(id, data)
        : await createLeadApi(data);
      thunkAPI.dispatch(
        addToast({
          type: "success",
          message: id ? "Lead updated successfully" : "Lead created successfully",
        })
      );
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Soft deletes a lead
export const deleteLead = createAsyncThunk(
  "crm/deleteLead",
  async (id, thunkAPI) => {
    try {
      await deleteLeadApi(id);
      thunkAPI.dispatch(
        addToast({ type: "success", message: "Lead deleted successfully" })
      );
      return id;
    } catch (error) {
      const message = getErrorMessage(error);
      thunkAPI.dispatch(addToast({ type: "error", message }));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== COMPANIES THUNKS ===================
// ==========================================

// Fetches paginated companies
export const fetchCompanies = createAsyncThunk(
  "crm/fetchCompanies",
  async (params, thunkAPI) => {
    try {
      const response = await getCompaniesApi(params);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetches leads associated with a selected company
export const fetchCompanyLeads = createAsyncThunk(
  "crm/fetchCompanyLeads",
  async (companyId, thunkAPI) => {
    try {
      const response = await getCompanyLeadsApi(companyId);
      return response.data.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Creates or updates a company
export const saveCompany = createAsyncThunk(
  "crm/saveCompany",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = id
        ? await updateCompanyApi(id, data)
        : await createCompanyApi(data);
      thunkAPI.dispatch(
        addToast({
          type: "success",
          message: id
            ? "Company updated successfully"
            : "Company created successfully",
        })
      );
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Deletes a company
export const deleteCompany = createAsyncThunk(
  "crm/deleteCompany",
  async (id, thunkAPI) => {
    try {
      await deleteCompanyApi(id);
      thunkAPI.dispatch(
        addToast({ type: "success", message: "Company deleted successfully" })
      );
      return id;
    } catch (error) {
      const message = getErrorMessage(error);
      thunkAPI.dispatch(addToast({ type: "error", message }));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== TASKS THUNKS =======================
// ==========================================

// Fetches paginated tasks
export const fetchTasks = createAsyncThunk(
  "crm/fetchTasks",
  async (params, thunkAPI) => {
    try {
      const response = await getTasksApi(params);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Creates or updates a task
export const saveTask = createAsyncThunk(
  "crm/saveTask",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = id
        ? await updateTaskApi(id, data)
        : await createTaskApi(data);
      thunkAPI.dispatch(
        addToast({
          type: "success",
          message: id ? "Task updated successfully" : "Task created successfully",
        })
      );
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Marks a task as Done (with ownership verification)
export const markTaskDone = createAsyncThunk(
  "crm/markTaskDone",
  async (id, thunkAPI) => {
    try {
      const response = await updateTaskStatusApi(id, "Done");
      thunkAPI.dispatch(
        addToast({ type: "success", message: "Task marked as Done" })
      );
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      thunkAPI.dispatch(addToast({ type: "error", message }));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Deletes a task
export const deleteTask = createAsyncThunk(
  "crm/deleteTask",
  async (id, thunkAPI) => {
    try {
      await deleteTaskApi(id);
      thunkAPI.dispatch(
        addToast({ type: "success", message: "Task deleted successfully" })
      );
      return id;
    } catch (error) {
      const message = getErrorMessage(error);
      thunkAPI.dispatch(addToast({ type: "error", message }));
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== DROPDOWNS & USERS THUNKS ===========
// ==========================================

// Fetches all users for assignment dropdowns
export const fetchUsers = createAsyncThunk(
  "crm/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const response = await getUsersApi();
      return response.data.data !== undefined ? response.data.data : response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetches active companies and leads for select dropdowns
export const fetchDropdownOptions = createAsyncThunk(
  "crm/fetchDropdownOptions",
  async (_, thunkAPI) => {
    try {
      const [companiesRes, leadsRes] = await Promise.all([
        getCompaniesApi({ all: true }),
        getLeadsApi({ limit: 100 }),
      ]);
      const companies = companiesRes.data.data || companiesRes.data || [];
      const leads = leadsRes.data.data || leadsRes.data || [];
      return { companies, leads };
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ==========================================
// ===== SLICE DEFINITION ===================
// ==========================================

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    addToast(state, action) {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({
        id,
        type: action.payload.type || "info",
        message: action.payload.message,
      });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearSaveError(state) {
      state.saveError = null;
      state.saveStatus = "idle";
    },
    clearLoginError(state) {
      state.login.error = null;
    },
    selectCompany(state, action) {
      state.companies.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.login.status = "loading";
        state.login.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.login.status = "succeeded";
        const token = action.payload.token;
        const user = action.payload.user || action.payload.data;
        state.token = token;
        state.user = user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.login.status = "failed";
        state.login.error = action.payload || "Login failed";
      })

      // Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboard.status = "loading";
        state.dashboard.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard.status = "succeeded";
        state.dashboard.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboard.status = "failed";
        state.dashboard.error = action.payload || "Failed to load dashboard";
      })

      // Leads
      .addCase(fetchLeads.pending, (state) => {
        state.leads.status = "loading";
        state.leads.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.leads.status = "succeeded";
        state.leads.items = action.payload.data || [];
        state.leads.total = action.payload.total || 0;
        state.leads.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.leads.status = "failed";
        state.leads.error = action.payload || "Failed to load leads";
      })

      // Save Lead
      .addCase(saveLead.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(saveLead.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveLead.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError = action.payload || "Failed to save lead";
      })

      // Delete Lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads.items = state.leads.items.filter(
          (item) => item.id !== action.payload && item._id !== action.payload
        );
      })

      // Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.companies.status = "loading";
        state.companies.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies.status = "succeeded";
        state.companies.items = action.payload.data || [];
        state.companies.total = action.payload.total || 0;
        state.companies.totalPages = action.payload.totalPages || 1;
        if (!state.companies.selectedId && state.companies.items.length > 0) {
          state.companies.selectedId =
            state.companies.items[0].id || state.companies.items[0]._id;
        }
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companies.status = "failed";
        state.companies.error = action.payload || "Failed to load companies";
      })

      // Company Leads
      .addCase(fetchCompanyLeads.pending, (state) => {
        state.companies.associatedLeads = [];
        state.companies.leadsLoading = true;
      })
      .addCase(fetchCompanyLeads.fulfilled, (state, action) => {
        state.companies.associatedLeads = action.payload || [];
        state.companies.leadsLoading = false;
      })
      .addCase(fetchCompanyLeads.rejected, (state) => {
        state.companies.associatedLeads = [];
        state.companies.leadsLoading = false;
      })

      // Save Company
      .addCase(saveCompany.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(saveCompany.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveCompany.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError = action.payload || "Failed to save company";
      })

      // Delete Company
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies.items = state.companies.items.filter(
          (c) => c.id !== action.payload && c._id !== action.payload
        );
      })

      // Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.tasks.status = "loading";
        state.tasks.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks.status = "succeeded";
        state.tasks.items = action.payload.data || [];
        state.tasks.total = action.payload.total || 0;
        state.tasks.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.tasks.status = "failed";
        state.tasks.error = action.payload || "Failed to load tasks";
      })

      // Save Task
      .addCase(saveTask.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(saveTask.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveTask.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError = action.payload || "Failed to save task";
      })

      // Mark Task Done
      .addCase(markTaskDone.fulfilled, (state, action) => {
        const updatedTask = action.payload.data || action.payload;
        const index = state.tasks.items.findIndex(
          (t) => (t.id || t._id) === (updatedTask.id || updatedTask._id)
        );
        if (index !== -1) {
          state.tasks.items[index] = updatedTask;
        }
      })

      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks.items = state.tasks.items.filter(
          (t) => t.id !== action.payload && t._id !== action.payload
        );
      })

      // Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload || [];
      })

      // Dropdown Options
      .addCase(fetchDropdownOptions.fulfilled, (state, action) => {
        state.companyOptions = action.payload.companies || [];
        state.leadOptions = action.payload.leads || [];
      });
  },
});

export const {
  logout,
  addToast,
  removeToast,
  clearSaveError,
  clearLoginError,
  selectCompany,
} = crmSlice.actions;

export default crmSlice.reducer;
