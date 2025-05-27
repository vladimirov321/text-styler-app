# Text Styler Application (Monorepo)

This repository contains the "Text Styler" application, an LLM-based service designed to fix grammar and style issues in a given piece of text. The project is structured as a monorepo.

## 📝 Overview

The primary goal of this application is to provide a REST endpoint that:
1. Receives text to improve.
2. Returns JSON with the improved text, leveraging a Large Language Model (LLM).

## 📂 Monorepo Structure
-   **`apps/`**: Contains individual, deployable applications.
    -   **`text-styler-api/`**: The core Node.js/Express.js REST API service that handles text improvement requests using an LLM.
-   **`packages/`**: (Placeholder for potential shared libraries, e.g., shared types, utility functions) - *Currently not used for the core task but structured for future scalability.*

## ✨ Features

**Core Requirements:**
-   [ ] REST endpoint (`GET /improve-text`) that accepts text via a query parameter.
-   [ ] Returns JSON with the improved text: `{"improved_text": "..."}`.
-   [ ] Integration with an LLM (e.g., OpenAI API) for text improvement.

**Bonus Tasks:**
-   [ ] **Caching:** Implement caching to avoid redundant LLM calls for identical input text.
-   [ ] **Queue-based Interface:** (To be discussed/implemented if time permits) Design or implement a queue-based interface for the text improvement logic.

## 🛠️ Tech Stack

-   **Backend API (`apps/text-styler-api`):**
    -   Node.js
    -   Express.js (Web Framework)
    -   TypeScript
    -   OpenAI API
-   **Containerization:** Docker
-   **Testing:** Mocha/Chai
-   **Code Quality:** ESLint, Prettier

## 🚀 Getting Started

### Prerequisites

-   Node.js
-   npm
-   Git
-   An API key for the chosen LLM provider

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd text-styler-app
    ```

2.  **Install dependencies:**
    This command installs dependencies for all workspaces from the root of the monorepo.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    The `text-styler-api` service requires an API key for the LLM.
    Create a `.env` file in the `apps/text-styler-api/` directory:
    ```bash
    # In apps/text-styler-api/.env
    OPENAI_API_KEY=your_openai_api_key_here
    PORT=3000 # Optional: specify a port for the API
    ```
    *Note: `.env` files are ignored by Git (ensure `.env` is in your `.gitignore` file).*

### Development
Make sure to first copy .env.example to .env and fill in the values.

To run the `text-styler-api` in development mode (with auto-reloading):

1.  **Navigate to the root of the monorepo (`text-styler-app/`).**
2.  **Run the development script:**
    ```bash
    npm run dev:api
    ```

### Building for Production

To build the `text-styler-api` for production:

1.  **Navigate to the root of the monorepo.**
2.  **Run the build script:**
    ```bash
    npm run build:api
    ```

    The compiled JavaScript files will be in `apps/text-styler-api/dist/`.

### Running in Production

After building, you can start the API:
```bash
npm run start:api
