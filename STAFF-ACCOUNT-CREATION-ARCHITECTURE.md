# Staff Account Creation - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           StaffManager Component                      │   │
│  │                                                        │   │
│  │  ┌──────────────┐    ┌─────────────────────┐         │   │
│  │  │ Create       │    │ Add Existing        │         │   │
│  │  │ Account      │    │ User                │         │   │
│  │  └──────┬───────┘    └────────┬────────────┘         │   │
│  │         │                     │                       │   │
│  │         ▼                     ▼                       │   │
│  │  ┌──────────────┐    ┌─────────────────────┐         │   │
│  │  │ Form Dialog  │    │ Form Dialog         │         │   │
│  │  │ - Email      │    │ - Email             │         │   │
│  │  │ - Name       │    │ - Name              │         │   │
│  │  │ - Role       │    │ - Role              │         │   │
│  │  │ - Password   │    └────────┬────────────┘         │   │
│  │  └──────┬───────┘             │                       │   │
│  └─────────┼─────────────────────┼───────────────────────┘   │
│            │                     │                           │
└────────────┼─────────────────────┼───────────────────────────┘
             │                     │
             ▼                     ▼
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                          │
│                                                              │
│  RPC Call: create_staff_user()                              │
│  Parameters:                                                │
│  - p_restaurant_id (UUID)                                   │
│  - p_email (TEXT)                                           │
│  - p_password (TEXT)                                        │
│  - p_display_name (TEXT, optional)                          │
│  - p_role (TEXT: 'admin' or 'staff')                        │
│                                                              │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  create_staff_user() Function                        │  │
│  │  (SECURITY DEFINER)                                  │  │
│  │                                                       │  │
│  │  1. Validate Inputs                                  │  │
│  │     ├─ Email format                                  │  │
│  │     ├─ Password strength                             │  │
│  │     └─ Role validation                               │  │
│  │                                                       │  │
│  │  2. Check Admin Permissions                          │  │
│  │     └─ Verify caller is admin of restaurant          │  │
│  │                                                       │  │
│  │  3. Rate Limiting                                    │  │
│  │     └─ Max 10 creations/hour/restaurant              │  │
│  │                                                       │  │
│  │  4. Check Existing User                              │  │
│  │     ├─ If exists → Add to restaurant_staff           │  │
│  │     └─ If new → Create user + Add to staff           │  │
│  │                                                       │  │
│  │  5. Create User (if new)                             │  │
│  │     └─ INSERT into auth.users                        │  │
│  │        ├─ Hash password (bcrypt)                     │  │
│  │        ├─ Set email_confirmed_at                     │  │
│  │        └─ Store metadata                             │  │
│  │                                                       │  │
│  │  6. Link to Restaurant                               │  │
│  │     └─ INSERT into restaurant_staff                  │  │
│  │        ├─ user_id                                    │  │
│  │        ├─ restaurant_id                              │  │  │
│  │        ├─ role                                       │  │  │
│  │        ├─ email                                      │  │  │
│  │        └─ display_name                               │  │  │
│  │                                                       │  │
│  │  Returns: { success, user_id, error_message }        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │  auth.users      │    │  restaurant_staff            │  │
│  │  ───────────     │    │  ──────────────────          │  │
│  │  • id (UUID)     │◄───│  • user_id (FK)              │  │
│  │  • email         │    │  • restaurant_id (FK)        │  │
│  │  • encrypted_pw  │    │  • role                      │  │
│  │  • created_at    │    │  • email                     │  │
│  │  • metadata      │    │  • display_name              │  │
│  └──────────────────┘    │  • created_at                │  │
│                          └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   RESPONSE FLOW                             │
│                                                              │
│  Success:                                                   │
│  ├─ Display credentials (alert + console)                   │
│  ├─ Show success toast                                      │
│  ├─ Refresh staff list                                      │
│  └─ Close dialog                                            │
│                                                              │
│  Error:                                                     │
│  ├─ Show error message                                      │
│  └─ Keep dialog open for correction                         │
└────────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Authenticated?      │──── No ──► Reject (401)
└──────┬──────────────┘
       │ Yes
       ▼
┌─────────────────────┐
│ Is Admin of         │──── No ──► Reject (403)
│ This Restaurant?    │
└──────┬──────────────┘
       │ Yes
       ▼
┌─────────────────────┐
│ Rate Limit Check    │──── Exceeded ──► Reject (429)
└──────┬──────────────┘
       │ OK
       ▼
┌─────────────────────┐
│ Input Validation    │──── Invalid ──► Return Error
└──────┬──────────────┘
       │ Valid
       ▼
┌─────────────────────┐
│ Check Existing User │
└──┬──────────────┬───┘
   │              │
   │ New          │ Exists
   ▼              ▼
┌──────┐    ┌────────────────┐
│Create│    │Add to Restaurant│
│ User │    └───────┬────────┘
└──┬───┘            │
   │                │
   └────────┬───────┘
            │
            ▼
   ┌────────────────┐
   │ Return Success │
   └────────────────┘
```

## Data Flow Diagram

```
Admin Input
    │
    ├── Email ──────────────────────────┐
    ├── Display Name ───────────────────┤
    ├── Role ───────────────────────────┤
    └── Password ───────────────────────┤
                                        │
                                        ▼
                            ┌─────────────────────┐
                            │  Frontend Validation │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  RPC Call to DB      │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  DB Function         │
                            │  Execution           │
                            └──┬──────────────┬───┘
                               │              │
                               │              │
                    ┌──────────▼───┐  ┌──────▼────────┐
                    │ auth.users   │  │restaurant_staff│
                    │ (INSERT)     │  │ (INSERT)       │
                    └──────────────┘  └───────────────┘
                               │              │
                               └──────┬───────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │  Return Result       │
                            └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  Display Credentials│
                            └─────────────────────┘
```

## Component Hierarchy

```
AdminDashboard
│
├── AdminSidebar
│
├── AdminHeader
│
└── Tab Content (Staff)
    │
    └── StaffManager
        │
        ├── Staff List
        │   └── StaffMember Card (multiple)
        │       ├── Display Info
        │       ├── Role Badge
        │       ├── Edit Button
        │       └── Remove Button
        │
        ├── Create Account Dialog
        │   ├── Email Input
        │   ├── Display Name Input
        │   ├── Role Selector
        │   ├── Auto-Generate Checkbox
        │   ├── Password Input (conditional)
        │   └── Create/Cancel Buttons
        │
        └── Add Existing User Dialog
            ├── Email Input
            ├── Display Name Input
            ├── Role Selector
            └── Add/Cancel Buttons
```

## State Management

```
StaffManager Component State
│
├── staff: StaffMember[]
├── loading: boolean
├── currentUserRole: 'admin' | 'staff' | null
│
├── Add Existing User Dialog
│   ├── showAddDialog: boolean
│   ├── newStaffEmail: string
│   ├── newStaffDisplayName: string
│   └── newStaffRole: 'admin' | 'staff'
│
├── Create Account Dialog
│   ├── showCreateAccountDialog: boolean
│   ├── createAccountEmail: string
│   ├── createAccountDisplayName: string
│   ├── createAccountRole: 'admin' | 'staff'
│   ├── createAccountPassword: string
│   └── autoGeneratePassword: boolean
│
├── Edit Dialog
│   ├── editingStaffId: string | null
│   ├── editDisplayName: string
│   └── editRole: 'admin' | 'staff'
│
└── Delete Confirmation
    └── removingStaffId: string | null
```

## Error Handling Flow

```
User Action
    │
    ▼
Frontend Validation
    │
    ├── Pass ──► RPC Call
    │               │
    │               ├── Success ──► Show Credentials
    │               │
    │               └── Error ──► Show Error Message
    │
    └── Fail ──► Show Validation Error
                 │
                 ├── Invalid Email Format
                 ├── Password Too Short
                 ├── Password Too Weak
                 └── Missing Required Field

Database Errors Handled:
├── Duplicate entry
├── Rate limit exceeded
├── Permission denied
├── Invalid role
└── User already exists
```

## Timeline Sequence

```
T0: Admin clicks "Create Account"
    │
    ▼
T1: Dialog opens with form
    │
    ▼
T2: Admin fills form
    │
    ├── Email: john@restaurant.com
    ├── Name: John Doe
    ├── Role: Staff
    └── Password: [Auto-generated]
    │
    ▼
T3: Admin clicks "Create Account"
    │
    ▼
T4: Frontend validates inputs
    │
    ▼
T5: RPC call to database
    │
    ▼
T6: Database function executes
    │
    ├── Validate admin permissions (~5ms)
    ├── Check rate limit (~5ms)
    ├── Check existing user (~10ms)
    ├── Create auth.user (~20ms)
    └── Insert restaurant_staff (~10ms)
    │
    ▼
T7: Response received (~50ms total)
    │
    ├── Success: Show credentials
    └── Error: Show error message
    │
    ▼
T8: Staff list refreshes
    │
    ▼
T9: New staff member visible
```

## Performance Characteristics

```
Operation                  | Time    | Impact
---------------------------|---------|--------
Form validation            | <1ms    | None
RPC call overhead          | ~10ms   | Low
Permission check           | ~5ms    | Low
Rate limit check           | ~5ms    | Low
User lookup                | ~10ms   | Low
User creation (bcrypt)     | ~20ms   | Medium
Staff link creation        | ~10ms   | Low
Total (new user)           | ~60ms   | Low
Total (existing user)      | ~30ms   | Low
```

## Scalability Considerations

```
Current Limits:
├── Rate limit: 10 accounts/hour/restaurant
├── Password length: 8+ characters
└── Email uniqueness: Global (auth.users)

Scaling Factors:
├── Function execution: O(1) - constant time
├── Rate limit query: O(n) - indexed by created_at
├── User lookup: O(1) - indexed by email
└── Staff insertion: O(1) - single insert

Bottlenecks:
├── bcrypt hashing (~20ms per user)
├── Rate limit count query
└── Network latency (RPC call)

Optimization Opportunities:
├── Cache rate limit counts (Redis)
├── Batch operations for bulk import
└── Async email notifications
```
