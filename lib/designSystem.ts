/**
 * RENTFLOW Design System
 * Premium Modern Mobile-First SaaS Operational Dashboard
 * 
 * Inspired by: Linear, Stripe, Notion, Uber Driver, Bolt
 */

export const DesignSystem = {
  // === COLOR PALETTE ===
  colors: {
    // Primary - Deep Navy & Charcoal
    primary: {
      950: "#0F172A", // Darkest navy (backgrounds)
      900: "#0F1729", // Deep navy
      800: "#1E293B", // Charcoal
      700: "#334155", // Slate
      600: "#475569", // Medium slate
    },
    
    // Accent - Cyan/Electric Blue
    accent: {
      600: "#06B6D4", // Cyan
      500: "#0ea5e9", // Electric blue
      400: "#38BDF8", // Light cyan
      300: "#67E8F9", // Very light cyan
    },
    
    // Status Colors
    status: {
      success: "#10B981", // Emerald
      warning: "#F59E0B", // Amber
      error: "#EF4444",   // Red
      info: "#3B82F6",    // Blue
      pending: "#8B5CF6", // Purple
    },
    
    // Neutral
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },

  // === TYPOGRAPHY ===
  typography: {
    // Font Families
    family: {
      sans: "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
      mono: "'Fira Code', 'Courier New', monospace",
    },
    
    // Font Sizes
    size: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
    },
    
    // Font Weights
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // === SPACING ===
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px",
  },

  // === BORDER RADIUS ===
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  },

  // === SHADOWS ===
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    // Soft glassmorphism shadows
    glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    "glass-dark": "0 8px 32px 0 rgba(15, 23, 42, 0.5)",
  },

  // === TRANSITIONS ===
  transition: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
    timing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // === Z-INDEX STACKING ===
  zIndex: {
    hidden: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // === BREAKPOINTS ===
  breakpoint: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// === COMPONENT VARIANTS ===

export const ButtonVariants = {
  primary: {
    light: {
      bg: "bg-sky-600 dark:bg-sky-500",
      hover: "hover:bg-sky-700 dark:hover:bg-sky-600",
      text: "text-white",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
    },
    secondary: {
      bg: "bg-zinc-100 dark:bg-zinc-900",
      hover: "hover:bg-zinc-200 dark:hover:bg-zinc-800",
      text: "text-zinc-900 dark:text-zinc-100",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
    },
    ghost: {
      bg: "bg-transparent",
      hover: "hover:bg-zinc-100 dark:hover:bg-zinc-900",
      text: "text-zinc-900 dark:text-zinc-100",
      border: "border border-zinc-200 dark:border-zinc-800",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
    },
    danger: {
      bg: "bg-red-600 dark:bg-red-500",
      hover: "hover:bg-red-700 dark:hover:bg-red-600",
      text: "text-white",
      disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
    },
  },
  size: {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  },
};

export const CardVariants = {
  default: {
    container: "rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15",
    header: "rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900",
  },
  elevated: {
    container: "rounded-3xl border border-zinc-200/60 bg-white/98 p-6 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/95 dark:shadow-zinc-950/30",
  },
  glass: {
    container: "rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/20",
  },
};

export const BadgeVariants = {
  success: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  error: "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300",
  info: "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  pending: "rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  neutral: "rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
};

export const InputVariants = {
  default: "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100",
  error: "w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950 outline-none transition focus:border-red-500 dark:border-red-800 dark:bg-red-950/20 dark:text-red-100",
};

export const LabelVariants = {
  default: "block text-sm font-medium text-zinc-700 dark:text-zinc-300",
  required: "block text-sm font-medium text-zinc-700 dark:text-zinc-300 after:content-['*'] after:ml-1 after:text-red-500",
};
