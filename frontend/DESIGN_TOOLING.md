# Frontend Design Tooling

`shadcn/ui` is the main component system for the frontend app. Prefer adding or composing local shadcn components before reaching for custom one-off UI patterns.

`21st.dev` is the source for polished component inspiration. Use it to find strong `shadcn` and Tailwind ideas, then adapt those ideas into this repo's local components instead of pasting in unrelated stacks.

See [DESIGN_SYSTEM.md](/Users/matthewkim/Documents/GitHub/plai/frontend/DESIGN_SYSTEM.md) for the visual direction, layout rules, and current component boundaries intended for iterative redesign work.

The Claude Frontend Design plugin is the preferred tool for generating or refining layouts. Give it concrete constraints:

- stay inside the existing React + Vite app
- use local `shadcn/ui` components first
- avoid touching backend, gesture, tracking, or audio logic unless the task explicitly requires it

Generated UI should be cleaned up before committing. Remove dead variants, unused wrappers, placeholder copy, and any styling that does not match the product.

Avoid unnecessary design libraries. If a layout can be built with `shadcn/ui`, Tailwind, and small local components, keep it that way.
