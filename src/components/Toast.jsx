// Toast notification container and individual toasts with 4s auto-dismiss
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../store/crmSlice";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import "./Toast.css";

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircleOutlineOutlinedIcon fontSize="small" className="toast-icon success" />;
      case "error":
        return <ErrorOutlineOutlinedIcon fontSize="small" className="toast-icon error" />;
      default:
        return <InfoOutlinedIcon fontSize="small" className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast toast-${toast.type || "info"}`}>
      <div className="toast-icon-wrap">{getIcon()}</div>
      <div className="toast-message">{toast.message}</div>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
      >
        <CloseOutlinedIcon fontSize="small" />
      </button>
    </div>
  );
}

export default function Toast() {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.crm.toasts);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={(id) => dispatch(removeToast(id))}
        />
      ))}
    </div>
  );
}
