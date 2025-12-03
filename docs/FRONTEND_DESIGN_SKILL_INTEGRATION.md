# Qara v2: Frontend Design Skill Integration

**Date:** December 3, 2025  
**Version:** 1.0  
**Status:** Future Integration (Phase 5+)  
**Priority:** High

---

## ⚠️ Critical Review Notes

### Existing Tools Do This

| Tool | Component Generation | Design Systems | Code Output |
|------|---------------------|----------------|-------------|
| **v0.dev** | ✅ Excellent | ✅ | ✅ React/Tailwind |
| **Claude Artifacts** | ✅ Good | ❌ | ✅ React |
| **Cursor/Windsurf** | ✅ Good | ❌ | ✅ Any framework |
| **This Skill** | ✅ Planned | ✅ Planned | ✅ Planned |

### What's the Differentiation?

**Honest answer:** Not much. v0.dev is excellent for component generation.

**Potential differentiation:**
- Integration with Qara's other skills (Research → Design)
- Custom design system enforcement
- Non-React frameworks (Svelte, Vue)

### When to Build

**Build when:** You need design generation integrated with other Qara workflows.

**Don't build when:** You just want to generate components (use v0.dev).

### Quality Reality Check

LLM-generated UI code is often:
- Functional but not polished
- Missing edge cases (loading, error, empty states)
- Inconsistent with existing codebase patterns

**This skill won't replace a designer or experienced frontend dev.**

### Framework Complexity

Supporting React, Svelte, AND Vue triples the testing surface. Consider:
- Pick ONE framework for MVP
- Add others only if there's demand

---

## Overview

The **Frontend Design Skill** generates UI/UX designs, component specifications, and frontend code. It bridges the gap between design intent and implementation, producing structured outputs that can be directly used by developers.

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Component Design** | Generate React/Svelte/Vue component specs |
| **Page Layout** | Design page structures with sections |
| **Design System** | Create consistent design tokens and patterns |
| **UI Copy** | Generate microcopy, labels, error messages |
| **Responsive Specs** | Define breakpoint behaviors |
| **Accessibility** | Generate ARIA labels, a11y requirements |

---

## BAML Fit Analysis

### Why This Fits BAML Well

| Aspect | Assessment |
|--------|------------|
| **Structured Output** | ✅ Components have clear props, styles, states |
| **Code Generation** | ✅ Can output actual component code |
| **Design Tokens** | ✅ Colors, spacing, typography are structured |
| **Specifications** | ✅ Requirements are enumerable |

### Considerations

| Challenge | Mitigation |
|-----------|------------|
| Visual design is subjective | Focus on structure, let humans refine aesthetics |
| Code style varies | Support multiple frameworks, configurable |
| Context-dependent | Include design system as input |

### Verdict: **Good fit - structure the designable, generate the codeable**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend Design Skill                                      │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Component       │  │ Page Layout     │                  │
│  │ Designer        │  │ Designer        │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Design System   │  │ Code Generator  │                  │
│  │ Builder         │  │ (React/Svelte)  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  FrontendDesignOrchestrator                             ││
│  │  - Design system context                                ││
│  │  - Framework selection                                  ││
│  │  - Code generation                                      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## BAML Types

```baml
// baml_src/skills/frontend/types.baml

// Design System Context (input)
class DesignSystem {
  name string
  colors ColorPalette
  typography Typography
  spacing SpacingScale
  breakpoints Breakpoints
  components string[] @description("Available component names")
}

class ColorPalette {
  primary string @description("Primary brand color hex")
  secondary string
  accent string
  background string
  surface string
  text string
  text_muted string
  error string
  warning string
  success string
  info string
}

class Typography {
  font_family string
  font_family_mono string
  scale TypographyScale
}

class TypographyScale {
  xs string @description("e.g., 0.75rem")
  sm string
  base string
  lg string
  xl string
  xxl string
  xxxl string
}

class SpacingScale {
  xs string @description("e.g., 0.25rem")
  sm string
  md string
  lg string
  xl string
  xxl string
}

class Breakpoints {
  sm string @description("e.g., 640px")
  md string
  lg string
  xl string
}

// Component Specification
class ComponentSpec {
  name string
  description string
  category string @description("layout|form|display|navigation|feedback")
  props PropDefinition[]
  slots SlotDefinition[]?
  states ComponentState[]
  variants ComponentVariant[]
  accessibility AccessibilitySpec
  responsive ResponsiveSpec?
  examples ComponentExample[]
}

class PropDefinition {
  name string
  type string @description("string|number|boolean|enum|object|array")
  required bool
  default_value string?
  description string
  enum_values string[]? @description("If type is enum")
}

class SlotDefinition {
  name string
  description string
  default_content string?
}

class ComponentState {
  name string @description("default|hover|focus|active|disabled|loading|error")
  description string
  style_changes string[] @description("What changes visually")
}

class ComponentVariant {
  name string
  description string
  prop_overrides map<string, string>
}

class AccessibilitySpec {
  role string @description("ARIA role")
  aria_labels map<string, string>
  keyboard_interactions KeyboardInteraction[]
  screen_reader_text string?
  focus_management string?
}

class KeyboardInteraction {
  key string @description("Enter|Space|Escape|Arrow keys|Tab")
  action string
}

class ResponsiveSpec {
  mobile string @description("Behavior on mobile")
  tablet string @description("Behavior on tablet")
  desktop string @description("Behavior on desktop")
}

class ComponentExample {
  name string
  description string
  props map<string, string>
  code string?
}

// Page Layout
class PageLayout {
  name string
  description string
  sections PageSection[]
  navigation NavigationSpec?
  responsive_behavior string
}

class PageSection {
  name string
  purpose string
  components ComponentPlacement[]
  layout string @description("flex|grid|stack")
  spacing string
  background string?
}

class ComponentPlacement {
  component string @description("Component name")
  props map<string, string>
  grid_area string? @description("If using grid")
  order int?
}

class NavigationSpec {
  type string @description("sidebar|topbar|bottom|tabs")
  items NavItem[]
  mobile_behavior string
}

class NavItem {
  label string
  href string
  icon string?
  children NavItem[]?
}

// Generated Code
class GeneratedComponent {
  spec ComponentSpec
  code ComponentCode
  styles string @description("CSS/Tailwind classes")
  story string? @description("Storybook story")
  test string? @description("Test file")
}

class ComponentCode {
  framework string @description("react|svelte|vue")
  typescript bool
  code string
  imports string[]
  dependencies string[]
}

// UI Copy
class UICopy {
  component string
  labels map<string, string>
  placeholders map<string, string>
  error_messages map<string, string>
  help_text map<string, string>
  aria_labels map<string, string>
}
```

---

## BAML Functions

```baml
// baml_src/skills/frontend/functions.baml

// Design a component from description
function DesignComponent(
  description: string,
  design_system: DesignSystem?,
  framework: string
) -> ComponentSpec {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a senior frontend designer creating component specifications.
    
    # TASK
    Design a component based on this description:
    {{ description }}
    
    Framework: {{ framework }}
    
    {% if design_system %}
    # DESIGN SYSTEM
    Name: {{ design_system.name }}
    Colors: Primary={{ design_system.colors.primary }}, Secondary={{ design_system.colors.secondary }}
    Available Components: {{ design_system.components }}
    {% endif %}
    
    # REQUIREMENTS
    1. Define all props with types and defaults
    2. Specify all visual states (hover, focus, disabled, etc.)
    3. Include variants if applicable
    4. Full accessibility specification
    5. Responsive behavior
    6. 2-3 usage examples
    
    # BEST PRACTICES
    - Props should be minimal but complete
    - States should cover all interactions
    - Accessibility is not optional
    - Examples should show common use cases
    
    {{ ctx.output_format }}
  "#
}

// Generate component code from spec
function GenerateComponentCode(
  spec: ComponentSpec,
  framework: string,
  typescript: bool,
  styling: string
) -> GeneratedComponent {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a senior frontend developer generating production-ready code.
    
    # COMPONENT SPEC
    Name: {{ spec.name }}
    Description: {{ spec.description }}
    
    Props:
    {% for prop in spec.props %}
    - {{ prop.name }}: {{ prop.type }}{% if prop.required %} (required){% endif %}
    {% endfor %}
    
    States: {{ spec.states }}
    Variants: {{ spec.variants }}
    
    # REQUIREMENTS
    Framework: {{ framework }}
    TypeScript: {{ typescript }}
    Styling: {{ styling }} (tailwind|css-modules|styled-components)
    
    # TASK
    Generate:
    1. Complete component code
    2. All necessary imports
    3. Styles (using {{ styling }})
    4. Storybook story (optional)
    5. Basic test file (optional)
    
    # CODE QUALITY
    - Follow {{ framework }} best practices
    - Proper TypeScript types if enabled
    - Handle all states and variants
    - Include prop validation
    - Accessible by default
    
    {{ ctx.output_format }}
  "#
}

// Design page layout
function DesignPageLayout(
  description: string,
  page_type: string,
  design_system: DesignSystem?
) -> PageLayout {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a UX designer creating page layouts.
    
    # TASK
    Design a page layout for:
    {{ description }}
    
    Page Type: {{ page_type }}
    
    {% if design_system %}
    # DESIGN SYSTEM
    Available Components: {{ design_system.components }}
    {% endif %}
    
    # REQUIREMENTS
    1. Define logical sections
    2. Specify component placement
    3. Define navigation if needed
    4. Responsive behavior for mobile/tablet/desktop
    
    # PAGE TYPES
    - landing: Hero, features, testimonials, CTA
    - dashboard: Sidebar, header, main content, widgets
    - form: Header, form sections, actions
    - list: Filters, list/grid, pagination
    - detail: Header, content, sidebar, related
    
    {{ ctx.output_format }}
  "#
}

// Generate UI copy
function GenerateUICopy(
  component: string,
  context: string,
  tone: string
) -> UICopy {
  client GPT4oMini
  prompt #"
    # IDENTITY
    You are a UX writer creating microcopy.
    
    # TASK
    Generate UI copy for: {{ component }}
    Context: {{ context }}
    Tone: {{ tone }}
    
    # REQUIREMENTS
    1. Labels: Clear, concise button/field labels
    2. Placeholders: Helpful input placeholders
    3. Error messages: Friendly, actionable errors
    4. Help text: Contextual guidance
    5. ARIA labels: Screen reader text
    
    # BEST PRACTICES
    - Be concise (every word counts)
    - Be helpful (guide the user)
    - Be human (match the tone)
    - Be accessible (screen reader friendly)
    
    {{ ctx.output_format }}
  "#
}

// Create design system
function CreateDesignSystem(
  brand_description: string,
  style: string,
  existing_colors: map<string, string>?
) -> DesignSystem {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a design system architect.
    
    # TASK
    Create a design system for:
    {{ brand_description }}
    
    Style: {{ style }} (minimal|bold|playful|corporate|elegant)
    
    {% if existing_colors %}
    # EXISTING COLORS
    {% for name, value in existing_colors %}
    {{ name }}: {{ value }}
    {% endfor %}
    {% endif %}
    
    # REQUIREMENTS
    1. Color palette (primary, secondary, accent, semantic)
    2. Typography scale
    3. Spacing scale
    4. Breakpoints
    5. List of recommended components
    
    # BEST PRACTICES
    - Colors should have sufficient contrast
    - Typography should be readable
    - Spacing should be consistent
    - System should be extensible
    
    {{ ctx.output_format }}
  "#
}

// Full page generation
function GenerateFullPage(
  description: string,
  framework: string,
  design_system: DesignSystem?
) -> PageLayout {
  client GPT4o
  prompt #"
    # IDENTITY
    You are a full-stack designer creating complete pages.
    
    # TASK
    Design and specify a complete page:
    {{ description }}
    
    Framework: {{ framework }}
    
    {% if design_system %}
    Design System: {{ design_system.name }}
    {% endif %}
    
    # OUTPUT
    1. Page layout with all sections
    2. Component specifications for each unique component
    3. Responsive behavior
    4. Navigation structure
    
    {{ ctx.output_format }}
  "#
}
```

---

## TypeScript Orchestrator

```typescript
// src/skills/frontend/orchestrator.ts

import { b } from '../../baml_client';
import type {
  DesignSystem,
  ComponentSpec,
  GeneratedComponent,
  PageLayout,
  UICopy
} from '../../baml_client/types';

export interface FrontendOptions {
  framework: 'react' | 'svelte' | 'vue';
  typescript: boolean;
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  designSystem?: DesignSystem;
  verbose?: boolean;
}

const DEFAULT_OPTIONS: FrontendOptions = {
  framework: 'react',
  typescript: true,
  styling: 'tailwind'
};

export class FrontendDesignOrchestrator {
  private designSystem?: DesignSystem;

  /**
   * Set design system context for all operations
   */
  setDesignSystem(ds: DesignSystem) {
    this.designSystem = ds;
  }

  /**
   * Design a component (spec only)
   */
  async designComponent(
    description: string,
    options: Partial<FrontendOptions> = {}
  ): Promise<ComponentSpec> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return b.DesignComponent(
      description,
      opts.designSystem || this.designSystem,
      opts.framework
    );
  }

  /**
   * Generate component with code
   */
  async generateComponent(
    description: string,
    options: Partial<FrontendOptions> = {}
  ): Promise<GeneratedComponent> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // First design the spec
    const spec = await this.designComponent(description, opts);
    
    // Then generate code
    return b.GenerateComponentCode(
      spec,
      opts.framework,
      opts.typescript,
      opts.styling
    );
  }

  /**
   * Design page layout
   */
  async designPage(
    description: string,
    pageType: string,
    options: Partial<FrontendOptions> = {}
  ): Promise<PageLayout> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    return b.DesignPageLayout(
      description,
      pageType,
      opts.designSystem || this.designSystem
    );
  }

  /**
   * Generate UI copy for a component
   */
  async generateCopy(
    component: string,
    context: string,
    tone: string = 'friendly'
  ): Promise<UICopy> {
    return b.GenerateUICopy(component, context, tone);
  }

  /**
   * Create a new design system
   */
  async createDesignSystem(
    brandDescription: string,
    style: string,
    existingColors?: Record<string, string>
  ): Promise<DesignSystem> {
    const ds = await b.CreateDesignSystem(
      brandDescription,
      style,
      existingColors
    );
    this.designSystem = ds;
    return ds;
  }

  /**
   * Full workflow: design system → page → components
   */
  async designFullPage(
    pageDescription: string,
    brandDescription: string,
    options: Partial<FrontendOptions> = {}
  ): Promise<{
    designSystem: DesignSystem;
    layout: PageLayout;
    components: GeneratedComponent[];
  }> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 1. Create design system if not provided
    const designSystem = opts.designSystem || 
      await this.createDesignSystem(brandDescription, 'modern');

    // 2. Design page layout
    const layout = await b.DesignPageLayout(
      pageDescription,
      'landing',
      designSystem
    );

    // 3. Generate unique components
    const componentNames = new Set<string>();
    for (const section of layout.sections) {
      for (const placement of section.components) {
        componentNames.add(placement.component);
      }
    }

    const components: GeneratedComponent[] = [];
    for (const name of componentNames) {
      const component = await this.generateComponent(
        `${name} component for ${pageDescription}`,
        { ...opts, designSystem }
      );
      components.push(component);
    }

    return { designSystem, layout, components };
  }
}

export function createFrontendDesignOrchestrator(): FrontendDesignOrchestrator {
  return new FrontendDesignOrchestrator();
}
```

---

## Skill Registry

```typescript
// Add to src/skills/registry.ts

{
  id: 'frontend-component',
  name: 'Design Component',
  description: 'Design and generate frontend components',
  triggers: [
    'design component', 'create component', 'generate component',
    'react component', 'svelte component', 'vue component'
  ],
  bamlFunction: 'DesignComponent'
},
{
  id: 'frontend-page',
  name: 'Design Page Layout',
  description: 'Design page layouts with sections and components',
  triggers: [
    'design page', 'page layout', 'create page',
    'landing page', 'dashboard layout'
  ],
  bamlFunction: 'DesignPageLayout'
},
{
  id: 'frontend-copy',
  name: 'Generate UI Copy',
  description: 'Generate microcopy, labels, and error messages',
  triggers: [
    'ui copy', 'microcopy', 'button labels', 'error messages',
    'generate copy'
  ],
  bamlFunction: 'GenerateUICopy'
},
{
  id: 'frontend-design-system',
  name: 'Create Design System',
  description: 'Create a complete design system with tokens',
  triggers: [
    'design system', 'create design system', 'design tokens',
    'color palette', 'typography scale'
  ],
  bamlFunction: 'CreateDesignSystem'
}
```

---

## Usage Examples

```bash
# Design a component
qara "design component: notification toast with dismiss"

# Generate with code
qara "generate react component: data table with sorting and pagination"

# Design page
qara "design landing page for SaaS analytics product"

# UI copy
qara "generate ui copy for: signup form, tone: friendly"

# Design system
qara "create design system for: fintech startup, style: minimal"
```

---

## File Structure

```
baml_src/skills/frontend/
├── types.baml           # DesignSystem, ComponentSpec, PageLayout, etc.
└── functions.baml       # Design and generation functions

src/skills/frontend/
└── orchestrator.ts      # FrontendDesignOrchestrator
```

---

## Framework-Specific Outputs

### React Example

```typescript
// Generated Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Svelte Example

```svelte
<!-- Generated Button.svelte -->
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  
  $: classes = cn(
    'rounded-md font-medium transition-colors',
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed'
  );
</script>

<button
  class={classes}
  {disabled}
  aria-busy={loading}
  on:click
>
  {#if loading}
    <Spinner />
  {:else}
    <slot />
  {/if}
</button>
```

---

## Implementation Checklist

- [ ] Create `baml_src/skills/frontend/types.baml`
- [ ] Create `baml_src/skills/frontend/functions.baml`
- [ ] Run `baml-cli generate`
- [ ] Create `src/skills/frontend/orchestrator.ts`
- [ ] Add to skill registry
- [ ] Test component design
- [ ] Test code generation (React, Svelte)
- [ ] Test page layout design
- [ ] Test design system creation

**Estimated Time:** 4-5 hours

---

## Future Enhancements

1. **Figma Integration** - Export to Figma designs
2. **Component Library** - Save and reuse generated components
3. **Visual Preview** - Render components in browser
4. **Design Critique** - Analyze existing designs
5. **A/B Variants** - Generate design variations for testing

---

**Document Version:** 1.0  
**Created:** December 3, 2025
