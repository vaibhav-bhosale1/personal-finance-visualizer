# Personal Finance Visualizer

A simple web application for tracking personal finances with visualizations.

## Features

This application implements the following features across three stages:

### Stage 1: Basic Transaction Tracking
- Add/Edit/Delete transactions (amount, date, description, type).
- Transaction list view.
- Single chart: Monthly expenses bar chart.
- Basic form validation.

### Stage 2: Categories
- All Stage 1 features.
- Predefined categories for transactions (can be extended via API if needed).
- Category-wise pie chart for expenses.
- Dashboard with summary cards: total expenses, total income, net savings, most recent transactions.

### Stage 3: Budgeting
- All Stage 2 features.
- Set monthly category budgets.
- Budget vs actual comparison chart.
- Simple spending insights based on budgets and actual spending.

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI Components:** shadcn/ui
- **Charting Library:** Recharts
- **Database:** MongoDB (with Mongoose ORM)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/personal-finance-visualizer.git](https://github.com/your-username/personal-finance-visualizer.git)
    cd personal-finance-visualizer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your MongoDB connection URI:
    ```
    MONGODB_URI="your_mongodb_connection_string"
    ```
    (e.g., `mongodb+srv://user:password@cluster.mongodb.net/personal_finance?retryWrites=true&w=majority`)

4.  **Run the development server:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
