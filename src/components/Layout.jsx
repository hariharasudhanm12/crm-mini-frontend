// Main application layout featuring responsive sidebar, topbar, and page outlet
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/crmSlice";
import { APP_NAME } from "../config";
import Toast from "./Toast";

// Material UI icons only
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import "./Layout.css";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.crm.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/leads")) return "Leads";
    if (path.includes("/companies")) return "Companies";
    if (path.includes("/tasks")) return "Tasks";
    return "Dashboard";
  };

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout-root">
      <Toast />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Dark Navy Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-icon">M</div>
          <span className="brand-name">{APP_NAME}</span>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close sidebar"
          >
            <CloseOutlinedIcon fontSize="small" />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            <DashboardOutlinedIcon className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            <PeopleOutlinedIcon className="nav-icon" />
            <span className="nav-text">Leads</span>
          </NavLink>

          <NavLink
            to="/companies"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            <BusinessOutlinedIcon className="nav-icon" />
            <span className="nav-text">Companies</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMobileMenu}
          >
            <ChecklistOutlinedIcon className="nav-icon" />
            <span className="nav-text">Tasks</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="layout-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <MenuOutlinedIcon />
            </button>
            <div className="breadcrumbs">
              <span className="breadcrumb-root">Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <span className="user-name">{user?.name || "User"}</span>
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutOutlinedIcon fontSize="small" />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
