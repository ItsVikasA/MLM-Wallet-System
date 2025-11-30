# Design Document

## Overview

The MLM Wallet System is designed as a modular application that manages multi-level marketing operations including member accounts, dual-wallet functionality, binary genealogy trees, and commission calculations. The system follows a layered architecture with clear separation between data models, business logic, and persistence layers.

The core design principles include:
- **Separation of Concerns**: Clear boundaries between wallet management, genealogy tracking, and commission calculation
- **Data Integrity**: Atomic transactions and consistent state management across all operations
- **Scalability**: Binary tree structure that efficiently handles growing member networks
- **Auditability**: Complete transaction history for all financial operations

## Architecture

The system follows a three-tier architecture:

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Business Logic & Orchestration)       │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│  (Models, Services, Calculators)        │
├─────────────────────────────────────────┤
│         Data Layer                      │
│  (Repositories, Persistence)            │
└─────────────────────────────────────────┘
```

**Application Layer**: Handles user interactions, input validation, and orchestrates business operations

**Domain Layer**: Contains core business logic including:
- Member management service
- Wallet service (main and commission wallets)
- Genealogy service (binary tree operations)
- Commission calculator
- Transaction manager

**Data Layer**: Manages data persistence with repositories for:
- Member repository
- Wallet repository
- Transaction repository
- Genealogy repository

## Components and Interfaces

### Member Management Component

**Responsibilities:**
- Member registration with sponsor assignment
- Authentication and authorization
- Member profile management

**Key Interfaces:**
```typescript
interface MemberService {
  registerMember(username: string, password: string, sponsorId?: string): Member
  authenticateMember(username: string, password: string): AuthToken
  getMember(memberId: string): Member
  updateMember(memberId: string, updates: Partial<Member>): Member
}
```

### Wallet Management Component

**Responsibilities:**
- Maintain separate main wallet and commission wallet for each member
- Process deposits, purchases, and withdrawals
- Ensure balance consistency and transaction atomicity

**Key Interfaces:**
```typescript
interface WalletService {
  deposit(memberId: string, amount: number): Transaction
  deductForPurchase(memberId: string, amount: number): Transaction
  creditCommission(memberId: string, amount: number): Transaction
  withdraw(memberId: string, amount: number): Transaction
  getBalance(memberId: string, walletType: WalletType): number
  getTransactionHistory(memberId: string, walletType?: WalletType): Transaction[]
}
```

### Genealogy Management Component

**Responsibilities:**
- Build and maintain binary tree structure
- Track member positions (left leg vs right leg)
- Navigate upline and downline relationships
- Handle tree placement logic

**Key Interfaces:**
```typescript
interface GenealogyService {
  addMemberToTree(memberId: string, sponsorId: string, position?: 'left' | 'right'): TreeNode
  getDownline(memberId: string, depth?: number): TreeNode[]
  getUpline(memberId: string): Member[]
  getTreePosition(memberId: string): TreePosition
  findNextAvailablePosition(sponsorId: string): TreePosition
}
```

### Commission Calculation Component

**Responsibilities:**
- Calculate binary commissions based on leg volumes
- Track left and right leg sales volumes
- Process pairing and commission distribution
- Update leg volumes after pairing

**Key Interfaces:**
```typescript
interface CommissionCalculator {
  calculateCommissions(purchaseMemberId: string, packageAmount: number): CommissionResult[]
  updateLegVolumes(memberId: string, amount: number, leg: 'left' | 'right'): void
  getLegVolumes(memberId: string): { left: number, right: number }
  processPairing(memberId: string): number
}
```

### Package Management Component

**Responsibilities:**
- Define available packages
- Process package purchases
- Trigger commission calculations

**Key Interfaces:**
```typescript
interface PackageService {
  getAvailablePackages(): Package[]
  purchasePackage(memberId: string, packageId: string): PurchaseResult
  getActivePackage
(memberId: string): Package | null
}
```

## Data Models

### Member Model
```typescript
interface Member {
  id: string
  username: string
  passwordHash: string
  sponsorId: string | null
  registrationDate: Date
  status: 'active' | 'inactive' | 'suspended'
  activePackageId: string | null
}
```

### Wallet Model
```typescript
interface Wallet {
  id: string
  memberId: string
  type: 'main' | 'commission'
  balance: number
  lastUpdated: Date
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string
  memberId: string
  walletType: 'main' | 'commission'
  type: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  amount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: Date
  description: string
  relatedMemberId?: string  // For commission transactions
}
```

### TreeNode Model
```typescript
interface TreeNode {
  memberId: string
  sponsorId: string | null
  leftChildId: string | null
  rightChildId: string | null
  leftLegVolume: number
  rightLegVolume: number
  position: 'root' | 'left' | 'right'
  depth: number
}
```

### Package Model
```typescript
interface Package {
  id: string
  name: string
  price: number
  commissionRate: number  // Percentage for binary commission
  description: string
  isActive: boolean
}
```

### Commission Result Model
```typescript
interface CommissionResult {
  memberId: string
  amount: number
  fromMemberId: string
  packageAmount: number
  leg: 'left' | 'right'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Member Registration Properties

Property 1: Valid sponsor registration creates positioned member
*For any* valid member registration data and existing sponsor ID, registering the member should create a new member account that is positioned in the genealogy tree under the specified sponsor.
**Validates: Requirements 1.1**

Property 2: Invalid sponsor registration is rejected
*For any* member registration with a non-existent sponsor ID, the registration should be rejected with an error.
**Validates: Requirements 1.3**

Property 3: Member registration initializes dual wallets
*For any* successful member registration, the system should create both a main wallet and commission wallet for the member, each with zero balance.
**Validates: Requirements 1.4**

Property 4: Authentication succeeds with valid credentials
*For any* registered member, authenticating with the same credentials used during registration should succeed and grant access.
**Validates: Requirements 1.5**

### Wallet Management Properties

Property 5: Deposit increases main wallet balance
*For any* member and positive deposit amount, depositing funds should increase the member's main wallet balance by exactly that amount.
**Validates: Requirements 2.1**

Property 6: Wallet operations create transaction records
*For any* wallet balance change, the system should create a transaction record with the correct amount, type, and before/after balances.
**Validates: Requirements 2.2**

Property 7: Commission credits increase commission wallet
*For any* member earning a commission, the commission amount should be credited to the member's commission wallet, not the main wallet.
**Validates: Requirements 2.3**

Property 8: Wallet query returns both wallets
*For any* member, querying wallet balances should return both main wallet and commission wallet balances as separate values.
**Validates: Requirements 2.4**

Property 9: Withdrawal with sufficient balance succeeds
*For any* member with commission wallet balance greater than or equal to the withdrawal amount, the withdrawal should succeed and decrease the balance by the withdrawal amount.
**Validates: Requirements 2.5**

### Package Purchase Properties

Property 10: Purchase validation checks sufficient balance
*For any* package purchase attempt, if the member's main wallet balance is less than the package price, the purchase should be rejected.
**Validates: Requirements 3.1**

Property 11: Successful purchase deducts from main wallet
*For any* package purchase with sufficient balance, the package price should be deducted from the member's main wallet and a purchase transaction should be recorded.
**Validates: Requirements 3.2**

Property 12: Insufficient balance rejects purchase
*For any* package purchase attempt where main wallet balance is less than package price, the purchase should be rejected and the wallet balance should remain unchanged.
**Validates: Requirements 3.3**

Property 13: Purchase updates active package
*For any* successful package purchase, the member's active package status should be updated to reflect the purchased package.
**Validates: Requirements 3.4**

Property 14: Purchase triggers upline commissions
*For any* package purchase by a member with upline members, the purchase should trigger commission calculations for qualifying upline members.
**Validates: Requirements 3.5**

### Genealogy Tree Properties

Property 15: Member positioned in sponsor's tree
*For any* new member registration with a sponsor, the member should be positioned in either the left leg or right leg of the sponsor's binary tree.
**Validates: Requirements 4.1**

Property 16: Downline query returns complete subtree
*For any* member, querying their downline should return all members positioned below them in the binary tree structure.
**Validates: Requirements 4.2**

Property 17: Tree display includes member information
*For any* genealogy tree query result, each member node should include position, status, and package information.
**Validates: Requirements 4.3**

Property 18: Full positions trigger spillover placement
*For any* sponsor with both left and right positions occupied, registering a new member under that sponsor should place the member in the next available position following binary tree rules.
**Validates: Requirements 4.4**

Property 19: Tree changes are immediately visible
*For any* genealogy tree modification, subsequent queries should reflect the updated structure immediately.
**Validates: Requirements 4.5**

### Commission Calculation Properties

Property 20: Downline purchase credits upline commissions
*For any* package purchase by a member, all qualifying upline members should receive binary commission credits in their commission wallets.
**Validates: Requirements 5.1**

Property 21: Leg volumes tracked separately
*For any* member, purchases from left leg downline should increase left leg volume, and purchases from right leg downline should increase right leg volume independently.
**Validates: Requirements 5.2**

Property 22: Pairing uses minimum leg volume
*For any* member with both left and right leg volumes greater than zero, the commission calculation should use the lesser of the two leg volumes for pairing.
**Validates: Requirements 5.3**

Property 23: Commission credited to commission wallet
*For any* calculated binary commission, the commission amount should be credited to the member's commission wallet, not the main wallet.
**Validates: Requirements 5.4**

Property 24: Pairing reduces leg volumes
*For any* completed pairing, both left and right leg volumes should be reduced by the paired amount.
**Validates: Requirements 5.5**

### Transaction History Properties

Property 25: Transaction history includes all wallets
*For any* member, querying transaction history should return transactions from both main wallet and commission wallet.
**Validates: Requirements 6.1**

Property 26: Transaction records contain required fields
*For any* transaction record, it should include date, type, amount, and resulting balance.
**Validates: Requirements 6.2**

Property 27: Date range filter works correctly
*For any* transaction history query with date range filter, only transactions within the specified date range should be returned.
**Validates: Requirements 6.3**

Property 28: Transaction type filter works correctly
*For any* transaction history query with type filter, only transactions matching the specified type should be returned.
**Validates: Requirements 6.4**

Property 29: Transactions ordered by recency
*For any* transaction history query, transactions should be returned in reverse chronological order (newest first).
**Validates: Requirements 6.5**

### Withdrawal Properties

Property 30: Withdrawal validation checks balance
*For any* withdrawal request, if the commission wallet balance is less than the requested amount, the withdrawal should be rejected.
**Validates: Requirements 7.1**

Property 31: Successful withdrawal deducts and records
*For any* withdrawal request with sufficient balance, the amount should be deducted from the commission wallet and a withdrawal transaction should be created.
**Validates: Requirements 7.2**

Property 32: Insufficient balance rejects withdrawal
*For any* withdrawal request exceeding available balance, the request should be rejected and the balance should remain unchanged.
**Validates: Requirements 7.3**

Property 33: Withdrawal creates transaction record
*For any* processed withdrawal, a transaction record should be created with timestamp and amount.
**Validates: Requirements 7.4**

### Data Integrity Properties

Property 34: No orphaned members in tree
*For any* member in the genealogy tree (except root), the member should have a valid sponsor reference that points to an existing member.
**Validates: Requirements 8.3**


## Error Handling

The system implements comprehensive error handling to ensure data integrity and provide clear feedback to users.

### Error Categories

**Validation Errors:**
- Invalid sponsor ID during registration
- Insufficient wallet balance for purchases or withdrawals
- Invalid credentials during authentication
- Below minimum withdrawal amount (when configured)
- Invalid member ID references

**Business Logic Errors:**
- Attempting to purchase package when already active
- Attempting operations on suspended accounts
- Invalid tree position assignments
- Concurrent transaction conflicts

**Data Integrity Errors:**
- Orphaned member references
- Inconsistent wallet balances
- Missing transaction records
- Broken genealogy relationships

### Error Handling Strategy

**Input Validation:**
All user inputs are validated before processing. Invalid inputs result in descriptive error messages without modifying system state.

**Transaction Rollback:**
Failed operations that partially modify state should rollback all changes to maintain consistency. This is particularly critical for:
- Package purchases (wallet deduction + commission calculation)
- Withdrawals (balance check + deduction + transaction record)
- Member registration (member creation + wallet initialization + tree positioning)

**Error Propagation:**
Errors are propagated up the call stack with sufficient context for debugging while presenting user-friendly messages at the application layer.

**Logging:**
All errors are logged with:
- Timestamp
- Member ID (when applicable)
- Operation being performed
- Error type and message
- Stack trace for unexpected errors

## Testing Strategy

The system employs a dual testing approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Property-Based Testing

Property-based tests verify that universal properties hold across all valid inputs, providing strong correctness guarantees.

**Framework:** fast-check (for property-based testing in TypeScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its corresponding correctness property using the format: `**Feature: mlm-wallet-system, Property {number}: {property_text}**`

**Property Test Coverage:**
Each of the 34 correctness properties defined above must be implemented as a property-based test. Property tests should:
- Generate random valid inputs (members, amounts, tree structures)
- Execute the operation under test
- Verify the property holds for all generated inputs
- Include edge cases in the input generation (zero amounts, empty trees, maximum values)

**Key Property Test Areas:**
- Wallet operations (deposits, withdrawals, balance consistency)
- Commission calculations (pairing logic, leg volume tracking)
- Tree operations (placement, navigation, integrity)
- Transaction history (filtering, ordering, completeness)

### Unit Testing

Unit tests verify specific examples, integration points, and concrete scenarios.

**Framework:** Jest with React Testing Library (for unit and component testing)

**Unit Test Coverage:**
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, null/undefined handling)
- Error conditions (invalid inputs, insufficient balances)
- Integration between components (purchase triggering commissions)
- Data model validation

**Key Unit Test Areas:**
- Member registration with and without sponsor
- Wallet initialization on member creation
- Package purchase flow end-to-end
- Commission distribution to multiple upline levels
- Transaction record creation and retrieval
- Tree placement algorithms
- Authentication success and failure cases

### Testing Principles

**Implementation-First Development:**
Implement features first, then write corresponding tests to verify correctness. This ensures tests validate actual behavior rather than assumptions.

**Complementary Coverage:**
- Unit tests catch specific bugs and verify concrete examples
- Property tests verify general correctness across all inputs
- Together they provide comprehensive validation

**Test Isolation:**
Each test should be independent and not rely on state from other tests. Use setup/teardown to ensure clean state.

**Realistic Data:**
Tests should use realistic data and avoid mocks where possible to validate actual system behavior.

### Continuous Validation

**Test Execution:**
- Run all tests before committing code changes
- Property tests run with sufficient iterations to catch edge cases
- Failed tests must be fixed before proceeding

**Coverage Monitoring:**
Track test coverage to ensure all critical paths are tested, aiming for:
- 100% coverage of correctness properties via property tests
- High coverage of business logic via unit tests
- Coverage of error handling paths

## Implementation Notes

### Technology Considerations

**Framework:** Next.js 14+ with App Router for full-stack development

**Language:** TypeScript for type safety across frontend and backend

**Database:** 
- MongoDB for flexible schema and scalability
- Mongoose ODM for schema validation and query building
- Support for transactions to ensure atomicity
- Indexes on frequently queried fields (memberId, sponsorId, walletType)

**Concurrency:**
- Use database transactions with appropriate isolation levels
- Implement optimistic locking for wallet balance updates
- Queue commission calculations if needed for high-volume scenarios

### Performance Considerations

**Tree Traversal:**
- Cache upline paths for frequently accessed members
- Limit depth of upline commission calculations
- Use recursive CTEs for efficient tree queries

**Commission Calculation:**
- Process commissions asynchronously if purchase volume is high
- Batch commission updates where possible
- Index leg volume fields for quick pairing calculations

**Transaction History:**
- Implement pagination for large transaction histories
- Create indexes on timestamp and transaction type for filtering
- Consider archiving old transactions for performance

### Security Considerations

**Authentication:**
- Hash passwords using bcrypt or similar strong hashing algorithm
- Implement rate limiting on authentication attempts
- Use secure session management

**Authorization:**
- Members can only access their own data
- Implement role-based access for administrative functions
- Validate member ownership before processing transactions

**Data Protection:**
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Audit log all financial transactions
- Implement withdrawal approval workflow for large amounts

### Scalability Considerations

**Horizontal Scaling:**
- Design services to be stateless where possible
- Use distributed caching for frequently accessed data
- Implement message queues for asynchronous processing

**Data Partitioning:**
- Consider sharding by member ID for very large member bases
- Partition transaction history by date ranges
- Use read replicas for reporting queries

**Monitoring:**
- Track wallet balance consistency
- Monitor commission calculation latency
- Alert on failed transactions or data integrity issues
