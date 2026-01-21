# Rental Alerts Navigation Fix

## Problem Description

When a Master Admin navigated to the Rental Alerts page and clicked the "View" button on a studio card, the user was redirected back to the **Admin Rental Alerts page** instead of the **Master Admin Rental Alerts page**.

### Root Cause

The `RentalAlerts` component was **hardcoding** the navigation source as `'admin-rental-alerts'` when redirecting to the studio details page, regardless of which portal (Admin or Master Admin) the user was viewing from.

```jsx
// OLD CODE - HARDCODED
const handleStudioClick = (contract) => {
  if (contract.apartment_part_id) {
    navigate(`/studio/${contract.apartment_part_id}?source=admin-rental-alerts`);  // ❌ Always admin
  }
};
```

## Solution Implemented

### 1. Added `navigationSource` Prop to RentalAlerts Component

**File**: `src/components/admin/RentalAlerts/RentalAlerts.jsx`

Added a new prop `navigationSource` with a default value to maintain backward compatibility:

```jsx
const RentalAlerts = ({ 
  adminId, 
  onContractDeleted, 
  showAllAdmins = false, 
  navigationSource = 'admin-rental-alerts'  // ✅ NEW PROP with default value
}) => {
```

### 2. Updated Navigation to Use Dynamic Source

**File**: `src/components/admin/RentalAlerts/RentalAlerts.jsx`

Modified the `handleStudioClick` function to use the `navigationSource` prop:

```jsx
// NEW CODE - DYNAMIC
const handleStudioClick = (contract) => {
  if (contract.apartment_part_id) {
    navigate(`/studio/${contract.apartment_part_id}?source=${navigationSource}`);  // ✅ Uses prop
  }
};
```

### 3. Updated Master Admin Portal Usage

**File**: `src/pages/masterAdmin/MasterAdminRentalAlertsPage/MasterAdminRentalAlertsPage.jsx`

Passed the correct navigation source when rendering the component:

```jsx
<RentalAlerts 
  showAllAdmins={true} 
  onContractDeleted={handleContractDeleted}
  navigationSource="master-admin-rental-alerts"  // ✅ Master Admin source
/>
```

### 4. Updated Admin Portal Usage

**File**: `src/pages/admin/RentalAlertsPage/RentalAlertsPage.jsx`

Explicitly passed the admin navigation source for clarity:

```jsx
<RentalAlerts 
  adminId={currentAdmin?.id}
  onContractDeleted={handleContractDeleted}
  navigationSource="admin-rental-alerts"  // ✅ Admin source
/>
```

## How It Works Now

### Navigation Flow

1. **Master Admin Portal**:
   ```
   Master Admin Rental Alerts Page
   → Click "View" on studio card
   → Studio Details Page (source=master-admin-rental-alerts)
   → Click "← Back to Master Admin Rental Alerts"
   → Returns to Master Admin Rental Alerts Page ✅
   ```

2. **Admin Portal**:
   ```
   Admin Rental Alerts Page
   → Click "View" on studio card
   → Studio Details Page (source=admin-rental-alerts)
   → Click "← Back to Admin Rental Alerts"
   → Returns to Admin Rental Alerts Page ✅
   ```

### URL Parameters

The navigation source is passed via URL query parameters:

- **Admin Portal**: `/studio/:id?source=admin-rental-alerts`
- **Master Admin Portal**: `/studio/:id?source=master-admin-rental-alerts`

### Back Button Logic

The `StudioDetailsPage` component already handles both sources correctly:

```jsx
// From StudioDetailsPage.jsx
const getBackLink = () => {
  if (navigationSource === 'admin-rental-alerts') {
    return '/admin/rental-alerts';
  } else if (navigationSource === 'master-admin-rental-alerts') {
    return '/master-admin/rental-alerts';
  }
  // ... other sources
};

const getBackText = () => {
  if (navigationSource === 'admin-rental-alerts') {
    return '← Back to Admin Rental Alerts';
  } else if (navigationSource === 'master-admin-rental-alerts') {
    return '← Back to Master Admin Rental Alerts';
  }
  // ... other sources
};
```

## Testing Checklist

### Master Admin Portal
- [ ] Login as Master Admin
- [ ] Navigate to Rental Alerts page
- [ ] Click "View" button on any rental alert card
- [ ] Verify you see studio details page
- [ ] Verify back button says "← Back to Master Admin Rental Alerts"
- [ ] Click back button
- [ ] Verify you return to Master Admin Rental Alerts page (not Admin page)

### Admin Portal
- [ ] Login as Admin
- [ ] Navigate to Rental Alerts page
- [ ] Click "View" button on any rental alert card
- [ ] Verify you see studio details page
- [ ] Verify back button says "← Back to Admin Rental Alerts"
- [ ] Click back button
- [ ] Verify you return to Admin Rental Alerts page

## Technical Details

### Component Props

**RentalAlerts Component**:
```typescript
interface RentalAlertsProps {
  adminId?: number;                    // Admin ID for filtering (optional)
  onContractDeleted?: () => void;      // Callback after contract deletion
  showAllAdmins?: boolean;             // Show all admins' contracts (Master Admin view)
  navigationSource?: string;           // NEW: Source for navigation tracking
}
```

### Valid Navigation Sources

The following navigation sources are recognized by the system:

1. `'admin-dashboard'` - Admin Dashboard
2. `'admin-tracking'` - Admin Tracking Page
3. `'admin-rental-alerts'` - Admin Rental Alerts Page ✅
4. `'master-admin-dashboard'` - Master Admin Dashboard
5. `'master-admin-rental-alerts'` - Master Admin Rental Alerts Page ✅
6. `'customer-studios'` - Customer Studios Listing

### Backend API Endpoints (No Changes Required)

The backend endpoints remain unchanged:

- **GET** `/api/v1/rental-contracts` - Get all rental contracts
- **GET** `/api/v1/rental-contracts?is_active=true` - Get active contracts
- **GET** `/api/v1/apartment-parts/:id` - Get studio details
- **DELETE** `/api/v1/rental-contracts/:id` - Delete contract

## Benefits

1. ✅ **Correct Navigation**: Users return to the page they came from
2. ✅ **Better UX**: No confusion about which portal you're in
3. ✅ **Maintainable**: Single reusable component for both portals
4. ✅ **Backward Compatible**: Default value prevents breaking existing code
5. ✅ **Scalable**: Easy to add new navigation sources in the future

## Files Modified

### Frontend Files
1. `src/components/admin/RentalAlerts/RentalAlerts.jsx` - Added navigationSource prop
2. `src/pages/masterAdmin/MasterAdminRentalAlertsPage/MasterAdminRentalAlertsPage.jsx` - Pass master admin source
3. `src/pages/admin/RentalAlertsPage/RentalAlertsPage.jsx` - Pass admin source

### Backend Files
No backend changes required - navigation is handled entirely on the frontend.

## Future Enhancements

Consider these improvements for future iterations:

1. **Type Safety**: Add TypeScript types for navigation sources
2. **Route Constants**: Extract navigation sources to a constants file
3. **Navigation Context**: Use React Context to track navigation history
4. **Breadcrumbs**: Add breadcrumb navigation for complex flows
5. **URL State Management**: Use URL state for better deep linking

## Conclusion

The navigation issue has been resolved by making the `RentalAlerts` component aware of its usage context through the `navigationSource` prop. This ensures users are always returned to the correct page after viewing studio details from rental alerts.
