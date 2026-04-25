# Assessment-Management-Application
Assessment Management Application to create structured assessments using Categories, Factors, and Questions with dynamic configuration. Includes authentication, builder, launch pad to take assessments, and reports to view responses, demonstrating a complete full-stack workflow.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Scripts Reference](#scripts-reference)
- [Architecture Overview](#architecture-overview)
- [Key Architectural Decisions](#key-architectural-decisions)
- [Folder Structure](#folder-structure)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or above
- `npm` or `yarn`

---

## Installation

```bash
# Clone the repository
git clone 
cd my-app

# Install dependencies
npm install
```

---

## Running the App

### Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (Vite default).

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Scripts Reference

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start local development server     |
| `npm run build`     | Production build output to `dist/` |
| `npm run preview`   | Preview production build locally   |
| `npm run lint`      | Run ESLint checks                  |

---

## Architecture Overview

This is a single-page application (SPA) built with the following stack:

| Technology          | Role                                       |
|---------------------|--------------------------------------------|
| **React**           | UI library                                 |
| **Vite**            | Build tool and dev server                  |
| **React Router**    | Client-side routing (`BrowserRouter`)      |
| **Tailwind CSS**    | Utility-first styling                      |
| **PostCSS**         | CSS processing pipeline                    |
| **react-toastify**  | Toast notification system                  |
| **AuthContext**     | Custom context-based auth state management |

---

## Key Architectural Decisions

- **Context API** is used for global auth state via `AuthContext.jsx`, wrapping the entire app in `AuthProvider`.
- **Layout component** provides a shared shell (navbar, sidebar, etc.) around all authenticated pages.
- **Pages** are route-level components, each with a dedicated CSS file under `src/css/`.
- **API calls** are centralized in `src/utils/api.jsx` to keep data-fetching logic separate from UI components.

---

## Folder Structure

```
my-app/
├── public/                         # Static assets served as-is
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── ConfirmModel.jsx        # Confirmation dialog/modal
│   │   ├── Layout.jsx              # App shell (nav, sidebar, footer)
│   │   ├── LoadCategoriesModal.jsx # Modal for loading categories
│   │   └── SettingsModal.jsx       # Settings dialog
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state, login/logout logic (React Context)
│   │
│   ├── css/                        # Per-page and global stylesheets
│   │   ├── App.css
│   │   ├── Assessments.css
│   │   ├── Auth.css
│   │   ├── Builder.css
│   │   ├── LaunchPad.css
│   │   ├── Layout.css
│   │   ├── Profile.css
│   │   ├── Reports.css
│   │   └── TakeAssessment.css
│   │
│   ├── pages/                      # Route-level page components
│   │   ├── Assessments.jsx         # List and manage assessments
│   │   ├── Builder.jsx             # Assessment builder
│   │   ├── LaunchPad.jsx           # Dashboard / launch screen
│   │   ├── Login.jsx               # Login page
│   │   ├── Profile.jsx             # User profile
│   │   ├── Register.jsx            # Registration page
│   │   ├── Reports.jsx             # Reports and analytics
│   │   └── TakeAssessment.jsx      # Assessment-taking interface
│   │
│   ├── utils/
│   │   └── api.jsx                 # Centralized API utility (axios/fetch wrappers)
│   │
│   ├── App.jsx                     # Root component — routing + providers
│   └── index.jsx                   # React DOM entry point
│
├── index.html                      # HTML shell for Vite
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── vite.config.js                  # Vite build configuration
├── eslint.config.js                # ESLint rules
└── README.md                       # Project documentation
```
