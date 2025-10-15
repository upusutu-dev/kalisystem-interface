# TagCreator - Smart Order Management

## Overview
TagCreator is a frontend-only React application designed for efficient order management. It provides a modern interface for handling items, categories, suppliers, and creating orders rapidly. The project aims to streamline order processing with features like quick order creation, item browsing, bulk ordering, and supplier management, all while persisting data locally and offering a responsive user experience with dark mode support.

## User Preferences
I prefer iterative development with clear explanations for any significant changes. Please ask before making major architectural decisions or refactoring large portions of the codebase. I value clean, readable code and prefer functional components in React. Do not make changes to files related to deployment configurations without explicit instruction.

## System Architecture
The application is a frontend-only React 18 application built with Vite and TypeScript. It leverages `shadcn-ui` components built on Radix UI primitives for a modern and accessible UI, styled with Tailwind CSS for custom theming and responsive design. `React Router v6` handles client-side routing, and state management is achieved using React Context API combined with TanStack Query for data fetching and caching. Data persistence is handled via browser `localStorage`.

**Key Features:**
- **Order Management:** Quick order creation with natural language parsing (item name and quantity), bulk ordering, and a detailed order workflow with status tracking (Hold, Pending, Processing, Received, Paid, Completed).
- **Item & Category Management:** Comprehensive item browsing, filtering, and management, including variant tags (Quantity, Supplier, Brand, Khmer Name) with distinct visual indicators. Categories can be grouped and filtered, with quick item creation functionalities.
- **Supplier Management:** Functionality to manage suppliers and associate them with items.
- **Data Persistence:** Uses `localStorage` to store application data, with default data loaded from `public/default-data.json`.
- **UI/UX:** Dark mode support, mobile-responsive design with bottom navigation, and a focus on intuitive interfaces for efficient workflows. Gradient backgrounds are used for category tags, and various components like `QuantityInput`, `Checkbox`, and `Switch` enhance user interaction.
- **Validation:** Zod is used for data validation.

**Technical Implementations & Design Choices:**
- **Variant Tag System:** Items can have multiple variant tags (Quantity, Supplier, Brand, Khmer Name), each with a distinct color for visual identification. These are item-specific and displayed as colored badges.
- **Order Workflow Enhancements:** A detailed multi-stage order processing workflow (Hold, Pending, Processing, Received, Paid, Completed) with conditional button states and status badges.
- **Category Grouping & Filtering:** Items can be grouped by category with collapsible cards. Filter buttons allow toggling predefined category groups (Food, Beverages, Households).
- **Order Tagging:** Orders can be tagged with metadata like Order Type, Store, Payment Method, and Manager, which influence the order summary template.
- **Fuzzy Matching & Parsing:** Enhanced parsing logic (e.g., "Potato 2 kg") and Levenshtein distance for fuzzy matching improve quick order creation.

## External Dependencies
- **Vite:** Build tool.
- **React:** Frontend library.
- **TypeScript:** Type-checking.
- **React Router DOM:** Client-side routing.
- **TanStack React Query:** Data fetching, caching, and state management.
- **shadcn-ui:** UI component library (built on Radix UI).
- **Tailwind CSS:** Styling framework.
- **Lucide React:** Icon library.
- **Zod:** Schema validation library.

## Recent Changes

### Oct 14, 2025 - Navigation & Manager Interface Enhancements
- **Burger Menu Navigation**:
  - Replaced bottom navigation bar with burger menu modal in top-left corner
  - Cleaner interface with more screen space for content
  - Menu provides access to all main pages (Home, Order, Dispatch, Items, Tags)

- **Store Selection Workflow**:
  - Added store selection prompts when adding items from Items page
  - Dispatch approval now requires store selection before creating pending orders
  - All pending orders created with proper store tags for organization
  - Store tabs on Order page provide clear organization by location

- **Manager Interface Updates**:
  - Changed Manager View from read-only to fully editable
  - Added checkboxes for marking orders as "Received" and "Paid"
  - Added amount input field for setting order totals
  - Integrated full invoice attachment system (URL, Upload, Camera)
  - Managers can now confirm items, set amounts, and attach invoices directly
  - All changes sync with main order system through updatePendingOrder

- **Order History Table**:
  - Added order history table to homepage showing recent completed orders
  - Displays date, store tags, and item count for each order
  - Shows last 5 orders with "View All" button to see complete history
  - Clicking any row navigates to completed orders tab for details
  - Clean table UI with Calendar icons and store tag badges

- **Camera Quality Improvement**:
  - Increased invoice photo quality from 0.8 to 0.95 compression
  - Higher quality images for better invoice readability
  - Base64 storage maintains quality across sessions

### Oct 13, 2025 - UI & Functionality Improvements
- **Dispatch Card Sizing Fix**:
  - Supplier cards now adapt dynamically to item count
  - Added ScrollArea for cards with more than 5 items (max height 300px)
  - Cards with fewer items display without scrolling
  - Better space efficiency and improved visibility for large item lists

- **Add Item Modal Enhancement**:
  - Added "Create New Item" button when search returns no results
  - Button appears with typed search query as the new item name
  - Automatically creates items in "New Item" category with correct supplier
  - Integrated with both Dispatch and Order pages

- **Camera Capture Fix**:
  - Fixed "about:blank" issue when capturing invoice photos
  - Added video.play() call to ensure camera preview displays correctly
  - Added validation to check video is ready before capturing (width/height > 0)
  - Improved error messages for camera capture failures
  - Photos now properly captured as base64 and stored in localStorage

- **Tags Count Display**:
  - Fixed inconsistent tag count display on Home and Settings pages
  - Both pages now consistently show count of unique tags (tags.length)
  - Removed confusing totalTagCount that counted tag instances across items

- **Item Variant Tags Implementation**:
  - Added three new tag categories in Tags page:
    - **Item Brands** (🏷️) - Amber color (bg-amber-500) - for tracking product brands
    - **Item Sizes** (📏) - Emerald color (bg-emerald-500) - for size variants
    - **Item Quantities** (🔢) - Blue color (bg-blue-500) - for quantity variants
  - Each category displays tag count in badge
  - Dialog shows helpful description when adding variant tags
  - Variant tags are item-specific and can be applied to track different product variants

- **Supplier Type Tags Removal**:
  - Removed "Supplier Type" category from Tags interface
  - Removed supplier type field from supplier form
  - Simplified supplier management by removing unused type classification

- **Current Order Tab Redesign**:
  - Restructured current order tab to match pending orders design
  - Order metadata shown in a dedicated card at the top (Order Type, Store, Payment, Manager)
  - Each supplier displayed in its own card with supplier name header
  - Items listed clearly with quantity controls and remove buttons
  - Cleaner, more consistent interface across all order tabs

- **Base64 Invoice Display Fix**:
  - Fixed issue with camera-captured invoices (base64 format) not displaying correctly
  - Base64 images now open in new window with proper HTML rendering
  - Regular URL invoices continue to work as before
  - Applied fix to both Orders page and Manager View page

### Oct 13, 2025 - Enhanced Order Workflow & Manager Sharing System
- **Simplified Order Completion Flow**:
  - Orders can now be marked as completed immediately after being received
  - Removed requirement for amount, payment, and invoice before completion
  - More flexible workflow for faster order processing

- **Completed Orders Enhancement**:
  - Added "Set amount" button to completed orders for retroactive payment tracking
  - Added "Attach invoice" button to completed orders for post-completion documentation
  - Full editing capability even after order completion

- **Enhanced Invoice Attachment System**:
  - Tabbed interface with three input methods:
    - **URL Tab**: Paste invoice links (existing functionality)
    - **Upload Tab**: File picker for images and PDFs with preview
    - **Camera Tab**: Access device camera to capture invoice photos
  - All files converted to base64 and stored in localStorage
  - Image previews for uploaded and captured invoices
  - Retake functionality for camera captures

- **Manager Sharing System**:
  - New "Share with Manager" button in Orders page header
  - Store selection dialog for generating filtered access links
  - Shareable URLs with store-specific filtering (`/manager-view?store=<store>`)
  - Read-only Manager View page showing only Processing and Completed tabs
  - Manager view automatically filters orders by selected store
  - No edit capabilities in manager view for data integrity

### Oct 7, 2025 - Supplier Card Actions & Add Item Modal
- **Supplier Card Actions**:
  - Moved all actions (Add to Order, Add Item, Save, Delete) into burger menu (three-dot icon)
  - Cleaner card interface with more space for content
  - All actions accessible from dropdown menu

- **Add Item Modal**:
  - New modal for adding items to supplier cards
  - Search box at top to filter items by name, category, or tags
  - Displays only items from the selected supplier
  - Click any item to add it to the card with quantity of 1
  - Responsive scrollable list for large item catalogs

- **New Card Actions**:
  - "Add to Order": Moves all card items to current order and removes card
  - "Add Item": Opens modal to select items from supplier's catalog
  - "Save": Saves card as pending order (existing functionality)
  - "Delete": Removes the card (existing functionality)

### Oct 7, 2025 - Enhanced Tag Management & Dispatch Page Updates
- **Tag Type Updates**:
  - Added optional `category` field to Tag type
  - Tags can now be organized by category for better organization

- **Home Page Tag Creation**:
  - New tag form now includes category selector
  - Shows existing categories + option to create new category inline
  - Category field is optional but recommended (shown with muted label)
  - Seamless category creation without leaving tag dialog

- **Home Page Layout**:
  - Tags and Orders Completed cards now in 2-column grid layout
  - Cards match the size of Items/Categories/Suppliers cards for consistency
  - Orders Completed card includes + icon to create new order (links to Dispatch)
  - Improved visual hierarchy and space efficiency

- **Dispatch Page (formerly Bulk)**:
  - Renamed "Bulk" to "Dispatch" throughout the app (navigation, page title)
  - Route remains `/bulk` for URL consistency
  - Removed placeholder text from textarea for cleaner interface
  - Changed "Show More" button to expand/collapse icon
  - Auto-clean and auto-check functionality on paste
  - Removed manual "Clean Text" and "Check" buttons (automatic now)

- **Staff Food Detection**:
  - Automatic detection of "Staff food" or "food for staff" sections in pasted lists
  - Items with Khmer characters (Unicode \u1780-\u17FF) are automatically:
    - Assigned to "Staff Food" category
    - Assigned to "Pisey" supplier
  - Enhanced toast notifications showing staff food item count
  - Seamless integration with existing parsing and matching logic