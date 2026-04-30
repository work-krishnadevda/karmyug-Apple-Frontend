# HRMS Leave Management System

A comprehensive leave management system built with React and CoreUI components for the Real Apple HRMS project.

## Features

### 🏢 Leave Types
- **Casual Leave (CL)**: 12 days per year, credited monthly (+1)
- **Unpaid Leave (UL)**: 16 days per year, max 4 per quarter
- **Penalty System**: Extra UL beyond quarterly limit = double deduction
- **Year-end Processing**: UL ≤ 16 → refund penalty, UL > 16 → keep double deduction

### 🔄 Workflow
- Employee applies → Select leave type, dates, reason
- **Status States**: Pending, Partially Approved, Approved, Rejected, Cancelled
- **Minimum 2 approvers** required for Approved/Rejected
- **Approval Chain**: Admin → HR → Branch Manager → RC → SFO → LCTO
- **Notifications** for each approval step

### 👥 User Roles

#### Employee Dashboard
- Apply for leave with balance validation
- View leave balance and history
- Cancel pending requests
- Track approval status

#### Approver Dashboard
- View pending requests for approval
- Approve/Reject with comments
- View employee leave balance
- Track approval chain status

#### Admin Dashboard
- Comprehensive leave statistics
- Department-wise analytics
- Penalty bucket management
- Export reports
- Filter and search functionality

## Components Structure

```
LeaveManagement/
├── EmployeeDashboard.jsx    # Employee leave application & history
├── ApproverDashboard.jsx    # Manager approval interface
├── AdminDashboard.jsx       # Admin analytics & management
├── utils.js                 # Common utility functions
├── index.js                 # Component exports
└── README.md               # This documentation
```

## Key Features Implemented

### ✅ Frontend Logic
- **Balance Check**: CL ≤ balance, UL ≤ quarterly limit
- **Auto Status Update**: After 2 approvals/rejections
- **Penalty Bucket**: Calculation for UL double deduction
- **Cancel Option**: Before approval
- **Date Validation**: Start/end date logic
- **Real-time Updates**: Status changes reflect immediately

### ✅ UI Components
- **CCard**: Layout containers
- **CTable**: Data display
- **CModal**: Leave details and actions
- **CProgress**: Balance visualization
- **CChart**: Analytics charts
- **CForm**: Input forms
- **CBadge**: Status indicators

### ✅ Data Management
- **Dummy Data**: Complete test dataset
- **State Management**: React hooks
- **Filtering**: Multi-criteria filtering
- **Validation**: Form and business logic validation

## Usage

### Import Components
```javascript
import { 
  EmployeeDashboard, 
  ApproverDashboard, 
  AdminDashboard 
} from './views/hrms/LeaveManagement'
```

### Basic Setup
```javascript
// In your routes or main component
<EmployeeDashboard />    // For employees
<ApproverDashboard />    // For managers/approvers
<AdminDashboard />       // For administrators
```

## Business Rules

### Leave Application
1. **CL Balance Check**: Cannot exceed available CL balance
2. **UL Quarterly Limit**: Cannot exceed 4 days per quarter
3. **Date Validation**: End date must be after start date
4. **Required Fields**: Leave type, dates, and reason mandatory

### Approval Process
1. **Minimum 2 Approvers**: Required for final decision
2. **Sequential Approval**: Follows defined approval chain
3. **Comments Required**: Approvers must provide comments
4. **Status Updates**: Automatic based on approval count

### Penalty System
1. **UL Quarterly Limit**: 4 days per quarter
2. **Double Deduction**: Extra days beyond limit
3. **Year-end Processing**: Refund if total UL ≤ 16
4. **Penalty Bucket**: Tracks all deductions

## Dummy Data

The system includes comprehensive dummy data for testing:
- 3 sample leave requests with different statuses
- Employee leave balances
- Approval chain examples
- Department statistics
- Monthly trends data

## Future Enhancements

### Backend Integration
- API endpoints for CRUD operations
- Real-time notifications
- Database persistence
- User authentication integration

### Additional Features
- Email notifications
- Calendar integration
- Mobile responsiveness
- Advanced reporting
- Bulk operations
- Leave policy management

## Technical Stack

- **React**: Frontend framework
- **CoreUI**: UI component library
- **Chart.js**: Analytics visualization
- **React Hooks**: State management
- **ES6+**: Modern JavaScript features

## File Structure

```
src/views/hrms/LeaveManagement/
├── EmployeeDashboard.jsx    # 400+ lines - Employee interface
├── ApproverDashboard.jsx    # 350+ lines - Approval interface  
├── AdminDashboard.jsx       # 450+ lines - Admin analytics
├── utils.js                 # 100+ lines - Utility functions
├── index.js                 # 5 lines - Exports
└── README.md               # Documentation
```

## Testing

All components include dummy data for immediate testing:
- Try applying for leave with insufficient balance
- Test approval workflow with different scenarios
- View analytics and filtering in admin dashboard
- Test cancel functionality for pending requests

## Contributing

1. Follow CoreUI component patterns
2. Maintain consistent state management
3. Add proper validation and error handling
4. Update documentation for new features
5. Test with dummy data before backend integration

