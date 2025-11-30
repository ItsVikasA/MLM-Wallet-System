# Requirements Document

## Introduction

This document specifies the requirements for a Multi-Level Marketing (MLM) Wallet System that manages member accounts, package purchases, genealogy tracking, dual-wallet functionality (main wallet and commission wallet), and commission calculations based on a binary tree structure. The system enables members to purchase packages, track their downline network, earn commissions from their organization's sales, and manage their earnings through separate wallet accounts.

## Glossary

- **MLM System**: The Multi-Level Marketing Wallet System being specified
- **Member**: A registered user account within the MLM System
- **Package**: A purchasable product offering with a defined price and commission structure
- **Main Wallet**: The primary wallet account where members deposit funds for package purchases
- **Commission Wallet**: A separate wallet account where earned commissions are credited
- **Genealogy Tree**: A binary tree structure representing the hierarchical relationship between members
- **Sponsor**: The member who directly recruited another member into the system
- **Upline**: Any member positioned above another member in the genealogy tree
- **Downline**: Any member positioned below another member in the genealogy tree
- **Left Leg**: The left branch of a member's position in the binary tree
- **Right Leg**: The right branch of a member's position in the binary tree
- **Binary Commission**: Commission earned based on the sales volume of both left and right legs
- **Pairing**: The event when both left and right legs have qualifying sales volume

## Requirements

### Requirement 1: Member Registration and Authentication

**User Story:** As a new user, I want to register for an account with sponsor information, so that I can join the MLM network and be properly positioned in the genealogy tree.

#### Acceptance Criteria

1. WHEN a user submits registration information with a valid sponsor ID, THE MLM System SHALL create a new member account and position the member in the sponsor's genealogy tree
2. WHEN a user registers without providing a sponsor ID, THE MLM System SHALL assign the member to a default sponsor or root position
3. WHEN a user attempts to register with an invalid sponsor ID, THE MLM System SHALL reject the registration and display an error message
4. WHEN a member account is created, THE MLM System SHALL initialize both a main wallet and commission wallet with zero balance
5. WHEN a registered member provides valid credentials, THE MLM System SHALL authenticate the member and grant access to their account

### Requirement 2: Wallet Management

**User Story:** As a member, I want to manage two separate wallets (main wallet and commission wallet), so that I can distinguish between my invested funds and earned commissions.

#### Acceptance Criteria

1. WHEN a member deposits funds, THE MLM System SHALL credit the amount to the member's main wallet
2. WHEN a member's main wallet balance changes, THE MLM System SHALL update the balance immediately and maintain transaction history
3. WHEN a member earns a commission, THE MLM System SHALL credit the amount to the member's commission wallet
4. WHEN a member views their wallet balances, THE MLM System SHALL display both main wallet and commission wallet balances separately
5. WHEN a member requests a withdrawal from their commission wallet, THE MLM System SHALL process the withdrawal if sufficient balance exists

### Requirement 3: Package Purchase

**User Story:** As a member, I want to purchase packages using my main wallet balance, so that I can activate my account and qualify for commission earnings.

#### Acceptance Criteria

1. WHEN a member selects a package to purchase, THE MLM System SHALL verify that the member's main wallet balance is sufficient
2. WHEN a member completes a package purchase with sufficient balance, THE MLM System SHALL deduct the package price from the main wallet and record the purchase
3. WHEN a member attempts to purchase a package with insufficient balance, THE MLM System SHALL reject the purchase and display an error message
4. WHEN a package purchase is completed, THE MLM System SHALL update the member's active package status
5. WHEN a package purchase is recorded, THE MLM System SHALL trigger commission calculations for the member's upline

### Requirement 4: Genealogy Tree Management

**User Story:** As a member, I want to view my genealogy tree showing my downline organization, so that I can track my network growth and structure.

#### Acceptance Criteria

1. WHEN a new member is registered under a sponsor, THE MLM System SHALL position the member in either the left leg or right leg of the sponsor's binary tree
2. WHEN a member views their genealogy tree, THE MLM System SHALL display all downline members organized in a binary tree structure
3. WHEN the genealogy tree is displayed, THE MLM System SHALL show each member's position, status, and package information
4. WHEN both left and right positions under a member are occupied, THE MLM System SHALL place new recruits in the next available position following binary tree placement rules
5. WHEN a member's downline structure changes, THE MLM System SHALL update the genealogy tree immediately

### Requirement 5: Binary Commission Calculation

**User Story:** As a member, I want to earn binary commissions based on the sales volume of my left and right legs, so that I am rewarded for building a balanced organization.

#### Acceptance Criteria

1. WHEN a downline member purchases a package, THE MLM System SHALL calculate and credit binary commissions to all qualifying upline members
2. WHEN calculating binary commissions, THE MLM System SHALL track sales volume separately for left leg and right leg
3. WHEN a pairing occurs between left and right leg volumes, THE MLM System SHALL calculate the commission amount based on the lesser of the two leg volumes
4. WHEN binary commission is calculated, THE MLM System SHALL credit the commission amount to the member's commission wallet
5. WHEN commission calculations are completed, THE MLM System SHALL update the member's leg volumes by deducting the paired amounts

### Requirement 6: Transaction History and Reporting

**User Story:** As a member, I want to view my complete transaction history for both wallets, so that I can track all financial activities in my account.

#### Acceptance Criteria

1. WHEN a member views transaction history, THE MLM System SHALL display all transactions for both main wallet and commission wallet
2. WHEN displaying transactions, THE MLM System SHALL show transaction date, type, amount, and resulting balance for each entry
3. WHEN a member filters transaction history by date range, THE MLM System SHALL display only transactions within the specified period
4. WHEN a member filters transaction history by transaction type, THE MLM System SHALL display only transactions matching the selected type
5. WHEN transaction history is requested, THE MLM System SHALL retrieve and display transactions in reverse chronological order

### Requirement 7: Commission Withdrawal

**User Story:** As a member, I want to withdraw funds from my commission wallet to my external account, so that I can access my earned commissions.

#### Acceptance Criteria

1. WHEN a member requests a withdrawal, THE MLM System SHALL verify that the commission wallet balance is sufficient for the requested amount
2. WHEN a withdrawal request is approved with sufficient balance, THE MLM System SHALL deduct the amount from the commission wallet and create a withdrawal transaction
3. WHEN a withdrawal request exceeds the available balance, THE MLM System SHALL reject the request and display an error message
4. WHEN a withdrawal is processed, THE MLM System SHALL record the withdrawal transaction with timestamp and amount
5. WHERE a minimum withdrawal amount is configured, WHEN a member requests a withdrawal below the minimum, THE MLM System SHALL reject the request

### Requirement 8: Data Persistence and Integrity

**User Story:** As a system administrator, I want all member data, transactions, and genealogy relationships to be persisted reliably, so that the system maintains data integrity and can recover from failures.

#### Acceptance Criteria

1. WHEN any transaction occurs, THE MLM System SHALL persist the transaction data immediately to permanent storage
2. WHEN wallet balances are updated, THE MLM System SHALL ensure the update is atomic and maintains consistency
3. WHEN genealogy relationships are established, THE MLM System SHALL persist the relationships and prevent orphaned members
4. WHEN the system restarts, THE MLM System SHALL restore all member accounts, wallet balances, and genealogy structures from persistent storage
5. WHEN concurrent transactions occur for the same member, THE MLM System SHALL serialize the transactions to prevent race conditions and maintain balance accuracy