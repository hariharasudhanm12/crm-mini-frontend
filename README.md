# Mini CRM

A simple, interview-friendly frontend built with React, Vite, and Redux Toolkit.

## 1. Project Overview

Mini CRM is a customer relationship management frontend designed with simplicity, clean code structure, and interview readability in mind. It provides:
- **Authentication**: JWT-based login with error handling, session persistence, and protected routes.
- **Dashboard**: High-level KPI metrics aggregation, recent leads view, and upcoming tasks.
- **Leads Management**: Server-side searching (with 400ms debounce), filtering, pagination, and soft delete.
- **Companies Management**: Directory table with master-detail selection, associated leads inspection, and quick modal additions.
- **Tasks Management**: Task tracking with due dates, ownership validation checks, and inline status updates.

## 2. Tech Stack

- **React 19 & Vite**: Fast development server and build tool with functional components and React hooks (`useState`, `useEffect`, `useSelector`, `useDispatch`).
- **React Router DOM v7**: Declarative routing, protected route guards, and URL navigation.
- **Redux Toolkit & React-Redux**: Single global slice architecture (`crmSlice.js`) managing state, loading statuses, error handling, and async actions via `createAsyncThunk`. No RTK Query or custom middleware.
- **Axios**: HTTP client configured with base URL, 15-second timeout, authentication request interceptor, and automatic 401 response handling.
- **Formik & Yup**: Form state management with declarative schema validation colocated in form component files.
- **Material UI (MUI)**: Restricted strictly to icons (`@mui/icons-material`) and loading indicators (`CircularProgress`, `LinearProgress`, `Skeleton`).
- **Plain CSS**: Clean, responsive styles with CSS variables and custom media queries. No external CSS framework, Tailwind, or styled-components.

## 3. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Default setting:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the App
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Run linter: `npm run lint`

## 4. Environment Variables

| Variable Name | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint for the CRM backend REST API | `http://localhost:5000/api` |

## 5. Folder Structure

```
mini-crm/
├── public/                 # Static assets (favicons, etc.)
├── src/
│   ├── main.jsx            # Entry point: Redux Provider, Router setup, global CSS import
│   ├── App.jsx             # Route definitions and page outlet mapping
│   ├── config.js           # App constants (APP_NAME, PAGE_SIZE, status and industry lists)
│   ├── api.js              # Axios instance and API service functions
│   ├── store/
│   │   ├── store.js        # Redux store configured with single crmReducer
│   │   └── crmSlice.js     # Single Redux slice for all app state, thunks, and reducers
│   ├── pages/              # Page-level components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsPage.jsx
│   │   ├── CompaniesPage.jsx
│   │   ├── TasksPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── components/         # Reusable presentation and form components
│   │   ├── Layout.jsx          # Responsive shell (Sidebar + Topbar + Outlet)
│   │   ├── ProtectedRoute.jsx  # Route guard checking authentication token
│   │   ├── Modal.jsx           # Reusable modal dialog with escape and backdrop dismissal
│   │   ├── FormFields.jsx      # Formik wrappers (FormInput, FormSelect) with error handling
│   │   ├── LeadFormModal.jsx   # Add/Edit Lead modal with Yup validation
│   │   ├── CompanyFormModal.jsx# Add/Edit Company modal with Yup validation
│   │   ├── TaskFormModal.jsx   # Add/Edit Task modal with Yup validation
│   │   ├── Pagination.jsx      # Numbered pagination component
│   │   ├── Badge.jsx           # Status badge component
│   │   ├── Loader.jsx          # PageLoader and TableSkeleton components
│   │   ├── ConfirmDialog.jsx   # Generic confirmation modal for delete actions
│   │   ├── ErrorBanner.jsx     # Reusable error banner with retry support
│   │   └── Toast.jsx           # Global toast notifications
│   └── styles/
│       └── global.css      # CSS variables, resets, table and button styles
├── .env.example            # Sample environment variables
├── index.html              # HTML shell with viewport and title
├── package.json            # Scripts and dependencies configuration
└── README.md               # Project documentation
```

### Scripts Explanation
- `npm run dev`: Starts Vite dev server with hot module replacement (HMR).
- `npm run build`: Compiles production-ready bundle into `dist/`.
- `npm run lint`: Analyzes codebase with ESLint to enforce best practices and clean code.

## 6. How Data Flows

The data lifecycle follows a predictable, unidirectional cycle:
1. **Component Trigger**: A UI event (e.g. form submission, page change, delete button click) calls `dispatch(thunk(params))`.
2. **Redux Thunk (`createAsyncThunk`)**: The thunk receives parameters, executes corresponding functions in `src/api.js`, and awaits the response.
3. **API Service (`src/api.js`)**: Axios performs the HTTP call with request interceptors attaching authorization headers (`Bearer <token>`).
4. **Backend Processing**: The backend returns JSON or HTTP errors.
5. **Redux Reducer (`crmSlice.js`)**:
   - `pending`: Sets state `status = "loading"` and clears previous errors.
   - `fulfilled`: Stores parsed data, updates status to `"succeeded"`, and optionally triggers success toasts.
   - `rejected`: Extracts the formatted error message via `getErrorMessage()`, stores it in slice error state (`saveError` or module error), and optionally dispatches an error toast.
6. **Component Render**: Components consume state via `useSelector((state) => state.crm.<module>)` and update UI immediately without local state sync bugs.

## 7. Redux Slice and Error Handling

### State Shape
```javascript
{
  token, user,                                   // Authentication
  login: { status, error },
  dashboard: { data, status, error },
  leads: { items, total, totalPages, status, error },
  companies: { items, total, totalPages, selectedId, associatedLeads, leadsLoading, status, error },
  tasks: { items, total, totalPages, status, error },
  users: [], companyOptions: [], leadOptions: [], // Dropdown lists
  saveStatus: "idle", saveError: null,           // Shared by all modals
  toasts: []                                     // [{ id, type, message }]
}
```

### Async Thunk Pattern
Every thunk follows this standard structure:
```javascript
export const fetchLeads = createAsyncThunk("crm/fetchLeads", async (params, thunkAPI) => {
  try {
    const response = await getLeadsApi(params);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    thunkAPI.dispatch(addToast({ type: "error", message }));
    return thunkAPI.rejectWithValue(message);
  }
});
```

### The Six Error Rules
1. **Form fields**: Field-level validation errors (Yup) display directly beneath their respective input.
2. **Form save errors**: Save thunks (`saveLead`, `saveCompany`, `saveTask`) store backend error messages in `saveError`. The modal renders it inside an `ErrorBanner` at the top (without duplicate toast notifications).
3. **Page load errors**: If initial fetch fails, an `ErrorBanner` displays with a "Retry" button that dispatches the fetch thunk again.
4. **Action errors**: Mutation actions outside forms (e.g., delete lead/company/task, mark task done) dispatch an error toast notification.
5. **Success notifications**: Mutating actions dispatch success toasts (e.g. "Lead saved successfully", "Company deleted successfully") which auto-dismiss after 4 seconds.
6. **Login failures**: Authentication errors display exclusively in an inline banner below the submit button on the login card, with no toast.

## 8. Forms and Validation

All forms are built with **Formik** and validated through **Yup** schemas located directly at the top of their respective component files:
- **Formik**: Encapsulates form values, touched status, submission cycle, and `enableReinitialize` for edit modes.
- **Yup**: Declarative client-side validation preventing invalid HTTP payloads.
- **FormFields Components**: `FormInput` and `FormSelect` bind to Formik context via `useField`, automatically showing label and error messages when touched.

| Form | Component File | Validation Rules |
|---|---|---|
| **Login** | `LoginPage.jsx` | `email` required & valid email format; `password` required |
| **Lead** | `LeadFormModal.jsx` | `name` required (min 2 chars); `email` required & valid format; `phone` optional (7 to 15 digits, spaces, `+`, `-`); `status` required (one of `LEAD_STATUSES`); `assignedTo` & `company` optional |
| **Company** | `CompanyFormModal.jsx` | `name` required; `industry` required (one of `INDUSTRY_OPTIONS`); `location` required; `website` optional (valid URL when provided) |
| **Task** | `TaskFormModal.jsx` | `title` required; `lead`, `dueDate` (yyyy-mm-dd), and `assignedTo` required; `status` required (one of `TASK_STATUSES`) |

## 9. Authentication and Authorization

### JWT Storage and Handling
- **Persistence**: Upon successful authentication via `POST /auth/login`, the response `{ token, user }` is stored in both `localStorage` and Redux state.
- **Automatic Request Attachment**: Axios request interceptor attaches the JWT token header: `Authorization: Bearer <token>`.
- **Global 401 Interception**: When any non-login endpoint responds with HTTP 401 Unauthorized, the response interceptor purges `localStorage` (`token`, `user`) and redirects the user immediately to `/login`.
- **Route Guarding**: `ProtectedRoute.jsx` checks for the existence of `token` in the Redux store. If absent, it redirects the visitor to `/login`. If an authenticated user navigates to `/login`, they are redirected automatically to `/dashboard`.
- **TopBar Logout**: A prominent logout button in the topbar triggers `dispatch(logout())`, clearing all credentials and navigating safely to `/login`.

### Authorization and Task Ownership Rule
- The Task module enforces strict user authorization: only the assignee is permitted to change a task's status to **Done**.
- **Client-Side Enforcement**: The task's `assignedTo.id` is compared with the authenticated `user.id` in Redux. If they do not match, or if the task is already "Done", the Done button is disabled with a descriptive tooltip ("Only the assigned user can update this task").
- **Server-Side Enforcement**: The backend route `PATCH /tasks/:id/status` validates that the caller matches the assigned user. If the backend returns HTTP 403 Forbidden, the application displays the refusal message in an error toast and triggers a fresh background refetch of tasks to reconcile state.

## 10. Module Guide

### Login (`/login`)
- **Fields**:
  - `email` (text): Valid email format, required.
  - `password` (password with show/hide toggle): Required.
  - Remember me checkbox (visual preference).
  - Forgot password? link (displays informational toast).
- **Validation**: `loginSchema` defined in `LoginPage.jsx`.
- **Endpoints**: `POST /auth/login` returning `{ token, user: { id, name, email, role } }`.
- **Error Behavior**: API errors display in a prominent red `ErrorBanner` placed right beneath the login button. The banner clears automatically when the user begins typing.

### Dashboard (`/dashboard`)
- **Overview Header**: Greets the authenticated user (`Good to see you, {firstName}`).
- **KPI Cards**: 4 cards displaying **Total Leads**, **Qualified Leads**, **Tasks Due Today**, and **Completed Tasks**. All numbers come directly from server-side aggregation and show MUI `Skeleton` placeholders while loading.
- **Recent Leads Panel**: Displays up to recent leads with initials avatar, full name, email, and color-coded status badge with a "View all" link to `/leads`.
- **Upcoming Tasks Panel**: Displays upcoming tasks with title, associated lead name, formatted due date, and status badge with a "View all" link to `/tasks`.
- **Endpoints**: `GET /dashboard/summary` returning `{ totalLeads, qualifiedLeads, tasksDueToday, completedTasks, recentLeads, upcomingTasks }`.
- **Error Handling**: `ErrorBanner` with Retry button dispatches `fetchDashboard` upon failure.

### Leads (`/leads`)
- **Toolbar**: Debounced search input (waits 400ms after keystroke), status dropdown filter (`All`, `New`, `Contacted`, `Qualified`, `Lost`), and "+ Add Lead" primary button. Changing search or status resets the pagination to page 1.
- **Table Columns**: Name, Email, Status (color-coded badge), Assigned To, and Actions (Edit and Soft-Delete buttons).
- **Mobile Stacked Cards**: On mobile screens (`<=480px`), rows transform cleanly into individual stacked cards with `data-label` pseudo-element keys and full-width touch actions.
- **Add / Edit Modal**: Single component `LeadFormModal.jsx` utilizing `enableReinitialize`, `leadSchema` validation, and dropdowns populated from `GET /users` and `GET /companies?all=true`.
- **Soft Delete**: Prompts user via `ConfirmDialog`. On confirm, dispatches `deleteLead(id)` (`DELETE /leads/:id`), flashes a success toast, and refreshes the table.
- **Endpoints**:
  - `GET /leads?page=1&limit=10&search=...&status=...`
  - `POST /leads`
  - `PUT /leads/:id`
  - `DELETE /leads/:id`

### Companies (`/companies`)
- **Layout**: Two-column master-detail layout on laptops/desktops (`grid-template-columns: 1.25fr 1fr`).
- **Left Directory**: Directory table with Company Name, Industry, Location, Actions (edit, delete), search box, and pagination. Clicking a row highlights it and selects it (defaults to the first company).
- **Right Detail Panels**:
  - **Company Details Card**: Displays Industry, Location, and an optional Website link (hidden if empty).
  - **Associated Leads Card**: Displays leads connected to the selected company with avatar initials, name, email, status badge, and an internal loader while fetching.
- **Add / Edit Modal**: Single component `CompanyFormModal.jsx` validating with `companySchema`. Upon successful company creation, dispatches `fetchDropdownOptions()` so the new company immediately appears in the Lead modal's company select.
- **Delete Protection**: Prompts via `ConfirmDialog`. If the backend refuses deletion (e.g. company has active leads), the refusal message displays in an error toast.
- **Endpoints**:
  - `GET /companies?page=&limit=&search=`
  - `GET /companies/:id/leads`
  - `POST /companies`
  - `PUT /companies/:id`
  - `DELETE /companies/:id`

### Tasks (`/tasks`)
- **Toolbar**: Title and "+ Add Task" outlined button.
- **Notice Banner**: Blue informative banner reminding users: *"Note: Only assigned users can update task status."*
- **Table Columns**: Title, Lead, Due Date, Status (color-coded badge), and Actions (`Done` button, `Edit`, and `Delete` icons).
- **Authorization Check**:
  - Client side: Checks `task.assignedTo.id === currentUser.id`. If they differ or the task is already "Done", the Done button is disabled with an explanatory tooltip.
  - Server side: The endpoint `PATCH /tasks/:id/status` returns HTTP 403 Forbidden if not authorized. The frontend captures this error, pops an error toast, and triggers a table refetch.
- **Add / Edit Modal**: Single component `TaskFormModal.jsx` validating with `taskSchema`. Pre-loads leads and user options from Redux state.
- **Endpoints**:
  - `GET /tasks?page=&limit=`
  - `POST /tasks`
  - `PUT /tasks/:id`
  - `PATCH /tasks/:id/status`
  - `DELETE /tasks/:id`

## 11. API Contract

| Endpoint | Method | Params / Payload | Expected Response Shape |
|---|---|---|---|
| `/auth/login` | POST | `{ email, password }` | `{ token: string, user: { id, name, email, role } }` |
| `/dashboard/summary` | GET | None | `{ totalLeads: number, qualifiedLeads: number, tasksDueToday: number, completedTasks: number, recentLeads: Array, upcomingTasks: Array }` |
| `/leads` | GET | `?page=&limit=&search=&status=` | `{ data: Array<Lead>, total: number, page: number, totalPages: number }` |
| `/leads` | POST | `{ name, email, phone?, status, assignedTo?, company? }` | `{ data: Lead }` |
| `/leads/:id` | PUT | `{ name, email, phone?, status, assignedTo?, company? }` | `{ data: Lead }` |
| `/leads/:id` | DELETE | None | `{ message: string }` |
| `/companies` | GET | `?page=&limit=&search=&all=` | `{ data: Array<Company>, total: number, page: number, totalPages: number }` |
| `/companies/:id/leads` | GET | None | `Array<Lead>` |
| `/companies` | POST | `{ name, industry, location, website? }` | `{ data: Company }` |
| `/companies/:id` | PUT | `{ name, industry, location, website? }` | `{ data: Company }` |
| `/companies/:id` | DELETE | None | `{ message: string }` |
| `/tasks` | GET | `?page=&limit=` | `{ data: Array<Task>, total: number, page: number, totalPages: number }` |
| `/tasks` | POST | `{ title, lead, dueDate, assignedTo, status }` | `{ data: Task }` |
| `/tasks/:id` | PUT | `{ title, lead, dueDate, assignedTo, status }` | `{ data: Task }` |
| `/tasks/:id/status` | PATCH | `{ status: "Done" }` | `{ data: Task }` |
| `/tasks/:id` | DELETE | None | `{ message: string }` |
| `/users` | GET | None | `Array<{ id, name, email, role }>` |

## 12. Styling and Responsiveness

### CSS Variables
Defined in `src/styles/global.css`:
- `--color-primary: #5b5bf0` (Primary SaaS Indigo)
- `--color-sidebar-bg: #111827` (Dark Navy Sidebar)
- `--color-bg: #f6f7f9` (Light Grey Page Background)
- `--color-surface: #ffffff` (Clean White Cards)
- `--sidebar-width: 240px`, `--topbar-height: 64px`
- Status tokens: `--color-danger: #ef4444`, `--color-success: #10b981`, `--color-warning: #f59e0b`

### Responsive Breakpoints Table
| Breakpoint | Target Device | Layout Adjustments |
|---|---|---|
| **Above 1024px** | Laptop and Desktop | Full 240px dark navy sidebar, 4 KPI cards per row, Companies master-detail side-by-side. |
| **max-width: 1024px** | Small Laptop, Tablet Landscape | Sidebar collapses to 72px icon-only rail; KPI cards 2 per row; Recent leads & Upcoming tasks stack; Company detail panels stack under table. |
| **max-width: 768px** | Tablet Portrait | Sidebar becomes off-canvas drawer opened via hamburger button (`MenuOutlined`); dark backdrop; header and action buttons stack; modals expand to 90% width. |
| **max-width: 480px** | Mobile Phone | KPI cards 1 per row; full-width toolbar search and filter inputs; **tables become stacked cards** via `::before` pseudo-elements reading `data-label`; action buttons stretch full width; modals become full-screen drawers. |

### How Tables Become Cards on Mobile
On viewport widths `<= 480px`, the standard table styling is transformed through pure CSS:
1. `table`, `tbody`, `tr`, and `td` are assigned `display: block; width: 100%`.
2. `thead` is hidden via `display: none`.
3. Each `tr` is styled as an individual card with surface background, border, radius, and elevation.
4. Each `td` uses `display: flex; justify-content: space-between; align-items: center;`.
5. The column header text is retrieved from the HTML attribute using `content: attr(data-label)` inside a `td::before` pseudo-element.

## 13. Soft Delete and Aggregation Notes

### Soft Delete Implementation
- Deleting a lead calls `DELETE /leads/:id`. Rather than physically removing the document from the database, the backend marks it as deleted (e.g. `isDeleted: true`).
- The frontend immediately clears the item from Redux state and triggers a list refetch to keep the pagination count and active page accurate.
- Soft-deleted leads are excluded from:
  - All subsequent `/leads` table queries.
  - The recent leads list on the Dashboard.
  - Associated leads lists under company details.

### Server Aggregations
- Dashboard KPI counts (Total Leads, Qualified Leads, Tasks Due Today, Completed Tasks) are never computed in the frontend via array `.reduce()` or `.filter()`.
- Computing them on the client would break whenever paginated subsets are loaded and would risk counting soft-deleted records.
- Instead, the backend aggregates these statistics over the entire collection in MongoDB and returns single numeric totals.

## 14. Concepts Used (Interview Notes)

- **Redux Data Flow**: Actions trigger async thunks (`createAsyncThunk`), which call Axios services and dispatch standard action types. `extraReducers` updates state immutably via Immer, driving reactive re-renders in components using `useSelector`.
- **`createAsyncThunk` and `.unwrap()`**: Encapsulates request life cycles (pending, fulfilled, rejected). Calling `.unwrap()` in form submit handlers extracts raw payloads and allows standard `try/catch` block handling in components.
- **Formik + Yup Schema Architecture**: Decouples UI rendering from validation state. Colocating schemas directly above form components ensures maintainability while `.trim()` prevents whitespace bypasses.
- **JWT Authentication with Protected Routes**: Token stored securely in `localStorage` and Redux. Axios interceptors attach headers globally and redirect cleanly to `/login` upon expired sessions (401).
- **Mobile First CSS Transformations**: Transforming tabular data into card lists via `data-label` and `::before` pseudo-elements without DOM manipulation or duplicate code.

## 15. Known Limitations and Next Steps

- **Multi-Factor Authentication (MFA)**: Could be added for enterprise grade security.
- **WebSocket / Server-Sent Events (SSE)**: Real-time lead creation notifications and concurrent task status sync.
- **Export Capabilities**: CSV or PDF export for leads and companies directories.
- **Dark Mode**: Toggleable CSS variable theme switcher for dark mode aesthetics.
