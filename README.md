# MLM Wallet System

A comprehensive Multi-Level Marketing (MLM) Wallet Management System built with Next.js, TypeScript, and MongoDB.

## Features

- 🔐 Member registration and authentication
- 💰 Dual wallet system (Main Wallet & Commission Wallet)
- 📦 Package purchase management
- 🌳 Binary genealogy tree structure
- 💸 Automated commission calculations
- 📊 Transaction history and reporting
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** NextAuth.js
- **Testing:** Jest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ItsVikasA/MLM-Wallet-System.git
cd MLM-Wallet-System
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your MongoDB connection string and other settings.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
mlm-wallet-system/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── genealogy/        # Tree visualization
│   └── wallet/           # Wallet components
├── lib/                   # Utility functions
│   ├── db/               # Database connection
│   └── utils.ts          # Helper functions
├── models/                # Mongoose models
├── services/              # Business logic
├── types/                 # TypeScript types
└── __tests__/            # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:properties` - Run property-based tests

## Documentation

- [Requirements](.kiro/specs/mlm-wallet-system/requirements.md)
- [Design Document](.kiro/specs/mlm-wallet-system/design.md)
- [Implementation Tasks](.kiro/specs/mlm-wallet-system/tasks.md)
- [Technology Stack](.kiro/specs/mlm-wallet-system/technology-stack.md)

## License

MIT
