// 404 Not Found page component
import React from "react";
import { Link } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-root">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page not found</h2>
        <p className="notfound-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary notfound-btn">
          <ArrowBackOutlinedIcon fontSize="small" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
