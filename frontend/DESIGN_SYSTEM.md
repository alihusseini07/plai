# Design System

## Direction

The frontend should feel like a dark, minimal music-tech tool:

- dark surfaces with restrained contrast
- focused, studio-like UI rather than playful consumer gradients
- functional-first layouts where the camera stage and controls stay visually dominant

Avoid generic AI dashboard patterns such as oversized KPI grids, unnecessary glassmorphism, noisy gradients, or placeholder-heavy marketing sections.

## Component Rules

- `shadcn/ui` is the main component system
- prefer composition of local `shadcn` components over custom one-off wrappers
- do not introduce extra design libraries unless there is a concrete gap that `shadcn/ui` and Tailwind cannot cover
- keep components modular so Claude can redesign one section at a time

## Layout Rules

- separate the app into clear sections: launch, camera, controls, status, and session output
- keep each section in its own component with a narrow responsibility
- avoid hardcoded layout hacks and deeply nested JSX
- preserve stable boundaries around functional logic so visual refactors do not touch gesture, backend, or audio code

## Spacing And Typography

- use consistent card-based spacing with `gap-4`, `gap-6`, and `p-4` or `p-6` as defaults
- keep typography compact and legible
- reserve large headings for page or section entry points only
- prefer short descriptive copy over decorative text

## Claude Workflow

When using the Claude Frontend Design workflow:

- ask for redesigns at the component or section level
- treat `21st.dev` as inspiration for composition and polish, not a second component system
- require generated UI to reuse the local `shadcn/ui` primitives already in the repo
- clean up generated markup before commit and remove dead wrappers, unused variants, and fake controls

## Current Boundaries

Claude should be able to redesign these surfaces independently:

- `LaunchScreen` for pre-session setup
- `SessionWorkspace` for active layout structure
- `Stage` for the camera frame presentation only
- `SessionPanel` for save and backing-track output
