# NoteSphere — Full Stack Notes Taking App Website

A modern, responsive, and full-featured **Notes Taking Application** website built with **React.js, Node.js, and Express.js** with **Zero-Config Local Storage** (MongoDB requirement removed). Designed with an intuitive card dashboard, category organization, search filtering, note pinning, dark/light theme switching, and secure JWT authentication.

---

## 🌟 Key Features

1. **Zero External Database Dependency (No MongoDB Required)**
   - All data is securely persisted to `backend/data/db.json` with atomic file writes.
   - **No MongoDB daemon, no Docker, and no cloud database setup required** — runs out-of-the-box on any machine.
   - Compatible 24-character hex IDs and REST API design.

2. **User Authentication & Security**
   - User Registration & Login with validation.
   - Passwords hashed using **bcryptjs** (10 salt rounds).
   - Stateless **JWT (JSON Web Token)** authentication on protected API endpoints.
   - User profile dropdown with one-click logout.

3. **Full CRUD Note Management**
   - **Create Notes**: Add notes with title, detailed description, category, and pinned status.
   - **View Notes**: Responsive card grid with category badges, formatted update timestamps, and full-view reader modal.
   - **Edit Notes**: Update note title, content, category, or pin status at any time.
   - **Delete Notes**: Permanent note deletion with safety confirmation modal.

4. **Pinning & Priority Organization**
   - Pin important notes to stay prominently at the top of your workspace.
   - One-click pin/unpin button directly from the note card.
   
5. **Category Filtering**
   - Categorize notes into:
     - 🌸 **Personal**
     - 🎓 **College**
     - 💼 **Work**
     - 🔮 **Other**
   - Real-time category count badges in the sidebar and top filter bar.

6. **Keyword Search**
   - Instant search filtering by note title or description text with quick query clearing.

7. **Modern UI & Responsive Design**
   - 🌓 **Light & Dark Mode** toggle with automatic `localStorage` persistence.
   - Clean, modern dashboard with glassmorphic accents, custom scrollbars, and animations.
   - Fully responsive for mobile, tablet, and desktop with a slide-out drawer on small screens.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Hooks, Vite, React Router DOM, Lucide React, Custom CSS Design System |
| **Backend** | Node.js, Express.js, Express Validator, CORS, dotenv |
| **Database / Storage** | Local JSON File Database (`backend/data/db.json` — zero config, runs out-of-the-box) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs password hashing |

---

## 📁 Project Folder Structure

```text
sss/
├── backend/
│   ├── config/
│   │   └── db.js                 # Local file database manager & ID generator
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, getMe handlers
│   │   └── noteController.js     # Notes CRUD & pin toggle handlers
│   ├── data/
│   │   └── db.json               # Auto-created local data file (users & notes)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   ├── errorMiddleware.js   # 404 and global error handler
│   │   └── validateMiddleware.js# Express-validator error collector
│   ├── models/
│   │   ├── Note.js               # Note model & category operations
│   │   └── User.js               # User model & bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── noteRoutes.js         # /api/notes routes
│   ├── tests/
│   │   └── api.test.js           # Automated integration test suite
│   ├── .env                      # Environment configuration
│   ├── .env.example              # Template environment variables
│   ├── app.js                    # Express app configuration
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js      # Fetch wrapper with JWT headers
│   │   │   ├── authApi.js        # Auth API endpoints
│   │   │   └── notesApi.js       # Notes API endpoints
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx # Confirmation dialog before deletion
│   │   │   ├── EmptyState.jsx         # Clean empty states & search results
│   │   │   ├── Navbar.jsx             # Top bar: search, theme, add, avatar
│   │   │   ├── NoteCard.jsx           # Note item card with actions
│   │   │   ├── NoteModal.jsx          # Create & Edit note dialog
│   │   │   ├── ProtectedRoute.jsx     # Route guard for authenticated users
│   │   │   ├── Sidebar.jsx            # Categories & filter navigation
│   │   │   └── ViewNoteModal.jsx      # Reader view modal for full note
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User state & auth operations
│   │   │   ├── ThemeContext.jsx       # Light/Dark mode state
│   │   │   └── ToastContext.jsx       # Toast alert notification system
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main workspace dashboard
│   │   │   ├── Login.jsx              # Sign in page
│   │   │   └── Register.jsx           # Sign up page
│   │   ├── styles/
│   │   │   └── index.css              # Theme tokens & responsive stylesheet
│   │   ├── App.jsx                    # Root routing
│   │   └── main.jsx                   # React DOM entry
│   ├── index.html
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite configuration with /api proxy
│
├── package.json                  # Root monorepo script runner
├── .gitignore
└── README.md
```

---

## 🗄️ Database Structure (`backend/data/db.json`)

Data is stored as a formatted JSON database file and saved automatically on changes:

### Users Table (`users`)
| Field | Type | Description |
|---|---|---|
| `_id` | String (24 hex) | Unique User ID |
| `name` | String | User's full name (2–60 chars) |
| `email` | String | Unique email address (lowercased) |
| `password` | String | Hashed password (`bcryptjs`, hidden by default) |
| `createdAt` | ISO String | Account creation timestamp |
| `updatedAt` | ISO String | Account update timestamp |

### Notes Table (`notes`)
| Field | Type | Description |
|---|---|---|
| `_id` | String (24 hex) | Unique Note ID |
| `userId` | String | Reference to `User` |
| `title` | String | Note title |
| `description` | String | Note body content |
| `category` | String | Enum: `['Personal', 'College', 'Work', 'Other']` |
| `isPinned` | Boolean | True if pinned to top (default: `false`) |
| `createdAt` | ISO String | Note creation timestamp |
| `updatedAt` | ISO String | Note last updated timestamp |

---

## 🚀 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login with `email` and `password` (returns JWT token) |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |

### Notes (`/api/notes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notes` | Private | Get user notes (supports `?category=`, `?pinned=`, `?search=`) |
| `POST` | `/api/notes` | Private | Create a note (`title`, `description`, `category`, `isPinned`) |
| `PUT` | `/api/notes/:id` | Private | Update existing note |
| `DELETE` | `/api/notes/:id` | Private | Delete note permanently |
| `PATCH` | `/api/notes/:id/pin` | Private | Toggle pin status of note |

### System
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check server and local database status |

---

## ⚙️ How to Run the Project (Single Command)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; verified on Node v22)
- **No MongoDB or database installation required!**

### 2. Start Both Backend & Frontend with One Command
From the root project directory (`c:\mohith\OneDrive\Desktop\sss`), simply run:

```bash
npm run dev
```

This single command automatically starts **both** servers together:
- 🚀 **Backend API**: `http://127.0.0.1:5000` (Local database active)
- 💻 **Frontend React App**: `http://localhost:5173`

### 3. Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### Alternative: Running in Separate Terminals

If you prefer two separate terminal windows:

**Terminal 1 — Backend:**
```bash
npm run dev:backend
```
*(or `cd backend && npm run dev`)*

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
```
*(or `cd frontend && npm run dev`)*

---

## 🧪 Running Automated Tests

Run the full end-to-end backend integration test suite:

```bash
cd backend
npm test
```
All tests run with Node's native test runner and pass 100%.
