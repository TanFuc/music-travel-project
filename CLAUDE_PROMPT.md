# PROMPT FOR CLAUDECODE: IMPLEMENTING REFERRAL, COLLABORATOR, SUPPORT AI & AUDIT SYSTEM

You are an expert Senior Fullstack Engineer. Your task is to implement a comprehensive Referral, Collaborator (CTV), "Smart Support" system, and a COMPLETE Audit Logging system into the existing "Music Travel" project (NestJS Backend + Next.js Frontend).

Follow these instructions precisely. Do not miss any requirements. Ensure all backend APIs are fully implemented and the Frontend is responsive and aesthetically pleasing.

## 1. DATA MODEL UPDATES (`backend/prisma/schema.prisma`)

Modify the Prisma schema to support the new features.

### A. User Model
- Add `referralCode` (String, unique) to the `User` model.
- Add `isCollaborator` (Boolean, default false) or update `UserRole` enum to include `COLLABORATOR`.

### B. Collaborator Content
- Create `CollaboratorContent` model: `id`, `title`, `content` (Rich Text), `bannerUrl`, `benefits` (JSON), `updatedAt`, `updatedBy`.

### C. Ticket Updates
- Update `TicketStatus`: Add `SUSPENDED`.
- Update `Ticket`: Add `suspendedAt` (DateTime).

### D. Wallet & Transactions
- Update `WalletTransactionType`: Add `COMMISSION`, `WITHDRAWAL`.
- Create `WithdrawalRequest` model:
    - `id`, `userId`, `amount`, `bankName`, `accountNumber`, `accountHost`, `status` (PENDING, APPROVED, REJECTED), `adminNote`, `createdAt`, `updatedAt`.

### E. Voucher Updates
- Link `Voucher` to `ownerId` (User).

### F. Smart Support System
- Create `SupportQuestion`: `id`, `question`, `answer`, `category`, `displayOrder`, `isActive`.
- Use `ContactChannel` for Social Links.
- Create `Complaint`: `id`, `userId` (optional), `orderId` (optional), `content`, `status` (NEW, PROCESSING, RESOLVED), `adminReply`.

### G. Comprehensive Audit Log (CRITICAL)
- Enhance `AuditLog` model (or ensure it exists with these strict fields):
    - `id`, `action` (CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.), `entity` (User, Booking, Ticket, etc.), `entityId`, `actorId`, `oldValue` (JSON), `newValue` (JSON), `ipAddress`, `userAgent`, `createdAt`.
    - **Requirement:** EVERY mutation in the system must create an audit log.

---

## 2. BACKEND IMPLEMENTATION (`backend/src`)

### A. Audit System (**High Priority**)
- **Interceptor/Subscriber:** Implement a Global Interceptor or Prisma Middleware to automatically capture ALL database mutations.
- **Granularity:** Capture the *exact* changes (diff) between old and new values.
- **Categorization:** Ensure logs are categorized by Module (Auth, Order, Wallet, System) for filtering.

### B. Authentication & User
- **Referral:** Auto-generate via `AuthService.register`.

### C. Collaborator & Voucher
- **Module:** `modules/vouchers` & `modules/collaborator`.
- **Logic:**
    - CTV creates Voucher -> Validate `discountValue` <= 100k (Max Commission).
- **Commission Logic:**
    - **Trigger:** Order `PAID`.
    - **Calc:** `(100,000 * ItemQty) - DiscountGiven`.
    - **Payout:** Add to Wallet. Log as `COMMISSION`.

### D. Withdrawal System (`WalletService`)
- **API:** `POST /wallet/withdraw`
    - Input: Amount, Bank Info.
    - Logic: Check balance. Deduct balance (or hold). Create `WithdrawalRequest` (PENDING).
- **API:** `PUT /admin/wallet/withdraw/:id/approve` (or reject).
    - Approve: Mark `COMPLETED`. Notify User.
    - Reject: Refund money to Wallet. Mark `REJECTED`.

### E. Smart Support & Complaints
- **APIs:** Public Fetch FAQ, Private Submit Complaint.

---

## 3. FRONTEND IMPLEMENTATION (`frontend/src/app`)

### A. Collaborator Dashboard (Critical Detail)
- **Route:** `(main)/collaborator/dashboard`.
- **Commission Detail View:**
    - **Table Columns:** OrderID, Date, Customer Name (Masked), Ticket Qty, Total Commission (100k*Qty), Discount Given, **Net Earnings**, Payment Status (Pending/Paid), Commission Status (Locked/Available).
    - **Tooltips:** Explain exactly how Net Earnings was calculated.
    - **Filters:** Date Range, Status.
- **Withdrawal Section:**
    - Show "Available Balance".
    - "Request Withdrawal" Button -> Form (Bank Info).
    - History Table: Date, Amount, Status (Pending/Approved/Rejected), Admin Note.

### B. Admin Dashboard - Audit Logs
- **Page:** `admin/system/audit-logs`.
- **Advanced Filters:**
    - **Actor:** Search User/Admin.
    - **Action:** Create/Update/Delete.
    - **Entity:** Booking/User/Ticket/Voucher.
    - **Date Range.**
- **View:** Table showing summary. Click row -> Modal showing JSON Diff (Before vs After) beautifully formatted.

### C. Admin Dashboard - Support & Complaints
- Manage FAQs.
- View Complaints -> Reply -> E-mail User.

### D. Smart Support Widget
- Floating Button -> Tabs (FAQ / Contact-Complaint).

---

## 4. CRITICAL REQUIREMENTS

1.  **Zero Data Loss:** The Audit Log system is paramount. If an admin changes a setting, it MUST be logged. If a user updates profile, logged.
2.  **Financial Clarity:** The CTV Dashboard must be transparent. No hidden calculations. Show the Math: `(Base - Discount) = Profit`.
3.  **Withdrawal Flow:** Secure double-check on server side before approving withdrawals.
4.  **UI/UX:**
    - Use Red/Green colors for Financial +/-.
    - Badges for Statuses (Yellow=Pending, Green=Paid, Red=Rejected).

---

## 5. GENERATE PROMPT
Use this plan to generate the code.
