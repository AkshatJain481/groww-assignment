# 📊 Next.js Finance Dashboard Builder

A fully responsive **dashboard builder** built with **Next.js 15**,
**TypeScript**, **TailwindCSS**, **shadcn/ui**, and **Zustand** for
centralized state management.\
This project demonstrates dynamic widget creation with charts, tables,
and cards --- all configurable directly from the UI.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   **Next.js 15+**
-   **TypeScript**
-   **TailwindCSS**
-   **shadcn/ui** (for accessible UI components)
-   **Zustand** (for central state management with persistence)

------------------------------------------------------------------------

## ✨ Features

-   ➕ **Add, update, and delete widgets**
-   📊 **Charts:** Line graphs and Bar charts
    -   Chart data must come from a **single consistent array** for
        proper mapping with the x-axis.\
    -   Values from different arrays cannot be mixed with the same
        x-axis.
-   📋 **Tables:**
    -   If multiple arrays are selected, **separate tables** will be
        created automatically.\
    -   Each array generates its own table rows.
-   🗂️ **Cards:** Simple data display in a styled card format.
-   🔄 **Refresh button** for widgets
-   🗑️ **Delete button** for widgets
-   ↔️ **Drag-and-drop (DnD)** to reorder widgets
-   🌓 **Light and Dark mode** support
-   📱 **Fully responsive UI**

------------------------------------------------------------------------

## ⚡ Setup Instructions

1.  Clone the repository:

    ``` bash
    git clone <your-repo-url>
    cd <your-repo>
    ```

2.  Install dependencies:

    ``` bash
    pnpm install
    # or
    npm install
    ```

3.  Run the development server:

    ``` bash
    pnpm dev
    # or
    npm run dev
    ```

4.  Open <http://localhost:3000> in your browser.

------------------------------------------------------------------------

## ⚠️ Important Notes

### 1. CORS & API Keys

Since this is a **frontend-only project**, API requests are made
directly from the browser.\
Some APIs (e.g., Finnhub) **do not allow direct browser calls** and
throw **CORS errors**.\
- This is expected behavior --- normally you would use a **backend
proxy** to handle authentication and hide API keys.\
- For testing, please use APIs that support direct client-side calls or
provide dummy/test keys.

### 2. Stock Charts & Intervals

The assignment requirement mentioned: \> *"Candle or Line graphs showing
stock prices over different intervals (Daily, Weekly, Monthly)"*

However, in a **generic dashboard builder** where users provide
arbitrary APIs, this is not always feasible because: - Different APIs
have **different date formats** (e.g., `2025-09-03`, UNIX timestamps,
`Sept-2025`). - Intervals (`daily`, `weekly`, `monthly`) are
**API-specific** (`1d`, `daily`, `timeframe=1d`, etc.).

📌 Therefore, this project supports **configurable x-axis keys** and
charts render based on the data provided, but **automatic interval
normalization is not possible** without backend schema standardization.

------------------------------------------------------------------------

## 📂 Project Structure

    src/
     ├─ app/              # Next.js app directory
     ├─ components/       # Reusable components (widgets, UI, etc.)
     ├─ store/            # Zustand store for state management
     ├─ lib/              # Utility functions
     ├─ hooks/            # Hooks

------------------------------------------------------------------------

## ✅ Conclusion

This project showcases a **frontend-only dashboard builder** with widget
management, state persistence, charts, tables, and full responsiveness.\
It is intended as a demonstration of **frontend engineering skills**
with best practices in **state management** and **UI/UX**.

------------------------------------------------------------------------

👨‍💻 Built with ❤️ using Next.js, Tailwind, shadcn, and Zustand.
