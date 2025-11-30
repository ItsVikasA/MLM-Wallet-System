# Implementation Plan

- [ ] 1. Set up project structure and core interfaces
  - Create directory structure for models, services, repositories, and tests
  - Set up TypeScript configuration with strict type checking
  - Install and configure testing frameworks (Jest for unit tests, fast-check for property tests)
  - Define core TypeScript interfaces for Member, Wallet, Transaction, TreeNode, Package
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 2. Implement data models with validation
  - [ ] 2.1 Create Member model with validation
    - Implement Member interface with id, username, passwordHash, sponsorId, status, activePackageId
    - Add validation for username uniqueness and password strength
    - _Requirements: 1.1, 1.5_
  
  - [ ] 2.2 Create Wallet model
    - Implement Wallet interface with id, memberId, type, balance, lastUpdated
    - Add validation to ensure balance is non-negative
    - _Requirements: 1.4, 2.1, 2.4_
  
  - [ ] 2.3 Create Transaction model
    - Implement Transaction interface with all required fields
    - Add validation for transaction amounts and types
    - _Requirements: 2.2, 6.1, 6.2_
  
  - [ ] 2.4 Create TreeNode model
    - Implement TreeNode interface with member relationships and leg volumes
    - Add validation for tree structure integrity
    - _Requirements: 4.1, 4.2, 5.2_
  
  - [ ] 2.5 Create Package model
    - Implement Package interface with pricing and commission rate
    - _Requirements: 3.1, 3.2_

- [ ] 3. Implement repository layer for data persistence
  - [ ] 3.1 Create MemberRepository
    - Implement methods: create, findById, findByUsername, update, delete
    - Add database queries with proper error handling
    - _Requirements: 1.1, 1.5_
  
  - [ ] 3.2 Create WalletRepository
    - Implement methods: create, findByMemberId, updateBalance, getBalance
    - Ensure atomic balance updates with transactions
    - _Requirements: 1.4, 2.1, 2.5_
  
  - [ ] 3.3 Create TransactionRepository
    - Implement methods: create, findByMemberId, findByDateRange, findByType
    - Add support for filtering and ordering
    - _Requirements: 2.2, 6.1, 6.3, 6.4, 6.5_
  
  - [ ] 3.4 Create GenealogyRepository
    - Implement methods: createNode, findByMemberId, getDownline, getUpline, updateLegVolumes
    - Add efficient tree traversal queries
    - _Requirements: 4.1, 4.2, 4.5, 8.3_
  
  - [ ] 3.5 Create PackageRepository
    - Implement methods: findAll, findById, findActive
    - _Requirements: 3.1_

- [ ] 4. Implement Member Management Service
  - [ ] 4.1 Implement member registration
    - Create registerMember method that validates sponsor, creates member, initializes wallets, positions in tree
    - Handle registration without sponsor (root/default placement)
    - Validate sponsor exists before registration
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 4.2 Write property tests for member registration
    - **Property 1: Valid sponsor registration creates positioned member** - Validates: Requirements 1.1
    - **Property 2: Invalid sponsor registration is rejected** - Validates: Requirements 1.3
    - **Property 3: Member registration initializes dual wallets** - Validates: Requirements 1.4
    - Configure fast-check to run 100+ iterations
  
  - [ ] 4.3 Implement authentication
    - Create authenticateMember method with password hashing (bcrypt)
    - Return authentication token on success
    - _Requirements: 1.5_
  
  - [ ] 4.4 Write property test for authentication
    - **Property 4: Authentication succeeds with valid credentials** - Validates: Requirements 1.5
  
  - [ ] 4.5 Implement member profile operations
    - Create getMember and updateMember methods
    - _Requirements: 1.1_

- [ ] 5. Implement Wallet Management Service
  - [ ] 5.1 Implement deposit functionality
    - Create deposit method that credits main wallet and creates transaction record
    - Validate deposit amount is positive
    - _Requirements: 2.1, 2.2_
  
  - [ ] 5.2 Write property tests for deposits
    - **Property 5: Deposit increases main wallet balance** - Validates: Requirements 2.1
    - **Property 6: Wallet operations create transaction records** - Validates: Requirements 2.2
  
  - [ ] 5.3 Implement withdrawal functionality
    - Create withdraw method that validates balance, deducts from commission wallet, creates transaction
    - Handle minimum withdrawal amount validation
    - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 5.4 Write property tests for withdrawals
    - **Property 9: Withdrawal with sufficient balance succeeds** - Validates: Requirements 2.5
    - **Property 30: Withdrawal validation checks balance** - Validates: Requirements 7.1
    - **Property 31: Successful withdrawal deducts and records** - Validates: Requirements 7.2
    - **Property 32: Insufficient balance rejects withdrawal** - Validates: Requirements 7.3
    - **Property 33: Withdrawal creates transaction record** - Validates: Requirements 7.4
  
  - [ ] 5.5 Implement balance query methods
    - Create getBalance method that returns wallet balance by type
    - Create method to get both wallet balances
    - _Requirements: 2.4_
  
  - [ ] 5.6 Write property test for wallet queries
    - **Property 8: Wallet query returns both wallets** - Validates: Requirements 2.4
  
  - [ ] 5.7 Implement transaction history queries
    - Create getTransactionHistory with filtering by date range and type
    - Ensure transactions are ordered by timestamp descending
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 5.8 Write property tests for transaction history
    - **Property 25: Transaction history includes all wallets** - Validates: Requirements 6.1
    - **Property 26: Transaction records contain required fields** - Validates: Requirements 6.2
    - **Property 27: Date range filter works correctly** - Validates: Requirements 6.3
    - **Property 28: Transaction type filter works correctly** - Validates: Requirements 6.4
    - **Property 29: Transactions ordered by recency** - Validates: Requirements 6.5

- [ ] 6. Implement Genealogy Service
  - [ ] 6.1 Implement tree positioning logic
    - Create addMemberToTree method that finds next available position
    - Implement binary tree placement algorithm (left-fill strategy)
    - Handle explicit position assignment when specified
    - _Requirements: 4.1, 4.4_
  
  - [ ] 6.2 Write property tests for tree positioning
    - **Property 15: Member positioned in sponsor's tree** - Validates: Requirements 4.1
    - **Property 18: Full positions trigger spillover placement** - Validates: Requirements 4.4
  
  - [ ] 6.3 Implement tree navigation methods
    - Create getDownline method that retrieves all descendants
    - Create getUpline method that retrieves all ancestors
    - Implement depth-limited queries for performance
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.4 Write property tests for tree navigation
    - **Property 16: Downline query returns complete subtree** - Validates: Requirements 4.2
    - **Property 19: Tree changes are immediately visible** - Validates: Requirements 4.5
    - **Property 34: No orphaned members in tree** - Validates: Requirements 8.3
  
  - [ ] 6.5 Implement tree display with member information
    - Create method to retrieve tree with member details (position, status, package)
    - _Requirements: 4.3_
  
  - [ ] 6.6 Write property test for tree display
    - **Property 17: Tree display includes member information** - Validates: Requirements 4.3

- [ ] 7. Implement Commission Calculator
  - [ ] 7.1 Implement leg volume tracking
    - Create updateLegVolumes method that tracks left and right leg sales separately
    - Determine which leg a purchase belongs to based on tree position
    - _Requirements: 5.2_
  
  - [ ] 7.2 Write property test for leg volume tracking
    - **Property 21: Leg volumes tracked separately** - Validates: Requirements 5.2
  
  - [ ] 7.3 Implement pairing logic
    - Create processPairing method that calculates commission from minimum leg volume
    - Implement commission rate calculation based on package
    - Deduct paired amounts from both leg volumes
    - _Requirements: 5.3, 5.5_
  
  - [ ] 7.4 Write property tests for pairing
    - **Property 22: Pairing uses minimum leg volume** - Validates: Requirements 5.3
    - **Property 24: Pairing reduces leg volumes** - Validates: Requirements 5.5
  
  - [ ] 7.5 Implement commission distribution
    - Create calculateCommissions method that processes upline commissions
    - Credit commissions to commission wallet (not main wallet)
    - Process commissions for all qualifying upline members
    - _Requirements: 5.1, 5.4_
  
  - [ ] 7.6 Write property tests for commission distribution
    - **Property 20: Downline purchase credits upline commissions** - Validates: Requirements 5.1
    - **Property 23: Commission credited to commission wallet** - Validates: Requirements 5.4
    - **Property 7: Commission credits increase commission wallet** - Validates: Requirements 2.3

- [ ] 8. Implement Package Service
  - [ ] 8.1 Implement package management
    - Create getAvailablePackages method
    - Create getActivePackage method for member
    - _Requirements: 3.1_
  
  - [ ] 8.2 Implement package purchase flow
    - Create purchasePackage method that validates balance, deducts from main wallet, updates active package
    - Trigger commission calculations after successful purchase
    - Handle insufficient balance errors
    - Ensure atomic transaction (purchase + commission calculation)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 8.3 Write property tests for package purchases
    - **Property 10: Purchase validation checks sufficient balance** - Validates: Requirements 3.1
    - **Property 11: Successful purchase deducts from main wallet** - Validates: Requirements 3.2
    - **Property 12: Insufficient balance rejects purchase** - Validates: Requirements 3.3
    - **Property 13: Purchase updates active package** - Validates: Requirements 3.4
    - **Property 14: Purchase triggers upline commissions** - Validates: Requirements 3.5

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement error handling and validation
  - [ ] 10.1 Add comprehensive input validation
    - Validate all user inputs before processing
    - Return descriptive error messages for validation failures
    - _Requirements: 1.3, 3.3, 7.3_
  
  - [ ] 10.2 Implement transaction rollback logic
    - Ensure failed operations rollback all changes
    - Handle partial failures in multi-step operations (purchase + commission)
    - _Requirements: 8.2_
  
  - [ ] 10.3 Add error logging
    - Log all errors with context (timestamp, member ID, operation, error details)
    - _Requirements: 8.1_

- [ ] 11. Write integration tests
  - Test complete user flows end-to-end
  - Test member registration → deposit → purchase → commission distribution flow
  - Test withdrawal flow with balance validation
  - Test tree building with multiple members
  - _Requirements: All_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
