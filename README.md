# Technical Challenge – Full-Stack Task Manager (Next.js 15 & tRPC)

This repository contains the complete solution for the software engineering technical challenge, covering in-depth theoretical foundations regarding rendering strategies and web backend architectures, as well as a modern full-stack practical application featuring end-to-end type safety.

---

## 📁 Repository Structure

The project is organized into two main modules:

```text
.
├── parte-1/                 # Theoretical architectural questions
│   ├── README.md            # Overview of the theoretical module
│   └── part_1_theoretical_questions_answers.pdf         # In-depth answers for CSR, SSR, SSG, and tRPC
│
├── parte-2/                 # Practical application (Full-Stack Next.js 15 + tRPC)
│   ├── README.md            # Technical documentation and execution guide
│   ├── package.json         # Project configuration, scripts, and dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── src/                 # Application source code
│       ├── app/             # Next.js App Router routes and API handlers
│       ├── components/      # UI components (TaskList, TaskCard, TaskForm, UI alerts)
│       ├── server/          # tRPC backend, Services, Repositories, and Zod schemas
│       └── trpc/            # tRPC clients (Client Components & Server SSR helpers)
│
├── .gitignore               # Ignores build artifacts, node_modules, and env files
└── README.md                # Root project documentation
```

---

## 🎯 Module Summary

### [Part 1 – Theoretical Questions](./parte-1/part_1_theoretical_questions_answers.pdf)
* **React & Next.js Rendering Strategies:** Comprehensive comparative analysis of Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG), evaluating trade-offs across SEO, Time to First Byte (TTFB), First Contentful Paint (FCP), interactivity, and practical use cases.
* **Backend Architectures & tRPC:** Systematic evaluation of modern web backend approaches (Monolith, Microservices, Serverless/Edge, BFF) and critical assessment of tRPC regarding security, type inference, coupling, and scalability.

### [Part 2 – Practical Application](./parte-2/README.md)
* Full-stack Task Management application built with **Next.js 15**, **React 19**, **TypeScript**, **tRPC**, and **Tailwind CSS**.
* **Layered Architecture:** Strict separation of concerns across `Router` (transport and I/O), `Service` (domain business logic), and `Repository` (memory persistence resilient to Next.js HMR).
* **Rendering:** Server-Side Rendering (SSR) with data prefetching on the initial page load, dehydrated into seamless client hydration supporting reactive mutations and Infinite Scrolling.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** `>= 18.18` (Node.js 20 or 22 LTS recommended).
* **npm** or equivalent package manager.

### Running the Application (Part 2)

```bash
# 1. Navigate to the application directory
cd parte-2

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the Automated Tests

```bash
cd parte-2
npm run test
```
