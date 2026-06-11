# jsOS: JuviScript Interactive Desktop Portfolio

A portfolio site built as an interactive desktop environment using Vue 3, TypeScript, and Vite.

Instead of presenting my work in a traditional scrolling layout, this project recreates the feeling of exploring a personal operating system. Visitors can open projects, browse certifications, view my resume, interact with widgets, and navigate a mobile version of the experience depending on screen size.

## Highlights

- Custom desktop-style portfolio experience with icons, taskbar behavior, widgets, and app windows
- Mobile-specific shell with its own app navigation and switching flow
- Structured project and certification data for easy content updates
- Interactive project viewer with screenshot galleries
- Personality-driven UI touches like boot sequences, companion interactions, and themed presentation

## Why I Built It

This project was designed to do more than simply display project cards and links. I wanted the portfolio itself to feel like a product experience: something that could reflect how I think about interaction design, front-end architecture, and polish.

It is both a portfolio and a small UI systems exercise. The goal is to show not only what I have built, but also how I approach presentation, usability, responsiveness, and creative front-end implementation.

## Tech Stack

- Vue 3
- TypeScript
- Vite

## Running Locally

### Prerequisites

- Node.js 20+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Project Structure

The repo is organized so the interface code and the portfolio content stay easy to maintain separately.

```text
src/
|- assets/         Icons, PDFs, music, and project screenshots
|- components/     Vue components grouped by feature area
|  |- apps/        App-like portfolio views
|  |- boot/        Desktop and mobile boot flows
|  |- shared/      Shared UI helpers
|  |- shell/       Desktop/mobile shells, taskbar, app windows, companion UI
|  `- widgets/     Widgets and widget-related layout
|- composables/    Shared state and reusable behavior
|- data/           Structured portfolio content
|- App.vue         Top-level desktop/mobile switch
|- main.ts         Application entry point
`- style.css       Global tokens and base styling
```

## Content Structure

Most editable portfolio content lives in `src/data`.

- `src/data/Projects.ts`
  Project descriptions, technologies, links, and screenshots

- `src/data/Certifications.ts`
  Certification entries and linked files

- `src/data/DesktopApps.ts`
  Desktop icon/app definitions and default window sizing

- `src/data/MusicTracks.ts`
  Music widget track data

- `src/data/Widgets.ts`
  Widget registration for desktop and mobile surfaces

Most supporting media lives in `src/assets`.

- `src/assets/project-previews/`
  Project screenshots and preview images

- `src/assets/project-icons/`
  Project-specific icons

- `src/assets/certifications/`
  Certification PDFs and related icons

- `src/assets/music/`
  Audio for the music widget

## Notes

There are also a few optional issue-management scripts in `package.json` for repo planning and workflow, but they are not required to run the project locally.
