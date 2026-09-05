# KHM Vendor Platform - Architecture Walkthrough

This document tracks the technical flow and changes made to the Vendor Platform.

## 1. Multi-Service Architecture
- **Property Model (`models/Property.js`)**: Holds physical property details, location (GeoJSON), and images.
- **Service Model (`models/Service.js`)**: Holds independent business offerings (PG, Hostel, Mess, Library) linked to a `property_id`.
- **Vendor Dashboard UI (`app/vendor/dashboard/page.tsx`)**: Rebuilt to handle multiple services. Vendors can add multiple dynamic categories to a single property using an inline editor.
- **Unified Save API (`app/api/vendor/property/route.js`)**: Uses a single `PATCH` request to safely synchronize an array of services. It compares existing services in the database with the incoming array to update, create, or securely delete (if removed by the vendor) services.

## 2. Cloudinary Image Pipeline (Sprint 9)
- **Frontend Compression**: `browser-image-compression` ensures files are compressed and converted to `.webp` (< 500KB) *before* hitting our server.
- **5MB Pre-compression Limit**: Enforced to prevent memory abuse on the Vercel edge/serverless functions.
- **Cloudinary Upload API (`app/api/vendor/upload/route.js`)**: Accepts the compressed image via `upload_stream` and strictly validates MIME types (`image/*`). Automatically uploads to a subfolder specific to the vendor: `khm_properties/VENDOR_ID/`.
- **Orphan Image Deletion**: A `DELETE` method automatically clears images from Cloudinary if a vendor removes an image from their dashboard gallery before saving.

## 3. Security & Safeguards
- **Zero PII**: Vendor's personal phone numbers and KYC details are never sent to the client-side public pages.
- **Authorization**: All CRUD operations on property or services enforce that `property.vendor_id` strictly matches the currently authenticated vendor's session.
- **Duplicate Prevention**: The property backend explicitly rejects saving two services of the identical category (e.g., two "PG" instances) on the same property.

*(This file will be updated as the vendor portal evolves further.)*
