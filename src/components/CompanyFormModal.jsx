// Add / Edit Company modal with Formik and Yup validation
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Modal from "./Modal";
import { FormInput, FormSelect } from "./FormFields";
import ErrorBanner from "./ErrorBanner";
import { saveCompany, clearSaveError, fetchDropdownOptions } from "../store/crmSlice";
import { INDUSTRY_OPTIONS } from "../config";
import CircularProgress from "@mui/material/CircularProgress";
import "./CompanyFormModal.css";

// Yup validation schema for company creation and editing
const companySchema = Yup.object({
  name: Yup.string().trim().required("Company name is required"),
  industry: Yup.string()
    .oneOf(INDUSTRY_OPTIONS, "Invalid industry")
    .required("Industry is required"),
  location: Yup.string().trim().required("Location is required"),
  website: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .url("Enter a valid URL (e.g. https://company.com)"),
});

export default function CompanyFormModal({
  isOpen,
  onClose,
  company = null,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const saveError = useSelector((state) => state.crm.saveError);
  const isEditMode = Boolean(company);

  const initialValues = {
    name: company?.name || "",
    industry: company?.industry || "",
    location: company?.location || "",
    website: company?.website || "",
  };

  const handleClose = () => {
    dispatch(clearSaveError());
    onClose();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        name: values.name.trim(),
        industry: values.industry,
        location: values.location.trim(),
        website: values.website ? values.website.trim() : undefined,
      };

      const companyId = company?.id || company?._id;
      await dispatch(saveCompany({ id: companyId, data: payload })).unwrap();
      // Refresh global company dropdown list for the Lead modal
      dispatch(fetchDropdownOptions());
      handleClose();
      if (onSuccess) onSuccess();
    } catch {
      // Server error stored in Redux saveError
    } finally {
      setSubmitting(false);
    }
  };

  const industryOptions = INDUSTRY_OPTIONS.map((ind) => ({
    value: ind,
    label: ind,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Company" : "Add Company"}
    >
      {saveError && <ErrorBanner message={saveError} />}

      <Formik
        initialValues={initialValues}
        validationSchema={companySchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="company-form">
            <FormInput
              label="Company Name *"
              name="name"
              placeholder="Enter company name"
            />

            <FormSelect
              label="Industry *"
              name="industry"
              options={industryOptions}
              defaultLabel="Select industry"
            />

            <FormInput
              label="Location *"
              name="location"
              placeholder="e.g., Chennai, TN"
            />

            <FormInput
              label="Website"
              name="website"
              placeholder="e.g., https://example.com"
              helperText="Optional, valid URL if filled"
            />

            <div className="company-form-actions">
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
                  "Update Company"
                ) : (
                  "Save Company"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
