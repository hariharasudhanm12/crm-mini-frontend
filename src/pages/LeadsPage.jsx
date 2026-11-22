// Leads management page with debounced search, filtering, pagination, and soft delete
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLeads,
  deleteLead,
  fetchUsers,
  fetchDropdownOptions,
} from "../store/crmSlice";
import Badge from "../components/Badge";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";
import LeadFormModal from "../components/LeadFormModal";
import { TableSkeleton } from "../components/Loader";
import { LEAD_STATUSES } from "../config";

// Material UI icons and loaders only
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import "./LeadsPage.css";

export default function LeadsPage() {
  const dispatch = useDispatch();
  const { items, totalPages, status, error } = useSelector(
    (state) => state.crm.leads
  );

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimerRef = useRef(null);

  // Debounce search input by 400ms
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1); // Go back to page 1
    }, 400);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Go back to page 1
  };

  // Fetch leads whenever page, debounced search, or status filter changes
  useEffect(() => {
    const params = {
      page,
      limit: 10,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter || undefined,
    };
    dispatch(fetchLeads(params));
  }, [dispatch, page, debouncedSearch, statusFilter]);

  // Load dropdown lists (users and companies) on mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDropdownOptions());
  }, [dispatch]);

  const loadCurrentLeads = () => {
    dispatch(
      fetchLeads({
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
      })
    );
  };

  const handleOpenAdd = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const id = leadToDelete.id || leadToDelete._id;
      await dispatch(deleteLead(id)).unwrap();
      setLeadToDelete(null);
      loadCurrentLeads();
    } catch {
      // Toast shown via deleteLead thunk
    } finally {
      setIsDeleting(false);
    }
  };

  const isInitialLoading = status === "loading" && items.length === 0;
  const isRefetching = status === "loading" && items.length > 0;

  return (
    <div className="leads-page-root">
      {/* Header and Toolbar */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Manage and track your business leads</p>
        </div>
        <button
          type="button"
          className="btn btn-primary add-lead-btn"
          onClick={handleOpenAdd}
        >
          <AddOutlinedIcon fontSize="small" />
          <span>Add Lead</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadCurrentLeads} />}

      {/* Filter Toolbar */}
      <div className="card leads-toolbar">
        <div className="search-box-wrapper">
          <SearchOutlinedIcon className="search-icon" fontSize="small" />
          <input
            type="text"
            className="input search-input"
            placeholder="Search leads by name or email..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <select
            className="select status-filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thin LinearProgress while refetching */}
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

      {/* Table / Stacked Cards View */}
      {isInitialLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : items.length === 0 ? (
        <div className="card empty-table-card">No leads found.</div>
      ) : (
        <div className="table-container">
          <table className="table leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => {
                const leadId = lead.id || lead._id;
                const assignedName = lead.assignedTo?.name || "Unassigned";

                return (
                  <tr key={leadId} className="lead-row">
                    <td data-label="Name" className="lead-name-cell">
                      <strong>{lead.name}</strong>
                    </td>
                    <td data-label="Email">{lead.email}</td>
                    <td data-label="Status">
                      <Badge status={lead.status} />
                    </td>
                    <td data-label="Assigned To">{assignedName}</td>
                    <td data-label="Actions" className="lead-actions-cell">
                      <div className="action-buttons-wrap">
                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => handleOpenEdit(lead)}
                          title="Edit lead"
                          aria-label={`Edit ${lead.name}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDeleteClick(lead)}
                          title="Delete lead"
                          aria-label={`Delete ${lead.name}`}
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

      {/* Numbered Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit Lead Modal */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={selectedLead}
        onSuccess={loadCurrentLeads}
      />

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.name}"? This action sets a soft-delete flag.`}
        confirmText="Delete Lead"
        isLoading={isDeleting}
      />
    </div>
  );
}
