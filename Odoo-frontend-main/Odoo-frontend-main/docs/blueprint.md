# **App Name**: GearGuard

## Core Features:

- User Authentication: Secure login/registration via Firebase Authentication (Email/Password + Google). User roles (admin, manager, technician, employee) are stored in Firestore for role-based access control. 
- Dashboard Metrics: Display key metrics such as Total Equipment, Open Requests, Overdue Requests, and Requests by Status using Recharts.
- Equipment Management: Equipment list view with search and filtering. Form to create/edit equipment details (Name, Serial Number, Department, Team, Purchase Date, Warranty, Location, Scrap).
- Maintenance Team Management: Create/Edit Teams with Team Name, Type (Mechanics, Electricians, IT), and Members (Firebase users).
- Maintenance Request Kanban: Kanban board (New, In Progress, Repaired, Scrap) with drag & drop functionality using @dnd-kit or react-beautiful-dnd to manage maintenance requests. Status auto-updates on drag and drop. An LLM tool restricts card movement based on user roles.
- Calendar Integration: Display Preventive Maintenance Requests on a monthly/weekly calendar using FullCalendar or React Big Calendar, color-coded by Team.
- Smart Equipment Association: AI-powered assistant automatically suggests maintenance teams and auto-fills equipment information, maintenance team, and technician assignment upon equipment selection in the request form.

## Style Guidelines:

- The app will use a dark theme, leaning on concepts of modern industry for its design inspiration. Primary color: Steel blue (#4682B4) to convey reliability and technical precision.
- Background color: Dark gray (#282828), a desaturated hue providing contrast with interface elements.
- Accent color: Electric blue (#7DF9FF) to highlight interactive elements and status indicators.
- Body and headline font: 'Inter', a sans-serif providing a modern and objective feel suitable for displaying equipment details and request information. 
- Code font: 'Source Code Pro' for displaying technical notes and system information.
- Use simple, clear icons from a set like FontAwesome or Material Icons to represent equipment types, maintenance status, and team roles.
- Responsive grid layout optimized for desktop and tablet, ensuring consistent presentation across different screen sizes.
- Subtle transitions and animations using framer-motion to provide feedback and guide the user through interactions, like smooth card movements on the Kanban board.