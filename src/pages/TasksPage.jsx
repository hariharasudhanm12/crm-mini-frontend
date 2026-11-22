// Tasks page with ownership authorization checks, status updates, and 403 handling
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  markTaskDone,
  deleteTask,
  fetchUsers,
  fetchDropdownOptions,
} from "../store/crmSlice";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";
import TaskFormModal from "../components/TaskFormModal";
import { TableSkeleton } from "../components/Loader";

// Material UI icons only
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import "./TasksPage.css";

export default function TasksPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.crm.user);
  const { items, totalPages, status, error } = useSelector(
    (state) => state.crm.tasks
  );

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState(null);

  useEffect(() => {
    dispatch(fetchTasks({ page, limit: 10 }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDropdownOptions());
  }, [dispatch]);

  const loadCurrentTasks = () => {
    dispatch(fetchTasks({ page, limit: 10 }));
  };

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const id = taskToDelete.id || taskToDelete._id;
      await dispatch(deleteTask(id)).unwrap();
      setTaskToDelete(null);
      loadCurrentTasks();
    } catch {
      // Toast error handled in slice thunk
    } finally {
      setIsDeleting(false);
    }
  };

  // Mark task as done with ownership check
  const handleMarkDone = async (task) => {
    const taskId = task.id || task._id;
    setMarkingDoneId(taskId);
    try {
      await dispatch(markTaskDone(taskId)).unwrap();
    } catch {
      // If server returns 403 or error, toast is displayed by thunk and we refetch
      loadCurrentTasks();
    } finally {
      setMarkingDoneId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isInitialLoading = status === "loading" && items.length === 0;
  const isRefetching = status === "loading" && items.length > 0;

  return (
    <div className="tasks-page-root">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Track follow-ups, meetings, and lead actions</p>
        </div>
        <button
          type="button"
          className="btn btn-outlined add-task-btn"
          onClick={handleOpenAdd}
        >
          <AddOutlinedIcon fontSize="small" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Info Banner about task permissions */}
      <div className="tasks-info-banner">
        <InfoOutlinedIcon fontSize="small" className="tasks-info-icon" />
        <span>Note: Only assigned users can update task status.</span>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadCurrentTasks} />}

      {isRefetching && (
        <LinearProgress
          sx={{
            height: "3px",
            borderRadius: "2px",
            backgroundColor: "#e0e7ff",
            "& .MuiLinearProgress-bar": { backgroundColor: "var(--color-primary)" },
          }}
        />
      )}

      {/* Tasks Table / Stacked Cards */}
      {isInitialLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : items.length === 0 ? (
        <div className="card empty-table-card">No tasks found.</div>
      ) : (
        <div className="table-container">
          <table className="table tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Lead</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((task) => {
                const taskId = task.id || task._id;
                const leadName = task.lead?.name || "No lead";
                const assignedId =
                  task.assignedTo?.id ||
                  task.assignedTo?._id ||
                  task.assignedTo;
                const currentUserId = currentUser?.id || currentUser?._id;
                const isAssigned = String(assignedId) === String(currentUserId);
                const isDone = task.status === "Done";
                const canMarkDone = isAssigned && !isDone;
                const isMarking = markingDoneId === taskId;

                return (
                  <tr key={taskId} className="task-row">
                    <td data-label="Title" className="task-title-cell">
                      <strong>{task.title}</strong>
                    </td>
                    <td data-label="Lead">{leadName}</td>
                    <td data-label="Due Date">{formatDate(task.dueDate)}</td>
                    <td data-label="Status">
                      <Badge status={task.status} />
                    </td>
                    <td data-label="Actions" className="task-actions-cell">
                      <div className="action-buttons-wrap">
                        {/* Done button with ownership check */}
                        <button
                          type="button"
                          className="btn btn-outlined done-btn"
                          disabled={!canMarkDone || isMarking}
                          onClick={() => handleMarkDone(task)}
                          title={
                            isDone
                              ? "Task is already done"
                              : !isAssigned
                              ? "Only the assigned user can update this task"
                              : "Mark task as Done"
                          }
                          aria-label={`Mark ${task.title} as Done`}
                        >
                          {isMarking ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <>
                              <CheckCircleOutlineOutlinedIcon fontSize="small" />
                              <span>Done</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => handleOpenEdit(task)}
                          title="Edit task"
                          aria-label={`Edit ${task.title}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDeleteClick(task)}
                          title="Delete task"
                          aria-label={`Delete ${task.title}`}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={taskToEdit}
        onSuccess={loadCurrentTasks}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </div>
  );
}
