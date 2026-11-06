# Zhagaram Design Studio - Architecture Business Platform

An internal architectural estimation, SketchUp intake, and project management portal built exclusively for architects at **Zhagaram Design Studio**.

---

## 🏛️ Project Overview

- **Business Name:** Zhagaram Design Studio
- **Platform Scope:** Architect-side internal portal (not customer-facing self-service)
- **Tech Stack:** MERN Stack (MongoDB, Express.js, React 18 / Vite, Node.js, Tailwind CSS)
- **Live URLs:**
  - Frontend: [http://localhost:5173](http://localhost:5173)
  - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧭 Three Core Architectural Services

1. **Planning (Plan):**
   - Full technical flow: Plot total area, designated built-up area, orientation, side boundaries (X1–X4), setbacks (S1–S4), road widths (R1–R4), and diagonals (Z1–Z2).
   - **Dynamic Floor Generation:** Correctly displays all floors for chosen configuration (e.g. `Ground +2 Floor` shows Ground Floor, First Floor, and Second Floor).
   - **Room Area Exceeded Indicator:** Live alert indicator flags when planned room areas exceed the designated built-up area.
   - Mandatory rooms: Family Room, Gym, Yoga Room, Master & Guest Bedrooms, Staircase with **With OTS** (Open-To-Sky) option, and Terrace space.
2. **Elevation (3D Massing):**
   - Lightweight input: Only requires **Elevation Square Footage** and styling notes.
3. **Interior Design:**
   - Lightweight input: Only requires **Interior Square Footage** and design scope notes (no unnecessary room breakdown).

---

## ⚡ Single Unified Work Enquiry Workflow

- Replaces separate creation modal with a single, comprehensive workspace.
- **Customer Details:** Name (mandatory), Mobile No (mandatory), Email (**optional**), Project Name.
- **Three Service Checkboxes:** `[✓] Plan`, `[✓] Elevation`, `[✓] Interior`.
- **Common Price Calculator (Cart Total):**
  - Displays dynamic line items for each selected service based on their tiered sqft slabs.
  - Replaced the "Send Quote" button with a dedicated **WhatsApp Icon Button** to send formatted quotes directly to the customer.
  - One-click "Move to Ongoing Order", "Save Quote", and "Quote PDF".

---

## 💰 Multi-Service Tiered Pricing Slabs

Configurable in the **Packages** module:
- **Planning Slabs:** Tiered range of sqft (e.g., 0–500: ₹18, 500–700: ₹15, 700–900: ₹12, etc.).
- **Elevation Slabs:** Tiered range of sqft (e.g., 0–500: ₹28, 500–700: ₹25, 700–900: ₹22, etc.).
- **Interior Slabs:** Tiered range of sqft (e.g., 0–500: ₹45, 500–700: ₹40, 700–900: ₹35, etc.).
- **Interactive Multi-Service Simulator** for rapid fee estimations.

---

## 📄 PDF Generation Updates

- Handled by `pdfGenerator.js`.
- Generates clean, branded commercial and pricing breakdowns.
- Only includes Plan, Elevation, or Interior line items in the breakdown table if they were checked during enquiry creation.
- Site & spatial room program tables are only included when Planning is selected.

---

## 📊 Dashboard Cleanups

- **Eliminated** the "View Images" / "View" column from the SketchUp Enquiries list.
- **Eliminated** the "Email" column from the list view.
- Added service pills (`Plan`, `Elevation`, `Interior`) for instant clarity.
- Email input is explicitly marked as optional during enquiry creation.
