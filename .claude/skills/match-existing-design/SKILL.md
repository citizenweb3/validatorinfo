---
name: match-existing-design
description: >
  Study and replicate the existing UI design before writing any frontend code.
  Use this skill whenever a task involves creating or modifying UI components,
  pages, styles, or anything visible to the user. This includes new components,
  style changes, layout modifications, and visual bug fixes. The goal is to
  match the existing project design exactly — never invent new styles.
---

# Match Existing Design

You are working on a project with an established design system. Your job is not
to design something new — it is to study what already exists and replicate it
precisely. Every project has its own visual language: colors, fonts, spacing,
component patterns, shadows, borders. You need to learn that language before
writing a single line of UI code.

Why this matters: when you skip this step, you produce code that "works" but
looks foreign — wrong colors, wrong fonts, wrong spacing, components that
duplicate existing ones. The result is a PR full of review comments about
style violations and wasted iteration cycles.

## The Process

Follow these steps in order. Do not skip any step.

### Step 1: Read the design infrastructure

Read these files to understand what design tokens exist:

```
tailwind.config.ts    — custom colors, fonts, shadows, screens, spacing
src/**/globals.css    — CSS variables, custom utilities, base styles
```

Do NOT memorize a table of tokens. Instead, understand the system:
- What color names does this project use? (they are NOT standard Tailwind)
- What font families are defined?
- What custom shadows exist?
- What breakpoints are configured?

### Step 2: Find similar components

Before creating any new component, search for existing ones that do
something similar. Use DeepContext, grep, or file browsing:

```
search_codebase "tooltip"
search_codebase "chart component"
search_codebase "status badge"
search_codebase "card layout"
```

Also browse the common components directory:
```
src/app/[locale]/components/common/
```

Read at least 2-3 components that are visually similar to what you need
to build. Pay attention to:
- Which Tailwind classes they use (these are your vocabulary)
- How they handle hover, active, disabled states
- How they use responsive breakpoints
- Whether they use `cn()`, `twMerge`, or plain className strings
- How they import and use translations

### Step 3: Read the target page

Read the page or component where your changes will appear. Understand:
- What components are already on this page?
- What layout pattern does it use?
- What className patterns are repeated?
- Is it a server component or client component?

### Step 4: Extract patterns (write them down)

Before writing code, write a short summary of what you learned:

"This page uses font-handjet for headings, bg-table_row for list items,
border-bgSt for dividers. The existing chart component uses bg-card for
the container, text-highlight for labels. Hover states use hover:bg-bgHover.
There's an existing Tooltip component in common/ that I should reuse."

This is your design brief. Refer to it while coding.

### Step 5: Reuse, don't reinvent

Check if any of these already exist before creating new ones:
- Button, Tooltip, PageTitle, BaseTable, BaseTableRow
- Loading skeletons, error states, empty states
- Layout wrappers, card containers

If a common component exists, use it. If you need slight modifications,
extend it — don't duplicate it.

### Step 6: Write code that blends in

Your new code should be indistinguishable from existing code on the same page.
Someone reading the page source should not be able to tell which parts are
new and which are old. This means:
- Same className patterns (if the page uses `bg-card rounded-lg p-4`,
  your new section uses the same)
- Same font choices (if headings use `font-handjet text-xl text-highlight`,
  yours do too)
- Same spacing rhythm
- Same border and shadow patterns

## Architecture Rules

These apply to all code, not just UI:

- **Service layer**: ALL database queries go through `src/app/services/`.
  API routes (`route.ts`) only parse params, call the service, and return
  the response. Never put Prisma queries in route.ts.
- **Existing services**: Check `src/app/services/` for a service that
  already handles your data before creating a new one.
- **Props pattern**: Use `interface OwnProps` for components,
  `interface PageProps` for pages.
- **SSR first**: Use server components unless you genuinely need
  client-side interactivity (useState, useEffect, event handlers).

## Checklist

Before submitting your UI code, verify:

- [ ] I read tailwind.config.ts and globals.css
- [ ] I read 2-3 similar existing components
- [ ] I read the target page
- [ ] I reused existing common components where possible
- [ ] I used ONLY project color/font/shadow tokens (no standard Tailwind)
- [ ] My code visually matches the surrounding page
- [ ] DB queries go through a service, not directly in route.ts
- [ ] All user-facing strings use translations (all 3 locale files updated)
