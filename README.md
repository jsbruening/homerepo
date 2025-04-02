# HomeRepo - Home Management System

HomeRepo is a comprehensive home management application built with React, TypeScript, Tailwind CSS, and Supabase. It helps homeowners organize and track various aspects of their home, including paint colors, maintenance services, plant care, and house reminders.

## Features

- **Dashboard**: Overview of all key home information at a glance
- **Paint**: Track paint colors used in different rooms
- **Home Services**: Schedule and track maintenance services
- **Plants**: Manage your plant collection with care information
- **House Reminders**: Set and track reminders for home-related tasks

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **State Management**: React Query
- **Routing**: React Router
- **Backend**: Supabase (PostgreSQL database with RESTful API)
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/home-repo.git
   cd home-repo
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the migration SQL script located in `supabase/migrations/20231001000000_init.sql` to set up the necessary tables and relationships

## Project Structure

```
home-repo/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and API services
│   ├── pages/           # Page components
│   ├── types/           # TypeScript interfaces and types
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # Entry point
│   └── vite-env.d.ts    # Vite environment declarations
├── supabase/
│   └── migrations/      # Database migration files
├── .env                 # Environment variables (create this)
├── index.html           # HTML entry
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Development

### Adding a New Feature

1. Create necessary TypeScript interfaces in `src/types`
2. Add API service functions in `src/lib/api.ts`
3. Create UI components in `src/components`
4. Implement the page component in `src/pages`
5. Add the route in `src/App.tsx`

### Database Migrations

For database schema changes:

1. Create a new migration file in `supabase/migrations/`
2. Apply the migration to your Supabase project
3. Update the TypeScript interfaces accordingly

## Deployment

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the contents of the `dist` folder to your hosting provider of choice (Vercel, Netlify, etc.)

## License

MIT
