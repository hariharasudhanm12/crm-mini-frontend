// Full page loader and table skeleton loading components using MUI
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import "./Loader.css";

export function PageLoader() {
  return (
    <div className="page-loader-container">
      <CircularProgress sx={{ color: "var(--color-primary)" }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="table-skeleton-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="table-skeleton-cell">
              <Skeleton
                variant="rounded"
                height={24}
                sx={{ borderRadius: "4px", backgroundColor: "#f3f4f6" }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
