# AI System Rules

## Purpose

This project contains reusable UI components, layouts, modules, and functional patterns that must be reused whenever possible.

The AI agent should treat this codebase as a structured system—not a blank canvas.

Before generating new pages, modules, workflows, or features:

- inspect existing components
- inspect existing layouts
- inspect existing module patterns
- reuse current implementations
- maintain design consistency

Do not generate unnecessary new UI patterns when reusable references already exist.

---

# Core AI Principles

## 1. Reuse Before Creating

Always search for existing components before creating new ones.

Check for:

- tables
- forms
- modals
- drawers
- cards
- tabs
- filters
- buttons
- alerts
- charts
- loaders
- empty states

### Rule

If an existing component solves 70–80% of the requirement:

→ reuse it  
→ extend it if necessary  
→ avoid rebuilding from scratch

---

# 2. Build Through Composition

New modules should be assembled using existing building blocks.

Example:

User Management Module

- page layout
- search filters
- data table
- create modal
- edit modal
- detail drawer

This should be composed from existing components.

Do not build monolithic modules.

---

# 3. Maintain Design Consistency

Follow existing:

- spacing
- typography
- colors
- shadows
- border radius
- button styles
- input patterns
- navigation structures

Never introduce inconsistent UI styling.

---

# 4. Follow Existing Folder Architecture

Always place files in their correct locations.

Example:

```bash
/components
/pages
/composables
/stores
/services
/types
/utils
```

Do not create random folders unless necessary.

---

# 5. Follow Existing State Management Patterns

Reuse existing patterns for:

- API calls
- stores
- caching
- loading states
- error handling
- optimistic updates

Do not introduce new state patterns unless required.

---

# UI Reuse Rules

## Tables

Use existing table components for:

- list pages
- admin records
- reporting pages
- transaction lists

Common table features:

- sorting
- pagination
- search
- bulk actions
- export
- row actions

Do not build raw tables manually.

---

# Forms

Use existing form systems for:

- create
- edit
- onboarding
- settings
- profile updates

Reuse:

- validation logic
- dynamic fields
- form layouts
- multi-step forms

---

# Modals

Use modals for:

- quick create
- quick edit
- confirmations
- alerts

Avoid using modals for large workflows.

Use full pages instead.

---

# Drawers / Slideovers

Use drawers for:

- record details
- quick edits
- contextual information

---

# Dashboard Components

Reuse existing:

- KPI cards
- charts
- analytics widgets
- recent activity sections

---

# Empty States

Always handle:

- no records
- no search results
- onboarding empty states

---

# Required States

Every module must handle:

- loading
- success
- empty
- error
- permission restrictions

---

# Module Generation Rules

When building a new module:

## Step 1: Understand requirement

Identify:

- business goal
- users
- workflows
- CRUD needs
- reporting needs

---

## Step 2: Search existing references

Find:

- reusable components
- reusable layouts
- reusable workflows

---

## Step 3: Compose solution

Build using:

- reusable UI
- reusable business logic
- reusable API layers

---

## Step 4: Extend only when necessary

Create new components only if existing ones cannot support the requirement.

---

# Functional Pattern Rules

Reuse existing flows for:

- approval systems
- checkout systems
- onboarding flows
- dashboards
- CRUD modules
- settings pages
- reporting modules

Do not reinvent workflows unnecessarily.

---

# Code Quality Rules

Generated code must be:

- modular
- maintainable
- readable
- scalable
- typed (if project uses TypeScript)
- reusable

Avoid:

- duplicated logic
- hardcoded values
- large components
- deeply nested logic

---

# Naming Rules

Follow existing naming conventions.

Examples:

```bash
UserTable.vue
UserForm.vue
UserModal.vue
useUsers.ts
user.service.ts
```

Do not introduce inconsistent naming.

---

# Performance Rules

Prefer:

- lazy loading
- pagination
- memoization
- efficient API calls
- reusable computed logic

Avoid unnecessary heavy rendering.

---

# Code Style & Comment Rules

Follow existing code style and comment standards.

## Comment Standards

- **Section Headers**: Use block comments for major sections: `// === Header ===`
- **JSDoc Patterns**: Use JSDoc for composables and complex utility functions.
- **Intent focus**: Explain "why" something is done, not just "what" the code does.
- **Action Tags**: Use `TODO:` for future work and `FIXME:` for known issues.

---

# Prohibited AI Behavior

Do NOT:

- redesign working systems
- duplicate components
- ignore architecture
- introduce random dependencies
- create inconsistent UI patterns

---

# Final Decision Framework

Before generating anything, ask:

1. Does this already exist?
2. Can this be reused?
3. Can this be extended?
4. Is a new component truly necessary?

If reusable components exist:

USE THEM FIRST.