"use client";
import { cn } from "@/lib/utils";
import { cloneElement, forwardRef, isValidElement } from "react";

// ─── BUTTON ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
    const variants = {
      primary:   "bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30",
      secondary: "bg-harusi-dark text-harusi-cream hover:bg-zinc-800 border border-white/10",
      ghost:     "bg-transparent hover:bg-harusi-dark/5 text-harusi-dark",
      danger:    "bg-red-500 hover:bg-red-600 text-white",
      outline:   "border border-harusi-brown text-harusi-brown hover:bg-amber-50",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };
    const mergedClassName = cn(base, variants[variant], sizes[size], className, isValidElement(children) ? children.props.className : undefined);

    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ...props,
        ref,
        className: mergedClassName,
        disabled: disabled || loading,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={mergedClassName}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── INPUT ───────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-harusi-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-harusi-muted">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-harusi-dark placeholder:text-stone-400",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
            "transition-all duration-200",
            icon && "pl-10",
            error && "border-red-400 focus:ring-red-400/30",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── TEXTAREA ────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-harusi-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-harusi-dark placeholder:text-stone-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
          "transition-all duration-200",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ─── SELECT ──────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-harusi-muted uppercase tracking-wide mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-harusi-dark",
          "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
          "transition-all duration-200 appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── BADGE ───────────────────────────────────────────────────
interface BadgeProps { variant?: "default"|"success"|"warning"|"danger"|"info"|"gold"; children: React.ReactNode; className?: string; }
export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-stone-100 text-stone-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger:  "bg-red-50 text-red-700",
    info:    "bg-blue-50 text-blue-700",
    gold:    "bg-gradient-to-r from-amber-400 to-amber-600 text-white",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide", variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── CARD ────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }
export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-stone-100 shadow-sm",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── SPINNER ─────────────────────────────────────────────────
export function Spinner({ size = "md", className }: { size?: "sm"|"md"|"lg"; className?: string }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizes[size], className)} />
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; icon: React.ReactNode; color?: string; change?: string; }
export function StatCard({ label, value, icon, color = "amber", change }: StatCardProps) {
  const colors: Record<string, string> = {
    amber:  "border-t-amber-400",
    teal:   "border-t-teal-500",
    purple: "border-t-purple-500",
    red:    "border-t-red-500",
    blue:   "border-t-blue-500",
    green:  "border-t-emerald-500",
  };
  return (
    <Card className={cn("p-6 border-t-2", colors[color] || colors.amber)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {change && (
          <Badge variant="success" className="text-[10px]">{change}</Badge>
        )}
      </div>
      <div className="font-serif text-2xl font-bold text-harusi-dark tabular-nums">{value}</div>
      <div className="text-xs text-harusi-muted mt-1 font-medium">{label}</div>
    </Card>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
interface EmptyProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function Empty({ icon = "📭", title, description, action }: EmptyProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-semibold text-harusi-dark mb-2">{title}</h3>
      {description && <p className="text-sm text-harusi-muted mb-6 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-harusi-dark">{title}</h2>
        {subtitle && <p className="text-sm text-harusi-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────
export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm"|"md" }) {
  return (
    <div className={cn("flex items-center gap-0.5", size === "md" && "gap-1")}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={cn(size === "sm" ? "text-sm" : "text-base", s <= Math.round(rating) ? "text-amber-400" : "text-stone-200")}>★</span>
      ))}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; maxWidth?: string; }
export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 glass" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full animate-fade-up", maxWidth)}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <h3 className="font-serif text-xl font-semibold">{title}</h3>
            <button onClick={onClose} className="text-harusi-muted hover:text-harusi-dark text-xl leading-none">×</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
