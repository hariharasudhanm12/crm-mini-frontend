// Dashboard page displaying summary KPIs, recent leads, and upcoming tasks
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboard } from "../store/crmSlice";
import Badge from "../components/Badge";
import ErrorBanner from "../components/ErrorBanner";

// Material UI icons and loaders only
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import Skeleton from "@mui/material/Skeleton";
import "./DashboardPage.css";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.crm.user);
  const { data, status, error } = useSelector((state) => state.crm.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const isLoading = status === "loading" && !data;

  const handleRetry = () => {
    dispatch(fetchDashboard());
  };

  const getInitials = (name) => {
    if (!name) return "L";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const kpis = [
    {
      label: "Total Leads",
      value: data?.totalLeads,
      icon: <PeopleOutlineIcon />,
      colorClass: "kpi-blue",
    },
    {
      label: "Qualified Leads",
      value: data?.qualifiedLeads,
      icon: <CheckCircleOutlineIcon />,
      colorClass: "kpi-green",
    },
    {
      label: "Tasks Due Today",
      value: data?.tasksDueToday,
      icon: <TodayOutlinedIcon />,
      colorClass: "kpi-amber",
    },
    {
      label: "Completed Tasks",
      value: data?.completedTasks,
      icon: <AssignmentTurnedInOutlinedIcon />,
      colorClass: "kpi-purple",
    },
  ];

  return (
    <div className="dashboard-root">
      {/* Page Header */}
      <div className="dashboard-header">
        <span className="dashboard-badge-label">OVERVIEW</span>
        <h1 className="dashboard-heading">Good to see you, {firstName}</h1>
        <p className="dashboard-subheading">
          Here's a snapshot of your workspace today.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="dashboard-error-wrap">
          <ErrorBanner message={error} onRetry={handleRetry} />
        </div>
      )}

      {/* KPI Cards (4 in a row on laptop, 2 on tablet, 1 on phone) */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">{kpi.label}</span>
              <div className={`kpi-icon-wrap ${kpi.colorClass}`}>{kpi.icon}</div>
            </div>
            <div className="kpi-value">
              {isLoading || kpi.value === undefined ? (
                <Skeleton width={60} height={40} />
              ) : (
                kpi.value ?? 0
              )}
            </div>
            <div className="kpi-caption">Current workspace</div>
          </div>
        ))}
      </div>

      {/* Side-by-side panels: Recent Leads and Upcoming Tasks */}
      <div className="dashboard-panels-grid">
        {/* Recent Leads */}
        <div className="card dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent leads</h2>
            <Link to="/leads" className="panel-view-all">
              <span>View all</span>
              <ArrowForwardOutlinedIcon fontSize="small" />
            </Link>
          </div>

          <div className="panel-content">
            {isLoading ? (
              <div className="panel-skeleton-list">
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
              </div>
            ) : !data?.recentLeads || data.recentLeads.length === 0 ? (
              <div className="panel-empty-state">No recent leads found.</div>
            ) : (
              <ul className="panel-list">
                {data.recentLeads.map((lead) => (
                  <li key={lead.id || lead._id} className="panel-list-item">
                    <div className="item-lead-info">
                      <div className="item-avatar">{getInitials(lead.name)}</div>
                      <div className="item-text">
                        <div className="item-primary-text">{lead.name}</div>
                        <div className="item-secondary-text">{lead.email}</div>
                      </div>
                    </div>
                    <Badge status={lead.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Upcoming tasks</h2>
            <Link to="/tasks" className="panel-view-all">
              <span>View all</span>
              <ArrowForwardOutlinedIcon fontSize="small" />
            </Link>
          </div>

          <div className="panel-content">
            {isLoading ? (
              <div className="panel-skeleton-list">
                <Skeleton height={48} />
                <Skeleton height={48} />
                <Skeleton height={48} />
              </div>
            ) : !data?.upcomingTasks || data.upcomingTasks.length === 0 ? (
              <div className="panel-empty-state">No upcoming tasks found.</div>
            ) : (
              <ul className="panel-list">
                {data.upcomingTasks.map((task) => (
                  <li key={task.id || task._id} className="panel-list-item">
                    <div className="item-task-info">
                      <div className="item-primary-text">{task.title}</div>
                      <div className="item-secondary-text">
                        {task.lead?.name || "No lead"} • Due: {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <Badge status={task.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
