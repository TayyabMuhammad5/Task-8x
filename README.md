# Higgsfield AI Clone

A modern, responsive clone of the Higgsfield AI web application built with **React**, **TypeScript**, and **Vite**. This application features a premium dark-mode aesthetic with neon-lime accents, smooth animations, and a seamless user experience for AI media generation.

## 🚀 Features

### 1. Landing Page
- High-conversion hero section matching the sleek aesthetic of the original Higgsfield design.
- Direct "Start Creating ✦" CTA leading users seamlessly into the generation flow.

### 2. AI Generation Studio (`#/create`)
- **Dual-Column Layout**: A fixed left sidebar for controls and a scrolling main area for results.
- **Model Selection**: Switch effortlessly between video and image generation models.
- **Dynamic Mode Toggling**: Choose between `Video` and `Image` modes. The UI restricts the model list based on the selected mode.
- **Real Image Generation**: Integrates with the [Pollinations.ai](https://pollinations.ai/) API to generate real images directly in the browser (Video models use a mock generation flow for demonstration purposes).
- **Prompt Input**: A spacious, user-friendly textarea for describing your desired visual output.

### 3. Generation History & Gallery (`#/gallery`)
- Browse past generations in a clean grid layout.
- **Status Badges**: Real-time visual indicators for `pending`, `completed`, and `failed` generations.
- **Relative Timestamps**: Friendly time formats (e.g., "Just now", "5m ago").
- Empty states with clear calls-to-action to encourage user engagement.

### 4. Authentication & State
- Secured by **Supabase**.
- Complete authentication flow including Sign Up, Sign In, and secure session management.
- User generation history and credit tracking are persisted securely in the database.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with modern flexbox/grid layouts and CSS animations
- **Backend/Auth**: Supabase (PostgreSQL, GoTrue Auth)
- **AI Integration**: Pollinations AI (for image models: `flux`, `flux-realism`, `flux-anime`)

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TayyabMuhammad5/Task-8x.git
   cd Task-8x
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup:
   Run the SQL script provided in `supabase-migration.sql` in your Supabase SQL Editor to initialize the necessary tables (`profiles`, `generations`) and their respective RLS policies.

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Build for Production

To build the project for production, run:
```bash
npm run build
```
This command compiles TypeScript and bundles the application using Vite into the `dist/` directory.

## 🎨 Design System
The app uses a carefully crafted token system defined in `src/index.css`:
- **Surface & Cards**: `#141418`, `#1a1a1e`
- **Borders**: `#2a2a2e`
- **Accents (Primary)**: `#d4ff00` (Neon Lime)
- **Typography**: `Inter` font family

## 📝 License
This project is for educational/demonstration purposes as part of a task assignment.
