# 🚀 Cortex Professional: The Professional Monorepo Plan

## 🌟 The Vision
Transform **Cortex** into a "Professional Monorepo"—a centralized control center where you manage your career (CV and Portfolio) alongside your private life (Finances, Logs). The goal is to have a single source of truth for your professional identity that is data-driven, automated, and high-performance.

---

## 🏗️ Architectural Overview

### 1. Sidebar & Navigation (The UI Foundation)
The sidebar in `layouts/default.vue` will be refactored to include a **Non-Interactive Placeholder** for organization.

```text
📂 SIDEBAR STRUCTURE
--------------------
🏠 Dashboard

[ PROFESSIONAL ]      <-- Category Label (Non-clickable)
  |-- 👤 Profile       (Existing: Edit your bio, links, and languages)
  |-- 📄 My CV         (New: Code-driven, print-ready interactive resume) (My existing cv is in ~/server/assets/CV-AI-FOCUSED.html)
  |-- 💼 Portfolio     (New: Visual Project Showcase / "S" Repo integration) (can you create a porfolio from scratch? this is a question i need you to response) 
  `-- 🔍 Opportunities (New: Job feed scraped from LinkedIn, X, and the web) (i don't want to implement this for now just have the page there)

📝 Log
💰 Finances
🎓 Knowledge
```

### 2. The "CV-as-Code" Engine (`/profile/cv`)
A high-fidelity, dynamic version of your `CV-AI-FOCUSED.html`.
*   **Data-Driven:** Pulls directly from `profile_experience`, `profile_skills`, etc., in PostgreSQL.
*   **Print-to-PDF:** Uses specialized `@media print` CSS so that `Ctrl+P` or a "Download" button generates a pixel-perfect, ATS-friendly PDF.

### 3. The Project Showcase (`/profile/portfolio`)
A visual gallery replacing your static `varscr.github.io` site.
*   **Project Cards:** Interactive cards for Kargo, Manasara, and Cortex.
*   **Centralized Updates:** Updating a project in the database automatically updates both the Portfolio and the CV.

(I think we can create it form scratch and connect it with the actual git hub repo i have just give me the instrcutions if we can change it form this repo and make commits form here that would be greate, that's what i want, ask me if you don't understand)

### 4. Job Opportunity Intelligence (`/profile/opportunities`)
An automated feed of job opportunities scraped from LinkedIn, X (Twitter), and configurable websites, matched against your profile skills and experience.

*   **Sources:** LinkedIn job search pages, X hashtags (`#hiring`, `#jobopening`, `#remotejobs`), and any custom URL (company career pages, job boards).
*   **AI Matching:** Each opportunity is embedded and scored against your `profile_skills` and `profile_experience` vectors — top matches surface first.
*   **Deduplication:** Content hash prevents storing the same posting twice.
*   **Actions:** Mark as `saved`, `applied`, `rejected`, or `ignored` to track your pipeline.

(just create like the sections and idea but remmeber we don't want to implement the scrapper just the idea and the page to implement in the future)
---

(You can change the technical dessition)
## 🛠️ Technical Strategy

### 📡 Data Flow
1.  **Storage:** PostgreSQL (existing `profile_*` schema).
2.  **API:** Nitro server routes (`/api/profile/...`) fetch data.
3.  **Frontend:** Nuxt 3 components (in `components/profile/`) render the UI.

### 🚀 Deployment (The "Wall")
To keep your private data hidden while sharing your portfolio with recruiters:
*   **Automation:** A GitHub Action runs `nuxt generate` on push.
*   **Branch Isolation:** The Action "carves out" only the public routes (`/cv`, `/portfolio`) and pushes them to a `portfolio` or `gh-pages` branch.
*   **Public Site:** Your public domain (e.g., `varscr.github.io`) points to this clean, static branch.

---

## 📅 Phase-by-Phase Implementation

### Phase 1: Navigation & Layout
*   Update `layouts/default.vue` with the `[ PROFESSIONAL ]` placeholder.
*   Create `pages/profile/cv.vue` and `pages/profile/portfolio.vue`.

### Phase 2: Backend & Data Integration
*   Verify and seed the `profile_*` database tables with your HTML CV content.
*   Update/Create Nitro API routes to serve this data.

### Phase 3: The Interactive CV (My CV)
*   Build the UI using Tailwind CSS based on the `CV-AI-FOCUSED.html` template.
*   Implement the `@media print` engine and "Download PDF" button.

### Phase 4: The Project Showcase (Portfolio)
*   Build visual cards for your top projects.
*   Integrate content from your current `varscr.github.io`.

### Phase 5: CI/CD Automation
*   Configure the GitHub Action for automated static extraction and branch deployment.

### Phase 6: Job Opportunity Intelligence 

---

## 🔗 References
*   **Portfolio:** [varscr.github.io](https://varscr.github.io/)
*   **LinkedIn:** [linkedin.com/in/fabio-vargas](https://www.linkedin.com/in/fabio-vargas/)
*   **Source CV:** `~/Documents/me/curriculumVitae/CV-AI-FOCUSED.html`
