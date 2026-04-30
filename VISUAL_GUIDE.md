# 🔔 Header Notification System - VISUAL GUIDE

## Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ☰  ┌──────────────────┐              🔔  👤  Employee ▼       │
│ Menu │  Search Box    │              5   (Badge)               │
│      └──────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                      ↑
                          Bell Icon with Unread Count
                          (Only shows if count > 0)
```

---

## Bell Icon States

### State 1: No Unread Announcements
```
🔔
(Simple bell, no badge)
```

### State 2: With Unread Count
```
🔔
 3  ← Red badge
```

### State 3: With High Count
```
🔔
 99  ← Red badge
```

---

## Code Implementation Map

```
AppHeader.js
│
├─ Import announcementHelper
│  └─ getUnreadAnnouncementCount()
│
├─ State: announcementCount = 0
│
├─ useEffect() on location change
│  ├─ Call fetchAnnouncementCount()
│  └─ Setup interval (every 30 seconds)
│
├─ fetchAnnouncementCount()
│  ├─ Call API helper
│  ├─ Update state
│  └─ Handle errors
│
└─ Render
   └─ Bell Icon
      ├─ Click → Navigate to /announcement
      └─ Badge
         └─ Show count if > 0
```

---

## Data Flow

```
┌──────────────┐
│ User Opens   │
│  Dashboard   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│ AppHeader Component     │
│ Initializes            │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ useEffect - Location Changed     │
│ 1. fetchAnnouncementCount()      │
│ 2. Setup 30s interval            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ fetchAnnouncementCount()         │
│ Calls getUnreadAnnouncementCount()
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Helper Function                  │
│ announcementHelper.js             │
│ - Get staff ID from cookie       │
│ - Build API URL                  │
│ - Call BasicProvider.getRequest()│
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Axios (via BasicProvider)         │
│ GET /api/announcements/          │
│     unread-count/{staffId}        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Backend API Response             │
│ { "count": 5, "total": 10 }      │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ State Update                     │
│ setAnnouncementCount(5)          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ React Re-render                  │
│ Header Component                 │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Display Bell Icon with Badge     │
│ 🔔 Badge: "5"                    │
└──────────────────────────────────┘
       │
       │ (Wait 30 seconds)
       │
       ▼
       ↩️  (Repeat from getUnreadAnnouncementCount)
```

---

## File Modification Summary

### AppHeader.js Changes

```diff
Line 1-30: IMPORTS
+ import { getUnreadAnnouncementCount } from 'src/helpers/announcementHelper'

Line 205-215: useEffect()
  useEffect(() => {
    fetchData2()
+   fetchAnnouncementCount()
+   const interval = setInterval(fetchAnnouncementCount, 30000)
+   return () => clearInterval(interval)
  }, [location])

Line 248-256: fetchAnnouncementCount()
  const fetchAnnouncementCount = async () => {
    try {
+     const count = await getUnreadAnnouncementCount()
+     setAnnouncementCount(count)
    } catch (error) {
+     setAnnouncementCount(0)
    }
  }

Line 413-421: Render
  {announcementCount > 0 && (
    <CBadge color="danger" position="top-end" shape="rounded-pill">
      {announcementCount}
    </CBadge>
  )}
```

---

## Timeline: What Happens When

```
T=0s     → User opens page
         → fetchAnnouncementCount() called
         → API request sent
         → Interval timer started

T=0.1s   → API response received
         → Count: 5
         → State updated
         → Bell shows "5"

T=30s    → Interval fires
         → fetchAnnouncementCount() called again
         → Count: 5 (no change)
         → Bell still shows "5"

T=60s    → User marks 1 announcement as read
         → Count drops in database
         → Interval fires
         → fetchAnnouncementCount() called
         → Count: 4
         → Bell updates to "4" ✨

T=90s    → User marks another as read
         → Count: 3 in database
         → Interval fires
         → Bell updates to "3"

T=120s   → Last one marked read
         → Count: 0 in database
         → Interval fires
         → Bell hides (no badge shown)
```

---

## Component Props & State

```
AppHeader Component
│
├─ Props
│  ├─ employeeDatas: Object
│  └─ formData: Object
│
├─ State Variables
│  ├─ announcementCount: number (0-999)
│  ├─ loading: boolean
│  ├─ error: string | null
│  └─ Other states (concerns, etc)
│
├─ Effects
│  ├─ useEffect(fetchData)
│  ├─ useEffect(fetchData2)
│  └─ useEffect(fetchAnnouncementCount + interval)
│
├─ Functions
│  ├─ fetchAnnouncementCount()
│  ├─ handleSearch()
│  ├─ handlePunchIn()
│  └─ Others...
│
└─ Render
   ├─ Header
   │  ├─ Menu toggler
   │  ├─ Search box
   │  ├─ CONCERN button
   │  ├─ ADD FORCE PIN button
   │  ├─ 🔔 BELL ICON ← HERE
   │  ├─ Role display
   │  └─ Profile dropdown
   └─ Modals
      ├─ PunchInModal
      ├─ ForcePinModal
      └─ ViewQuickLinks
```

---

## Browser Console Debugging

### To Check If Working:

1. **Open Browser Console** (F12)

2. **Check if API is called:**
   ```
   Look for: Network tab
   Filter: "unread-count"
   Should see: GET request to backend
   Status: 200 OK
   Response: { "count": X }
   ```

3. **Check React State:**
   ```javascript
   // In console, if using Redux:
   store.getState().announcementCount
   // Should show: number (0, 1, 2, 3, etc)
   ```

4. **Check Interval:**
   ```javascript
   // Verify interval is running
   setInterval logs appear every 30 seconds
   ```

---

## Error Scenarios

### Scenario 1: API Fails
```
API call fails (status 500)
    ↓
catch block triggered
    ↓
setAnnouncementCount(0)
    ↓
Bell shows no badge (0 treated as invisible)
    ↓
No error shown to user (graceful)
    ↓
Next 30s: Try again
```

### Scenario 2: No Staff ID
```
Cookie not found
    ↓
getUnreadAnnouncementCount() returns 0
    ↓
setAnnouncementCount(0)
    ↓
Bell shows no badge
```

### Scenario 3: Network Down
```
No internet connection
    ↓
API call fails (network error)
    ↓
catch block triggered
    ↓
setAnnouncementCount(0)
    ↓
localStorage fallback? (Optional future feature)
```

---

## Best Practices Implemented

✅ **Error Handling**: Try-catch wraps all async operations
✅ **Cleanup**: Interval cleared on unmount
✅ **Performance**: 30-second refresh (not too frequent)
✅ **Responsive**: Works on all screen sizes
✅ **Accessibility**: Proper ARIA labels (CoreUI components)
✅ **Security**: Staff ID from secure cookies

---

## Future Enhancements

```
Optional improvements:
├─ Click bell → Show dropdown with latest announcements
├─ Sound notification when new announcement arrives
├─ Badge animation on count change
├─ Mark as read directly from notification
├─ Configurable refresh interval
├─ localStorage cache for offline support
└─ WebSocket for real-time updates
```

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Badge not showing | Check if count > 0 |
| Count not updating | Verify API endpoint exists |
| Count always 0 | Check staff_id in cookie |
| High memory usage | Verify interval is cleaned up |
| Slow performance | Check API response time |
| API 401 error | Check authentication token |
| API 404 error | Backend endpoint not created |

---

## Testing Checklist

```
Manual Testing:
□ Open app → Bell visible
□ Count shows (if > 0)
□ Click bell → Navigate to /announcement
□ Wait 30s → Count updates automatically
□ Mark announcement as read
□ Wait 30s → Count decreases
□ Close & reopen app → Count persists
□ Mobile view → Bell visible and clickable

Automated Testing (Future):
□ Unit test for getUnreadAnnouncementCount()
□ Integration test for AppHeader with API
□ E2E test for complete notification flow
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AppHeader Component                                  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                         │ │
│  │  useEffect(() => {                                    │ │
│  │    fetchAnnouncementCount()                           │ │
│  │    setInterval(fetchAnnouncementCount, 30000)         │ │
│  │  })                                                    │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ fetchAnnouncementCount()                        │  │ │
│  │  │ ↓                                               │  │ │
│  │  │ getUnreadAnnouncementCount()                    │  │ │
│  │  │ ↓                                               │  │ │
│  │  │ BasicProvider.getRequest()                      │  │ │
│  │  │ ↓                                               │  │ │
│  │  │ setAnnouncementCount(count)                     │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ Render JSX                                      │  │ │
│  │  │ ┌─────────────────────────────────────────────┐ │  │ │
│  │  │ │ 🔔 Bell Icon                               │ │  │ │
│  │  │ │ {announcementCount > 0 && <Badge />}       │ │  │ │
│  │  │ └─────────────────────────────────────────────┘ │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Helper: announcementHelper.js                         │ │
│  │  • getUnreadAnnouncementCount()                        │ │
│  │  • markAnnouncementAsRead()                           │ │
│  │  • getUnreadAnnouncements()                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  BasicProvider (Axios Wrapper)                         │ │
│  │  • API calls                                           │ │
│  │  • Error handling                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  Backend APIs (Node.js/Express)       │
        │  GET /api/announcements/               │
        │      unread-count/{staffId}            │
        │                                        │
        │  Returns: { count: 5 }                │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  Database (MongoDB/PostgreSQL)         │
        │  • announcements collection            │
        │  • announcement_reads collection       │
        │  • Track viewed_at by staff            │
        └───────────────────────────────────────┘
```

---

## Summary

✨ **Complete notification system** in header with:
- Auto-updating unread count
- 30-second refresh cycle
- Error handling
- Mobile responsive

👉 **Next**: Backend needs to implement the APIs!
