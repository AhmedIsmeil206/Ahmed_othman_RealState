# Rental Alerts Navigation - Quick Test Guide

## What Was Fixed

✅ **Problem**: When Master Admin clicked "View" on rental alerts, the back button took them to the Admin Rental Alerts page instead of Master Admin Rental Alerts page.

✅ **Solution**: Made the RentalAlerts component dynamically aware of which portal it's being used in (Admin vs Master Admin).

## Quick Test Steps

### Test 1: Master Admin Portal ✅

1. **Login as Master Admin**
   - Use master admin credentials (Super Admin role)

2. **Navigate to Rental Alerts**
   - Click "Rental Alerts" button from Master Admin Dashboard
   - URL should be: `/master-admin/rental-alerts`

3. **Click View on Any Alert**
   - Click the "👁️ View" button on any rental alert card
   - Studio details page should open
   - URL should be: `/studio/:id?source=master-admin-rental-alerts`

4. **Check Back Button**
   - Look at the back button at the top
   - It should say: **"← Back to Master Admin Rental Alerts"**
   - Click the back button
   - You should return to: `/master-admin/rental-alerts` ✅

### Test 2: Admin Portal ✅

1. **Login as Admin**
   - Use regular admin credentials (Admin role)

2. **Navigate to Rental Alerts**
   - Click "Rental Alerts" button from Admin Dashboard
   - URL should be: `/admin/rental-alerts`

3. **Click View on Any Alert**
   - Click the "👁️ View" button on any rental alert card
   - Studio details page should open
   - URL should be: `/studio/:id?source=admin-rental-alerts`

4. **Check Back Button**
   - Look at the back button at the top
   - It should say: **"← Back to Admin Rental Alerts"**
   - Click the back button
   - You should return to: `/admin/rental-alerts` ✅

## Expected Behavior Summary

### Before Fix ❌
```
Master Admin Rental Alerts
  → Click View
    → Studio Details
      → Click Back
        → Admin Rental Alerts (WRONG!)
```

### After Fix ✅
```
Master Admin Rental Alerts
  → Click View
    → Studio Details
      → Click Back
        → Master Admin Rental Alerts (CORRECT!)
```

## Files Changed

1. ✅ `src/components/admin/RentalAlerts/RentalAlerts.jsx`
   - Added `navigationSource` prop
   - Updated `handleStudioClick` to use dynamic source

2. ✅ `src/pages/masterAdmin/MasterAdminRentalAlertsPage/MasterAdminRentalAlertsPage.jsx`
   - Pass `navigationSource="master-admin-rental-alerts"`

3. ✅ `src/pages/admin/RentalAlertsPage/RentalAlertsPage.jsx`
   - Pass `navigationSource="admin-rental-alerts"`

## What to Look For

### ✅ Correct
- Master Admin sees "Master Admin Rental Alerts" in back button
- Admin sees "Admin Rental Alerts" in back button
- Back button returns to the correct page
- URL contains correct source parameter

### ❌ Incorrect
- Back button shows wrong portal name
- Back button goes to wrong page
- URL missing source parameter
- 404 error when navigating

## Troubleshooting

### Issue: Still redirecting to wrong page
**Solution**: Clear browser cache and reload the page
```bash
# In browser DevTools Console:
localStorage.clear()
# Then refresh the page
```

### Issue: Back button not showing
**Solution**: Check that URL has `source` parameter
```
Correct: /studio/123?source=master-admin-rental-alerts
Wrong:   /studio/123
```

### Issue: Cannot see rental alerts
**Solution**: Ensure you have active rental contracts
- Admin must have created apartments with studios
- Studios must have active rental contracts
- Contracts must be expiring within 60 days

## Additional Navigation Sources

The system supports these navigation sources:

| Source | Page | User Role |
|--------|------|-----------|
| `admin-dashboard` | Admin Dashboard | Admin |
| `admin-tracking` | Admin Tracking | Admin |
| `admin-rental-alerts` | Admin Rental Alerts | Admin |
| `master-admin-dashboard` | Master Admin Dashboard | Master Admin |
| `master-admin-rental-alerts` | Master Admin Rental Alerts | Master Admin |
| `customer-studios` | Customer Studios | Customer |

## Success Criteria

- [ ] Master Admin can view alerts and return to Master Admin page
- [ ] Admin can view alerts and return to Admin page
- [ ] No 404 errors during navigation
- [ ] Back button text matches the portal being used
- [ ] URL parameters are correct
- [ ] No console errors in browser DevTools

## Notes

- Backend API requires no changes
- Fix is entirely frontend-based
- Component is reusable across both portals
- Default navigation source is `'admin-rental-alerts'` for backward compatibility
