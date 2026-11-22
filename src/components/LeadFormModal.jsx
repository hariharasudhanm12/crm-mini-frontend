// Add / Edit Lead modal with Formik and Yup validation
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import { FormInput, FormSelect } from "./FormFields";
import ErrorBanner from "./ErrorBanner";
import { saveLead, clearSaveError } from "../store/crmSlice";
import { LEAD_STATUSES } from "../config";
import CircularProgress from "@mui/material/CircularProgress";
import "./LeadFormModal.css";

// Yup validation schema for lead creation and editing
const leadSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test(
      "phone-valid",
      "Phone must be 7 to 15 characters (digits, spaces, + or -)",
      (value) => {
        if (!value) return true;
        const phoneRegex = /^[0-9+\s-]{7,15}$/;
        return phoneRegex.test(value);
      }
    ),
  status: Yup.string()
    .oneOf(LEAD_STATUSES, "Invalid status")
    .required("Status is required"),
  assignedTo: Yup.string().nullable(),
  company: Yup.string().nullable(),
});

export default function LeadFormModal({ isOpen, onClose, lead = null, onSuccess }) {
  const dispatch = useDispatch();
  const saveError = useSelector((state) => state.crm.saveError);
  const users = useSelector((state) => state.crm.users);
  const companyOptions = useSelector((state) => state.crm.companyOptions);

  const isEditMode = Boolean(lead);

  const initialValues = {
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    status: lead?.status || "New",
    assignedTo: lead?.assignedTo?.id || lead?.assignedTo?._id || lead?.assignedTo || "",
    company: lead?.company?.id || lead?.company?._id || lead?.company || "",
  };

  const handleClose = () => {
    dispatch(clearSaveError());
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone ? values.phone.trim() : undefined,
        status: values.status,
        assignedTo: values.assignedTo || undefined,
        company: values.company || undefined,
      };

      const leadId = lead?.id || lead?._id;
      await dispatch(saveLead({ id: leadId, data: payload })).unwrap();
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

  const companySelectOptions = companyOptions.map((c) => ({
    value: c.id || c._id,
    label: c.name,
  }));

  const statusOptions = LEAD_STATUSES.map((s) => ({ value: s, label: s }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Lead" : "Add Lead"}
    >
      {saveError && <ErrorBanner message={saveError} />}

      <Formik
        initialValues={initialValues}
        validationSchema={leadSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="lead-form">
            <FormInput
              label="Lead Name *"
              name="name"
              placeholder="e.g. John Doe"
            />

            <FormInput
              label="Email Address *"
              name="email"
              type="email"
              placeholder="e.g. john@example.com"
            />

            <FormInput
              label="Phone Number"
              name="phone"
              placeholder="e.g. +1 555-0199"
              helperText="Optional, 7 to 15 digits, spaces, + or -"
            />

            <FormSelect
              label="Status *"
              name="status"
              options={statusOptions}
              defaultLabel="Select status"
            />

            <FormSelect
              label="Assigned To"
              name="assignedTo"
              options={userOptions}
              defaultLabel="Unassigned"
            />

            <FormSelect
              label="Company"
              name="company"
              options={companySelectOptions}
              defaultLabel="No Company"
            />

            <div className="lead-form-actions">
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
                ) : isEditMode ? (
                  "Update Lead"
                ) : (
                  "Create Lead"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
