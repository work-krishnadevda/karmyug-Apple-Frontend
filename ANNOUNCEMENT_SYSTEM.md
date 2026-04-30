# Announcement System

## Overview
A comprehensive announcement and notification system for HR and Admin panels that allows creating, managing, and displaying announcements to all users.

## Features

### For HR and Admin Users:
- ✅ Create new announcements with title, message, and priority
- ✅ Edit existing announcements
- ✅ Delete announcements
- ✅ Set priority levels (Normal, Medium, High)
- ✅ View all announcements in a management table
- ✅ Search and filter announcements
- ✅ Full CRUD operations

### For All Users:
- ✅ View latest announcements on dashboard
- ✅ See announcements with priority indicators
- ✅ Expandable long messages
- ✅ Responsive design for mobile devices
- ✅ Real-time updates

## Components

### 1. AnnouncementWidget.js
- **Location**: `src/components/AnnouncementWidget.js`
- **Purpose**: Full-featured announcement management for HR/Admin
- **Features**: Create, edit, delete, view all announcements

### 2. AnnouncementDisplay.js
- **Location**: `src/components/AnnouncementDisplay.js`
- **Purpose**: Read-only announcement display for all users
- **Features**: Show latest announcements, expandable messages, priority badges

### 3. AnnouncementManagement.js
- **Location**: `src/views/announcements/AnnouncementManagement.js`
- **Purpose**: Dedicated management page for HR/Admin
- **Features**: Table view, search, filter, bulk operations

## Integration

### Dashboard Integration
The announcement system is integrated into the main dashboard (`AdminWidget.js`):
- HR/Admin users see the full management widget
- Other users see the read-only display widget
- Shows latest 3 announcements by default

### API Endpoints Required
The system expects these backend endpoints:
```
GET /announcements - Get all announcements
POST /announcements - Create new announcement
PUT /announcements/:id - Update announcement
DELETE /announcements/:id - Delete announcement
```

### Expected API Response Format
```json
{
  "data": [
    {
      "_id": "unique_id",
      "title": "Announcement Title",
      "message": "Announcement message content",
      "priority": "high|medium|normal",
      "createdBy": "admin|hr",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Styling
- **CSS File**: `src/assets/css/announcements.css`
- **Features**: Responsive design, priority-based colors, animations, hover effects

## Usage

### For HR/Admin Users:
1. Navigate to dashboard
2. See announcement widget with "Add Announcement" button
3. Click to create, edit, or delete announcements
4. Use dedicated management page for advanced operations

### For Regular Users:
1. Navigate to dashboard
2. See latest announcements automatically
3. Click "Read more" for long messages
4. View priority indicators and timestamps

## Priority System
- **High Priority**: Red badge, prominent display
- **Medium Priority**: Yellow badge, moderate emphasis
- **Normal Priority**: Blue badge, standard display

## Responsive Design
- Mobile-friendly interface
- Collapsible messages for long content
- Touch-friendly buttons and interactions
- Optimized for all screen sizes

## Security
- Only HR and Admin users can create/edit/delete announcements
- Regular users can only view announcements
- Role-based access control implemented

## Future Enhancements
- Email notifications for new announcements
- Announcement categories/tags
- Scheduled announcements
- User read receipts
- Rich text editor for announcements
- File attachments support
