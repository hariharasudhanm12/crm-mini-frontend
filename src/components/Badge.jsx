// Status badge component with pre-defined colors for leads and tasks
import React from "react";
import "./Badge.css";

export default function Badge({ status }) {
  if (!status) return null;
  const statusKey = status.toLowerCase().replace(/\s+/g, "-");

  return <span className={`badge badge-${statusKey}`}>{status}</span>;
}
