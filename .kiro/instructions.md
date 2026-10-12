# Admin Dashboard Instructions

## Form Implementation Guidelines

### Required: React Hook Form with Zod Resolver

All forms in this project MUST use the combination of:
- **react-hook-form** - For form state management
- **@hookform/resolvers/zod** - For schema validation
- **zod** - For defining validation schemas

### Standard Form Pattern

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema with Zod
const MyFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  age: z.coerce.number().min(0).max(120),
  isActive: z.boolean().default(true),
});

type MyFormData = z.infer<typeof MyFormSchema>;

// 2. Use react-hook-form with zodResolver
function MyForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MyFormData>({
    resolver: zodResolver(MyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 0,
      isActive: true,
    },
  });

  const onSubmit = (data: MyFormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="number" {...register("age")} />
      {errors.age && <span>{errors.age.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Key Points

1. **Always define a Zod schema** for form validation
2. **Use `z.coerce`** for number inputs to handle string-to-number conversion
3. **Use `zodResolver`** when initializing useForm
4. **Type the form data** using `z.infer<typeof Schema>`
5. **Display validation errors** from `formState.errors`
6. **Use `setValue`** for controlled components like Select, Switch, etc.
7. **Use `watch`** to reactively get current form values
8. **Use `reset`** to clear/reinitialize the form

### DO NOT

- ❌ Use plain useState for form fields
- ❌ Write custom validation logic
- ❌ Skip TypeScript types for form data
- ❌ Forget to handle and display validation errors

---

## TypeScript Strictness

- No `any` type - always provide proper typings
- Use `unknown` for truly unknown types, then narrow with type guards
- Import types with `type` keyword: `import type { Foo } from "./foo"`

## Hook Memoization

- Use `useCallback` for functions passed as props or used in dependency arrays
- Use `useMemo` for expensive computations

## Component Patterns

- Use custom toggle buttons instead of Switch component (not available)
- Follow existing modal patterns in `/components/modals/`

---

## Git Safety

**IMPORTANT:** Never commit or push to any repository without explicit user permission. Always ask before:
- `git add`
- `git commit`
- `git push`
- Any destructive git operations (`reset`, `force push`, etc.)

---

## Git Commit Guidelines

### Commit Message Format
Use semantic commit messages with the following format:
```
<type>(<scope>): <short description>

[optional body with more details]
```

### Commit Types
| Type | Description |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no new features or fixes) |
| `style` | Code style changes (formatting, whitespace) |
| `docs` | Documentation changes |
| `chore` | Build, config, or maintenance tasks |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |

### Scope Examples
- `auth` - Authentication related
- `ui` - UI components
- `theme` - Theme/styling changes
- `schedule` - Schedule management
- `ca` - Campus Ambassador
- `admin` - Admin management
- `layout` - Layout components (sidebar, topbar)

### Grouping Commits
**Group related changes into a single commit.** Changes for the same feature/fix should be in one commit:

```bash
# ✅ CORRECT - Related changes grouped together
git commit -m "feat(schedule): add schedule management page

- Add schedule page with tabbed interface
- Add useSchedule hooks for CRUD operations
- Add Schedule link to sidebar navigation"

# ❌ WRONG - Splitting related changes
git commit -m "feat(schedule): add schedule page"
git commit -m "feat(schedule): add schedule hooks"
git commit -m "feat(layout): add schedule to sidebar"
```

### Rules
1. **One feature = One commit** - Don't split a feature across multiple commits
2. **Keep commits atomic** - Each commit should be self-contained and buildable
3. **Use present tense** - "add feature" not "added feature"
4. **Be concise but descriptive** - Short description under 72 chars
5. **Add body for complex changes** - List major changes in bullet points

### Examples
```bash
# Feature with multiple files
feat(theme): add Royal theme with gold topbar

- Update Topbar with theme-aware styling
- Add gold gradient for Royal theme topbar
- Update ThemeToggle button styling

# Bug fix
fix(layout): add proper sidebar offset to pages

# UI enhancement
feat(ui): add route progress bar for page transitions

- Install and configure nprogress
- Add RouteProgressBar component
- Add progress bar CSS to globals.css

# Refactoring
refactor(hooks): consolidate API hooks into single file
```
