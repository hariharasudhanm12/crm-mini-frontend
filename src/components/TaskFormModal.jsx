// Add / Edit Task modal with Formik and Yup validation
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import { FormInput, FormSelect } from "./FormFields";
import ErrorBanner from "./ErrorBanner";
import { saveTask, clearSaveError } from "../store/crmSlice";
import { TASK_STATUSES } from "../config";
import CircularProgress from "@mui/material/CircularProgress";
import "./TaskFormModal.css";

// Yup validation schema for task creation and editing
const taskSchema = Yup.object({
  title: Yup.string().trim().required("Task title is required"),
  lead: Yup.string().required("Lead is required"),
  dueDate: Yup.string()
    .required("Due date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
  assignedTo: Yup.string().required("Assigned user is required"),
  status: Yup.string()
    .oneOf(TASK_STATUSES, "Invalid status")
    .required("Status is required"),
});

export default function TaskFormModal({
  isOpen,
  onClose,
  task = null,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const saveError = useSelector((state) => state.crm.saveError);
  const users = useSelector((state) => state.crm.users);
  const leadOptions = useSelector((state) => state.crm.leadOptions);

  const isEditMode = Boolean(task);

  const formatInitialDate = (dateVal) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      return d.toISOString().split("T")[0];
    } catch {
      return dateVal;
    }
  };

  const initialValues = {
    title: task?.title || "",
    lead: task?.lead?.id || task?.lead?._id || task?.lead || "",
    dueDate: formatInitialDate(task?.dueDate),
    assignedTo:
      task?.assignedTo?.id ||
      task?.assignedTo?._id ||
      task?.assignedTo ||
      "",
    status: task?.status || "Pending",
  };

  const handleClose = () => {
    dispatch(clearSaveError());
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const taskId = task?.id || task?._id;

      // In edit mode: keep original lead and assignedTo to prevent accidental reassignment
      const payload = {
        title: values.title.trim(),
        lead: isEditMode
          ? (task?.lead?.id || task?.lead?._id || task?.lead)
          : values.lead,
        dueDate: values.dueDate,
        assignedTo: isEditMode
          ? (task?.assignedTo?.id || task?.assignedTo?._id || task?.assignedTo)
          : values.assignedTo,
        status: values.status,
      };

      await dispatch(saveTask({ id: taskId, data: payload })).unwrap();
      handleClose();
      if (onSuccess) onSuccess();
    } catch {
      // Server error stored in Redux saveError
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = users.map((u) => ({
    value: u.id || u._id,
    label: `${u.name} (${u.email})`,
  }));

  const leadSelectOptions = leadOptions.map((l) => ({
    value: l.id || l._id,
    label: `${l.name} (${l.email})`,
  }));

  const statusOptions = TASK_STATUSES.map((s) => ({ value: s, label: s }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Task" : "Add Task"}
    >
      {saveError && <ErrorBanner message={saveError} />}

      <Formik
        initialValues={initialValues}
        validationSchema={taskSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="task-form">
            <FormInput
              label="Task Title *"
              name="title"
              placeholder="e.g., Follow up with client"
            />

            <FormSelect
              label="Lead *"
              name="lead"
              options={leadSelectOptions}
              defaultLabel="Select associated lead"
              disabled={isEditMode}
            />

            <FormInput
              label="Due Date *"
              name="dueDate"
              type="date"
              helperText="Format: YYYY-MM-DD"
            />

            <FormSelect
              label="Assigned To *"
              name="assignedTo"
              options={userOptions}
              defaultLabel="Select assigned user"
              disabled={isEditMode}
            />

            <FormSelect
              label="Status *"
              name="status"
              options={statusOptions}
              defaultLabel="Select task status"
            />

            <div className="task-form-actions">
              <button
                type="button"
                className="btn btn-outlined"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Save Task"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
