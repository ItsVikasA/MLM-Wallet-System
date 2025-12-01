# Implementation Plan

- [x] 1. Set up Next.js project and core structure



  - Initialize Next.js 14+ project with TypeScript and App Router
  - Install dependencies: MongoDB, Mongoose, Tailwind CSS, shadcn/ui, NextAuth.js, Zod, bcrypt
  - Set up directory structure: app/, components/, lib/, models/, services/, types/
  - Configure Tailwind CSS and shadcn/ui components
  - Set up MongoDB connection with Mongoose
  - Configure environment variables (.env.local)
  - Install testing frameworks (Jest, fast-check, React Testing Library)
  - Define core TypeScript interfaces for Member, Wallet, Transaction, TreeNode, Package
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_


- [x] 2. Implement Mongoose models with validation




  - [x] 2.1 Create Member Mongoose schema


    - Define Member schema with fields: username, passwordHash, sponsorId, status, activePackageId, registrationDate
    - Add unique index on username
    - Add validation for required fields


    - _Requirements: 1.1, 1.5_
  
  - [x] 2.2 Create Wallet Mongoose schema


    - Define Wallet schema with fields: memberId, type (enum: 'main', 'commission'), balance, lastUpdated


    - Add validation to ensure balance is non-negative
    - Add compound index on memberId and type
    - _Requirements: 1.4, 2.1, 2.4_
  


  - [x] 2.3 Create Transaction Mongoose schema


    - Define Transaction schema with all required fields
    - Add validation for transaction amounts (positive) and types (enum)
    - Add indexes on memberId and timestamp
    - _Requirements: 2.2, 6.1, 6.2_
  
  - [x] 2.4 Create TreeNode Mongoose schema


    - Define TreeNode schema with member relationships and leg volumes
    - Add validation for tree structure integrity
    - Add index on memberId and sponsorId
    - _Requirements: 4.1, 4.2, 5.2_
  
  - [x] 2.5 Create Package Mongoose schema





    - Define Package schema with name, price, commissionRate, description, isActive
    - Add validation for price and commissionRate (positive numbers)
    - _Requirements: 3.1, 3.2_

- [x] 3. Implement service layer with business logic




  - [x] 3.1 Create database connection utility


    - Set up MongoDB connection with Mongoose
    - Add connection error handling and retry logic

    - Export database connection function
    - _Requirements: 8.1_


  
  - [x] 3.2 Create helper functions for models

    - Add methods for Member model: create, findById, findByUsername, update
    - Add methods for Wallet model: create, findByMemberId, updateBalance


    - Add methods for Transaction model: create, findByMemberId, findByFilters

    - Add methods for TreeNode model: create, findByMemberId, getDownline, getUpline



    - Add methods for Package model: findAll, findById, findActive


    - Use Mongoose queries with proper error handling
    - _Requirements: 1.1, 1.5, 2.1, 2.5, 4.1, 4.2, 6.1_

- [x] 4. Implement Member Management Service


  - [x] 4.1 Implement member registration

    - Create registerMember method that validates sponsor, creates member, initializes wallets, positions in tree

    - Handle registration without sponsor (root/default placement)
    - Validate sponsor exists before registration


    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 4.2 Write property tests for member registration

    - **Property 1: Valid sponsor registration creates positioned member** - Validates: Requirements 1.1
    - **Property 2: Invalid sponsor registration is rejected** - Validates: Requirements 1.3


    - **Property 3: Member registration initializes dual wallets** - Validates: Requirements 1.4
    - Configure fast-check to run 100+ iterations
  

  - [x] 4.3 Implement authentication




    - Create authenticateMember method with password hashing (bcrypt)
    - Return authentication token on success
    - _Requirements: 1.5_

  
  - [x] 4.4 Write property test for authentication

    - **Property 4: Authentication succeeds with valid credentials** - Validates: Requirements 1.5
  
  - [x] 4.5 Implement member profile operations



    - Create getMember and updateMember methods
    - _Requirements: 1.1_

- [x] 5. Implement Wallet Management Service





  - [x] 5.1 Implement deposit functionality




    - Create deposit method that credits main wallet and creates transaction record
    - Validate deposit amount is positive
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.2 Write property tests for deposits




    - **Property 5: Deposit increases main wallet balance** - Validates: Requirements 2.1
    - **Property 6: Wallet operations create transaction records** - Validates: Requirements 2.2
  
  - [x] 5.3 Implement withdrawal functionality


    - Create withdraw method that validates balance, deducts from commission wallet, creates transaction
    - Handle minimum withdrawal amount validation
    - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 5.4 Write property tests for withdrawals


    - **Property 9: Withdrawal with sufficient balance succeeds** - Validates: Requirements 2.5
    - **Property 30: Withdrawal validation checks balance** - Validates: Requirements 7.1
    - **Property 31: Successful withdrawal deducts and records** - Validates: Requirements 7.2
    - **Property 32: Insufficient balance rejects withdrawal** - Validates: Requirements 7.3
    - **Property 33: Withdrawal creates transaction record** - Validates: Requirements 7.4
  


  - [x] 5.5 Implement balance query methods
    - Create getBalance method that returns wallet balance by type
    - Create method to get both wallet balances


    - _Requirements: 2.4_


  
  - [x] 5.6 Write property test for wallet queries
    - **Property 8: Wallet query returns both wallets** - Validates: Requirements 2.4
  
  - [x] 5.7 Implement transaction history queries
    - Create getTransactionHistory with filtering by date range and type
    - Ensure transactions are ordered by timestamp descending
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 5.8 Write property tests for transaction history


    - **Property 25: Transaction history includes all wallets** - Validates: Requirements 6.1
    - **Property 26: Transaction records contain required fields** - Validates: Requirements 6.2
    - **Property 27: Date range filter works correctly** - Validates: Requirements 6.3
    - **Property 28: Transaction type filter works correctly** - Validates: Requirements 6.4
    - **Property 29: Transactions ordered by recency** - Validates: Requirements 6.5

- [x] 6. Implement Genealogy Service




  - [x] 6.1 Implement tree positioning logic


    - Create addMemberToTree method that finds next available position
    - Implement binary tree placement algorithm (left-fill strategy)
    - Handle explicit position assignment when specified
    - _Requirements: 4.1, 4.4_
  
  - [x] 6.2 Write property tests for tree positioning



    - **Property 15: Member positioned in sponsor's tree** - Validates: Requirements 4.1
    - **Property 18: Full positions trigger spillover placement** - Validates: Requirements 4.4

  
  - [x] 6.3 Implement tree navigation methods

    - Create getDownline method that retrieves all descendants
    - Create getUpline method that retrieves all ancestors
    - Implement depth-limited queries for performance
    - _Requirements: 4.2, 4.5_
  
  - [x] 6.4 Write property tests for tree navigation


    - **Property 16: Downline query returns complete subtree** - Validates: Requirements 4.2
    - **Property 19: Tree changes are immediately visible** - Validates: Requirements 4.5
    - **Property 34: No orphaned members in tree** - Validates: Requirements 8.3
  
  - [x] 6.5 Implement tree display with member information


    - Create method to retrieve tree with member details (position, status, package)
    - _Requirements: 4.3_
  
  - [x] 6.6 Write property test for tree display


    - **Property 17: Tree display includes member information** - Validates: Requirements 4.3

- [x] 7. Implement Commission Calculator

  - [x] 7.1 Implement leg volume tracking


    - Create updateLegVolumes method that tracks left and right leg sales separately
    - Determine which leg a purchase belongs to based on tree position
    - _Requirements: 5.2_
  
  - [x] 7.2 Write property test for leg volume tracking

    - **Property 21: Leg volumes tracked separately** - Validates: Requirements 5.2
  
  - [x] 7.3 Implement pairing logic

    - Create processPairing method that calculates commission from minimum leg volume
    - Implement commission rate calculation based on package
    - Deduct paired amounts from both leg volumes
    - _Requirements: 5.3, 5.5_
  
  - [x] 7.4 Write property tests for pairing

    - **Property 22: Pairing uses minimum leg volume** - Validates: Requirements 5.3
    - **Property 24: Pairing reduces leg volumes** - Validates: Requirements 5.5
  
  - [x] 7.5 Implement commission distribution

    - Create calculateCommissions method that processes upline commissions
    - Credit commissions to commission wallet (not main wallet)
    - Process commissions for all qualifying upline members
    - _Requirements: 5.1, 5.4_
  
  - [x] 7.6 Write property tests for commission distribution

    - **Property 20: Downline purchase credits upline commissions** - Validates: Requirements 5.1
    - **Property 23: Commission credited to commission wallet** - Validates: Requirements 5.4
    - **Property 7: Commission credits increase commission wallet** - Validates: Requirements 2.3

- [x] 8. Implement Package Service

  - [x] 8.1 Implement package management


    - Create getAvailablePackages method
    - Create getActivePackage method for member
    - _Requirements: 3.1_
  
  - [x] 8.2 Implement package purchase flow

    - Create purchasePackage method that validates balance, deducts from main wallet, updates active package
    - Trigger commission calculations after successful purchase
    - Handle insufficient balance errors
    - Ensure atomic transaction (purchase + commission calculation)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 8.3 Write property tests for package purchases

    - **Property 10: Purchase validation checks sufficient balance** - Validates: Requirements 3.1
    - **Property 11: Successful purchase deducts from main wallet** - Validates: Requirements 3.2
    - **Property 12: Insufficient balance rejects purchase** - Validates: Requirements 3.3
    - **Property 13: Purchase updates active package** - Validates: Requirements 3.4
    - **Property 14: Purchase triggers upline commissions** - Validates: Requirements 3.5

- [x] 9. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement error handling and validation

  - [x] 10.1 Add comprehensive input validation

    - Validate all user inputs before processing
    - Return descriptive error messages for validation failures
    - _Requirements: 1.3, 3.3, 7.3_
  
  - [x] 10.2 Implement transaction rollback logic

    - Ensure failed operations rollback all changes
    - Handle partial failures in multi-step operations (purchase + commission)
    - _Requirements: 8.2_
  
  - [x] 10.3 Add error logging

    - Log all errors with context (timestamp, member ID, operation, error details)
    - _Requirements: 8.1_

- [x] 11. Write integration tests

  - Test complete user flows end-to-end
  - Test member registration → deposit → purchase → commission distribution flow
  - Test withdrawal flow with balance validation
  - Test tree building with multiple members
  - _Requirements: All_

- [x] 12. Final Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.


# Frontend Implementation Tasks

- [x] 13. Setup Modern UI Foundation







  - [x] 13.1 Configure shadcn/ui components


    - Install and configure required shadcn/ui components (Button, Card, Input, Form, Table, Dialog, Tabs, Badge, Avatar)
    - Set up Tailwind CSS with custom color scheme
    - Configure responsive breakpoints and spacing
    - _Requirements: All UI requirements_
  
  - [x] 13.2 Create layout components


    - Create main dashboard layout with sidebar navigation
    - Implement responsive header with user profile dropdown
    - Create sidebar with navigation menu (Dashboard, Wallets, Genealogy, Packages, Transactions)
    - Add mobile-responsive hamburger menu
    - _Requirements: All UI requirements_
  
  - [x] 13.3 Setup authentication pages



    - Create modern login page with form validation
    - Create registration page with sponsor ID input
    - Implement NextAuth.js session management
    - Add protected route wrapper
    - _Requirements: 1.1, 1.5_

- [x] 14. Implement Dashboard Page



  - [x] 14.1 Create dashboard overview

    - Display wallet balances (main & commission) with animated cards
    - Show active package information with badge
    - Display quick stats (total downline, total commissions earned)
    - Add recent transactions widget (last 5 transactions)
    - _Requirements: 2.4, 3.1, 6.1_
  
  - [x] 14.2 Create wallet summary cards

    - Design gradient cards for main wallet and commission wallet
    - Add balance display with currency formatting
    - Include quick action buttons (Deposit, Withdraw, Purchase)
    - Show last updated timestamp
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 15. Implement Wallet Management Pages




  - [x] 15.1 Create wallet overview page


    - Display both wallets side-by-side with detailed information
    - Show available balance, pending transactions
    - Add transaction history table with filters
    - Implement pagination for transaction history
    - _Requirements: 2.4, 6.1, 6.2_
  
  - [x] 15.2 Implement deposit functionality

    - Create deposit modal/dialog with amount input
    - Add form validation (positive amounts only)
    - Show success/error notifications
    - Update wallet balance in real-time
    - _Requirements: 2.1, 2.2_
  
  - [x] 15.3 Implement withdrawal functionality

    - Create withdrawal modal with balance validation
    - Show available commission wallet balance
    - Add confirmation dialog for withdrawals
    - Display success message with transaction details
    - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 15.4 Create transaction history page

    - Build filterable transaction table (date range, type, wallet)
    - Add search functionality
    - Implement sorting by date, amount, type
    - Show transaction details in expandable rows
    - Export to CSV functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 16. Implement Genealogy Tree Visualization






  - [x] 16.1 Create interactive tree view


    - Build binary tree visualization with D3.js or React Flow
    - Display member nodes with avatar, username, status badge
    - Show left/right leg indicators
    - Implement zoom and pan controls
    - Add node click to view member details
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 16.2 Create tree navigation controls


    - Add breadcrumb navigation for tree levels
    - Implement "View Upline" and "View Downline" buttons
    - Create member search within tree
    - Add depth limit selector for performance
    - _Requirements: 4.2, 4.5_
  
  - [x] 16.3 Display member information cards


    - Show member details on node hover/click
    - Display position (left/right), status, active package
    - Show leg volumes for each member
    - Add quick actions (view profile, view downline)
    - _Requirements: 4.3_

- [x] 17. Implement Package Management





  - [x] 17.1 Create packages listing page


    - Display available packages in modern card grid
    - Show package details (name, price, commission rate, description)
    - Add "Purchase" button with hover effects
    - Highlight active package with special badge
    - _Requirements: 3.1_
  
  - [x] 17.2 Implement package purchase flow


    - Create purchase confirmation modal
    - Show package details and price
    - Display current main wallet balance
    - Validate sufficient balance before purchase
    - Show loading state during purchase
    - Display success message with commission info
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 17.3 Create active package display


    - Show current active package in dashboard
    - Display commission rate and benefits
    - Show purchase date and transaction history
    - _Requirements: 3.1, 3.4_

- [x] 18. Implement Commission Tracking





  - [x] 18.1 Create commission dashboard


    - Display total commissions earned (all-time)
    - Show commission breakdown by month/week
    - Create chart visualization for commission trends
    - Display leg volume indicators (left vs right)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 18.2 Create leg volume visualization


    - Build visual representation of left/right leg volumes
    - Show pairing progress bar
    - Display next pairing amount estimate
    - Add historical pairing records
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 19. Implement Member Profile & Settings




  - [x] 19.1 Create profile page


    - Display member information (username, registration date, status)
    - Show sponsor information with link to profile
    - Display member statistics (total downline, total purchases)
    - Add profile avatar/image upload
    - _Requirements: 1.1_
  
  - [x] 19.2 Create settings page


    - Add password change functionality
    - Notification preferences
    - Display settings
    - Account security options
    - _Requirements: 1.5_

- [x] 20. Add Real-time Features & Polish




  - [x] 20.1 Implement notifications system


    - Create toast notifications for all actions
    - Add success/error/warning message types
    - Implement notification center for important updates
    - Show commission earned notifications
    - _Requirements: All_
  
  - [x] 20.2 Add loading states and skeletons


    - Create skeleton loaders for all data-heavy components
    - Add loading spinners for async operations
    - Implement optimistic UI updates
    - _Requirements: All_
  
  - [x] 20.3 Implement error handling


    - Create error boundary components
    - Add user-friendly error messages
    - Implement retry mechanisms for failed requests
    - Add fallback UI for errors
    - _Requirements: 8.1_
  
  - [x] 20.4 Add animations and transitions


    - Implement smooth page transitions
    - Add micro-interactions (button hovers, card animations)
    - Create loading animations
    - Add success celebration animations for purchases/commissions
    - _Requirements: All_
  
  - [x] 20.5 Optimize performance


    - Implement code splitting for routes
    - Add image optimization
    - Lazy load heavy components (tree visualization)
    - Optimize bundle size
    - _Requirements: All_

- [x] 21. Create API Routes (Next.js API)




  - [x] 21.1 Authentication API routes


    - POST /api/auth/register - Member registration
    - POST /api/auth/login - Member login
    - GET /api/auth/session - Get current session
    - _Requirements: 1.1, 1.5_
  
  - [x] 21.2 Wallet API routes


    - GET /api/wallets - Get member wallets
    - POST /api/wallets/deposit - Deposit to main wallet
    - POST /api/wallets/withdraw - Withdraw from commission wallet
    - GET /api/wallets/transactions - Get transaction history
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 6.1_
  
  - [x] 21.3 Genealogy API routes


    - GET /api/genealogy/tree - Get genealogy tree
    - GET /api/genealogy/downline - Get downline members
    - GET /api/genealogy/upline - Get upline members
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 21.4 Package API routes


    - GET /api/packages - Get available packages
    - GET /api/packages/active - Get member's active package
    - POST /api/packages/purchase - Purchase package
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 21.5 Commission API routes


    - GET /api/commissions/summary - Get commission summary
    - GET /api/commissions/leg-volumes - Get leg volumes
    - GET /api/commissions/history - Get commission history
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 22. Testing & Quality Assurance




  - [x] 22.1 Test responsive design



    - Test on mobile devices (320px - 768px)
    - Test on tablets (768px - 1024px)
    - Test on desktop (1024px+)
    - Verify all interactions work on touch devices
    - _Requirements: All_
  
  - [x] 22.2 Cross-browser testing


    - Test on Chrome, Firefox, Safari, Edge
    - Verify all features work consistently
    - Fix browser-specific issues
    - _Requirements: All_
  
  - [x] 22.3 Accessibility testing


    - Verify keyboard navigation works
    - Test with screen readers
    - Check color contrast ratios
    - Add ARIA labels where needed
    - _Requirements: All_
  
  - [x] 22.4 Performance testing


    - Test page load times
    - Verify smooth animations
    - Check for memory leaks
    - Optimize slow components
    - _Requirements: All_

