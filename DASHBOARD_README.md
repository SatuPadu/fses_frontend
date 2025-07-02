# Role-Based Dashboard Implementation

This document describes the implementation of role-based dashboards for the FSES frontend application.

## Overview

The dashboard system provides different views based on user roles:
- **Office Assistant**: Student management dashboard with administrative actions
- **Research Supervisor**: My students overview with pending nominations
- **Program Coordinator**: Department overview with evaluation management
- **PGAM**: Faculty-wide overview with system statistics

## API Endpoints

The dashboard uses the following API endpoints:

```
GET /dashboard/office-assistant
GET /dashboard/research-supervisor  
GET /dashboard/program-coordinator
GET /dashboard/pgam
```

All endpoints require JWT authentication and specific role middleware.

## Components Structure

### Core Components

1. **`RoleBasedDashboard.vue`** - Main component that dynamically renders the appropriate dashboard based on user role
2. **`useDashboard.ts`** - Composable for managing dashboard data fetching and state
3. **`types/dashboard/index.ts`** - TypeScript interfaces for dashboard data structures

### Role-Specific Components

1. **`OfficeAssistantDashboard.vue`** - Complete implementation with student management charts and quick actions
2. **`ResearchSupervisorDashboard.vue`** - My students overview with pending nominations table
3. **`ProgramCoordinatorDashboard.vue`** - Department overview with evaluation management and workload distribution
4. **`PGAMDashboard.vue`** - Faculty-wide overview with comprehensive system statistics

### Sub-Components

1. **`StudentManagementOverview.vue`** - Charts and statistics for student management data
2. **`QuickActions.vue`** - Action buttons for common tasks

## Features

### Office Assistant Dashboard (Student Management)
- Total students managed count
- Student distribution by program (donut chart)
- Student distribution by department (bar chart)
- Student distribution by evaluation type (pie chart)
- Student distribution by semester (list view)
- Student management action buttons for administrative tasks
  - **Add New Student**: Redirects to students page and automatically opens the add student modal
  - **Import Student Data**: Navigate to import page for bulk data import
  - **View All Students**: Browse and manage all student records

### Research Supervisor Dashboard
- My students overview with key metrics
- Pending nominations table with student details
- Recent nominations (when available)

### Program Coordinator Dashboard
- Department overview with student counts
- Evaluation management statistics
- Workload distribution for examiners and chairpersons

### PGAM Dashboard
- Faculty-wide overview with comprehensive statistics
- Department comparison with evaluation progress
- System statistics including usage metrics

## Usage

The dashboard is automatically loaded when users visit the home page (`/`) or the dedicated dashboard page (`/dashboard`). The system:

1. Checks the user's roles from the authentication store
2. Determines which dashboard to display
3. Fetches the appropriate data from the API
4. Renders the role-specific dashboard component

## Error Handling

- Loading states with progress indicators
- Error states with retry functionality
- Toast notifications for API errors
- Graceful fallback for users without dashboard access

## Styling

The dashboards use Vuetify components with:
- Consistent card layouts with elevation
- Color-coded icons and statistics
- Responsive grid layouts
- Interactive charts using ApexCharts
- Data tables for detailed information

## Data Flow

1. User authentication → Role determination
2. Role-based API call → Data fetching
3. Data processing → Component rendering
4. User interaction → Navigation to related pages

## Future Enhancements

- Real-time data updates
- Export functionality for reports
- Advanced filtering and search
- Customizable dashboard layouts
- Performance optimizations for large datasets 