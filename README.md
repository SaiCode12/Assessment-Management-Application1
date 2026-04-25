# Assessment-Management-Application
Assessment Management Application to create structured assessments using Categories, Factors, and Questions with dynamic configuration. Includes authentication, builder, launch pad to take assessments, and reports to view responses, demonstrating a complete full-stack workflow.

Setup Instructions
Prerequisites

Node.js (v18 or above recommended)
npm or yarn

Installation
bash# Clone the repository
git clone <your-repo-url>
cd my-app

# Install dependencies
npm install
Running the Development Server
bashnpm run dev
The app will be available at http://localhost:5173 (Vite default).
Building for Production
bashnpm run build
Linting
bashnpm run lint

Architecture Overview
This is a single-page application (SPA) built with:

React — UI library
Vite — Build tool and dev server
React Router (BrowserRouter) — Client-side routing
Tailwind CSS — Utility-first styling
PostCSS — CSS processing pipeline
react-toastify — Toast notification system
AuthContext — Custom context-based authentication state management

Key Architectural Decisions

Context API is used for global auth state via AuthContext.jsx, wrapping the entire app in AuthProvider.
Layout component provides a shared shell (navbar, sidebar, etc.) around authenticated pages.
Pages are route-level components, each with a dedicated CSS file under src/css/.
API calls are centralized in src/utils/api.jsx to keep data-fetching logic separate from UI.


Folder Structure
my-app/
├── public/                        # Static assets served as-is
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── ConfirmModel.jsx       # Confirmation dialog/modal
│   │   ├── Layout.jsx             # App shell (nav, sidebar, footer)
│   │   ├── LoadCategoriesModal.jsx# Modal for loading categories
│   │   └── SettingsModal.jsx      # Settings dialog
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state, login/logout logic (React Context)
│   │
│   ├── css/                       # Per-page and global stylesheets
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
│   ├── pages/                     # Route-level page components
│   │   ├── Assessments.jsx        # List/manage assessments
│   │   ├── Builder.jsx            # Assessment builder
│   │   ├── LaunchPad.jsx          # Dashboard / launch screen
│   │   ├── Login.jsx              # Login page
│   │   ├── Profile.jsx            # User profile
│   │   ├── Register.jsx           # Registration page
│   │   ├── Reports.jsx            # Reports and analytics
│   │   └── TakeAssessment.jsx     # Assessment-taking interface
│   │
│   ├── utils/
│   │   └── api.jsx                # Centralized API utility (axios/fetch wrappers)
│   │
│   ├── App.jsx                    # Root component — routing + providers
│   └── index.jsx                  # React DOM entry point
│
├── index.html                     # HTML shell for Vite
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.js                 # Vite build configuration
├── eslint.config.js               # ESLint rules
└── README.md                      # Project documentation



Scripts Reference
CommandDescriptionnpm run devStart local dev servernpm run buildProduction build to dist/npm run previewPreview production build locallynpm run lintRun ESLint checks
