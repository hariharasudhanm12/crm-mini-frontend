// Confirmation dialog for deletions and critical actions
import React from "react";
import Modal from "./Modal";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-dialog-content">
        <div className="confirm-icon-wrapper">
          <WarningAmberOutlinedIcon className="confirm-warning-icon" />
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-outlined"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={18} color="inherit" /> : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
