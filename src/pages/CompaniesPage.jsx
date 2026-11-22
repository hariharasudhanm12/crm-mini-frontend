// Companies directory page with master-detail selection, associated leads, and CRUD operations
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCompanies,
  fetchCompanyLeads,
  deleteCompany,
  selectCompany,
} from "../store/crmSlice";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";
import CompanyFormModal from "../components/CompanyFormModal";
import { TableSkeleton } from "../components/Loader";

// Material UI icons only
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import "./CompaniesPage.css";

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const {
    items,
    totalPages,
    selectedId,
    associatedLeads,
    leadsLoading,
    status,
    error,
  } = useSelector((state) => state.crm.companies);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimerRef = useRef(null);

  // Debounce search input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // Fetch companies when page or search changes
  useEffect(() => {
    dispatch(
      fetchCompanies({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
      })
    );
  }, [dispatch, page, debouncedSearch]);

  // Fetch associated leads whenever selectedId changes
  useEffect(() => {
    if (selectedId) {
      dispatch(fetchCompanyLeads(selectedId));
    }
  }, [dispatch, selectedId]);

  const loadCurrentCompanies = () => {
    dispatch(
      fetchCompanies({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
      })
    );
  };

  const handleRowClick = (company) => {
    const id = company.id || company._id;
    dispatch(selectCompany(id));
  };

  const handleOpenAdd = () => {
    setCompanyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, company) => {
    e.stopPropagation();
    setCompanyToEdit(company);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, company) => {
    e.stopPropagation();
    setCompanyToDelete(company);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    try {
      const id = companyToDelete.id || companyToDelete._id;
      await dispatch(deleteCompany(id)).unwrap();
      setCompanyToDelete(null);
      loadCurrentCompanies();
    } catch {
      // Toast error handled in slice thunk
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedCompany = items.find(
    (c) => (c.id || c._id) === selectedId
  ) || items[0] || null;

  const isInitialLoading = status === "loading" && items.length === 0;
  const isRefetching = status === "loading" && items.length > 0;

  const getInitials = (name) => {
    if (!name) return "L";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="companies-page-root">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">Directory of client companies and associated leads</p>
        </div>
        <button
          type="button"
          className="btn btn-primary add-company-btn"
          onClick={handleOpenAdd}
        >
          <AddOutlinedIcon fontSize="small" />
          <span>Add Company</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadCurrentCompanies} />}

      {/* Main Master-Detail Grid */}
      <div className="companies-layout-grid">
        {/* Left Side: Directory Table */}
        <div className="companies-left-pane">
          <div className="card companies-toolbar">
            <div className="search-box-wrapper">
              <SearchOutlinedIcon className="search-icon" fontSize="small" />
              <input
                type="text"
                className="input search-input"
                placeholder="Search companies by name..."
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {isRefetching && (
            <LinearProgress
              sx={{
                height: "3px",
                borderRadius: "2px",
                backgroundColor: "#e0e7ff",
                "& .MuiLinearProgress-bar": { backgroundColor: "var(--color-primary)" },
              }}
            />
          )}

          {isInitialLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : items.length === 0 ? (
            <div className="card empty-table-card">No companies found.</div>
          ) : (
            <div className="table-container">
              <table className="table companies-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((company) => {
                    const id = company.id || company._id;
                    const isSelected = (selectedCompany?.id || selectedCompany?._id) === id;

                    return (
                      <tr
                        key={id}
                        className={`company-row ${isSelected ? "selected-row" : ""}`}
                        onClick={() => handleRowClick(company)}
                      >
                        <td data-label="Company Name" className="company-name-cell">
                          <strong>{company.name}</strong>
                        </td>
                        <td data-label="Industry">{company.industry}</td>
                        <td data-label="Location">{company.location}</td>
                        <td data-label="Actions" className="company-actions-cell">
                          <div className="action-buttons-wrap">
                            <button
                              type="button"
                              className="table-action-btn edit-btn"
                              onClick={(e) => handleOpenEdit(e, company)}
                              title="Edit company"
                              aria-label={`Edit ${company.name}`}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </button>
                            <button
                              type="button"
                              className="table-action-btn delete-btn"
                              onClick={(e) => handleDeleteClick(e, company)}
                              title="Delete company"
                              aria-label={`Delete ${company.name}`}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>

        {/* Right Side: Details and Associated Leads */}
        <div className="companies-right-pane">
          {selectedCompany ? (
            <>
              {/* Company Details Card */}
              <div className="card company-details-card">
                <div className="details-header">
                  <div className="details-badge-icon">
                    <BusinessOutlinedIcon />
                  </div>
                  <div>
                    <h2 className="details-title">Company Details</h2>
                    <h3 className="company-heading-name">{selectedCompany.name}</h3>
                  </div>
                </div>

                <div className="details-body">
                  <div className="detail-item">
                    <span className="detail-label">Industry:</span>
                    <span className="detail-value">{selectedCompany.industry}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      <LocationOnOutlinedIcon fontSize="small" className="inline-icon" />
                      {selectedCompany.location}
                    </span>
                  </div>
                  {selectedCompany.website && (
                    <div className="detail-item">
                      <span className="detail-label">Website:</span>
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        <LanguageOutlinedIcon fontSize="small" className="inline-icon" />
                        {selectedCompany.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Associated Leads Card */}
              <div className="card associated-leads-card">
                <div className="associated-leads-header">
                  <h3 className="associated-title">Associated Leads</h3>
                  <span className="associated-count">
                    {associatedLeads.length} {associatedLeads.length === 1 ? "lead" : "leads"}
                  </span>
                </div>

                <div className="associated-leads-content">
                  {leadsLoading ? (
                    <div className="leads-loader-wrap">
                      <CircularProgress size={24} sx={{ color: "var(--color-primary)" }} />
                    </div>
                  ) : associatedLeads.length === 0 ? (
                    <div className="panel-empty-state">No leads associated with this company.</div>
                  ) : (
                    <ul className="associated-leads-list">
                      {associatedLeads.map((lead) => (
                        <li key={lead.id || lead._id} className="associated-lead-item">
                          <div className="item-lead-info">
                            <div className="item-avatar">{getInitials(lead.name)}</div>
                            <div className="item-text">
                              <span className="item-primary-text">{lead.name}</span>
                              <span className="item-secondary-text">{lead.email}</span>
                            </div>
                          </div>
                          <Badge status={lead.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card empty-table-card">Select a company to view details.</div>
          )}
        </div>
      </div>

      {/* Add / Edit Company Modal */}
      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={companyToEdit}
        onSuccess={loadCurrentCompanies}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(companyToDelete)}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.name}"?`}
        confirmText="Delete Company"
        isLoading={isDeleting}
      />
    </div>
  );
}
