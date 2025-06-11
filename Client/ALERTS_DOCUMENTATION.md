# Alerts System Documentation

## Overview
The alerts system provides real-time notifications for kitchen activities including kitchen management, shopping list updates, and user activities.

## Components

### AlertsDrawer (`/src/layouts/AlertsDrawer/AlertsDrawer.tsx`)
- Main component for displaying alerts in a drawer interface
- Slides down from the top of the screen (unlike UserSettingsDrawer which slides up from bottom)
- Shows unread count badge
- Allows marking alerts as read or approving them
- Styled consistently with the existing UserSettingsDrawer

### useAlerts Hook (`/src/hooks/useAlerts.tsx`)
- Custom hook for managing alerts state
- Provides dummy data for 6 different alert types
- Handles read/unread states and approval actions

## Alert Types
1. **ADD_KITCHEN** - New kitchen created
2. **EDIT_KITCHEN** - Kitchen details updated  
3. **ADD_TO_SHOPPING_LIST** - Item added to shopping list
4. **EDIT_SHOPPING_LIST** - Shopping list item modified
5. **GET_IN_KITCHEN** - User joined kitchen
6. **OUT_OF_KITCHEN** - User left kitchen

## Features
- **Bell Icon**: Located in the app bar (left side) with unread count badge
- **Top Drawer**: AlertsDrawer slides down from the top (different from other drawers)
- **Real-time Updates**: Shows number of unread alerts
- **Interactive Cards**: Click to mark as read, approve button for unread alerts
- **Time Stamps**: Relative time display (e.g., "30 minutes ago")
- **Icon Indicators**: Different icons for each alert type
- **Mark All as Read**: Bulk action for managing multiple alerts
- **Scrollable List**: Handles long lists of alerts gracefully

## Usage
1. Bell icon appears in the AppBar when user is logged in
2. Red badge shows unread alert count
3. Click bell to open AlertsDrawer
4. Click alert cards to mark as read
5. Use "אשר" (approve) button for unread alerts
6. "סמן הכל כנקרא" marks all alerts as read

## Styling
- Follows existing app theme with #E49A61 primary color
- RTL (right-to-left) layout support
- Hover effects and transitions consistent with app design
- Material-UI components with custom styling
- Responsive design for mobile and desktop

## Future Enhancements
- Connect to real backend API
- Push notifications
- Alert categories and filtering
- Sound notifications
- Persistent storage of read states
- Swipe gestures for top drawer interaction
