"use client";

import { cn } from "@/lib/utils";
import { cloneElement, forwardRef, isValidElement } from "react";
import { DiamondLogo } from "./DiamondLogo"; // Ensure this exists in the same folder

// ─── BUTTON ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] tracking-tight";
    const variants = {
      primary:   "bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 border-b-2 border-amber-700/20",
      secondary: "bg-brand-ebony text-brand-cloud hover:bg-brand-ebony/90 border border-white/5 shadow-lg",
      ghost:     "bg-transparent hover:bg-brand-tanzanite/5 text-brand-ebony/70 hover:text-brand-tanzanite",
      danger:    "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10",
      outline:   "border-2 border-brand-ebony/10 text-brand-ebony hover:border-brand-gold hover:bg-brand-gold/5",
    };
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };
    const mergedClassName = cn(base, variants[variant], sizes[size], className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ...props,
        ref,
        className: cn(mergedClassName, children.props.className),
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
        {loading ? <Spinner size="sm" /> : null}
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
      {label && <label className="block text-[10px] font-black text-brand-ebony/40 uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
      <div className="relative group">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ebony/30 group-focus-within:text-brand-gold transition-colors">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-2xl border-2 border-brand-ebony/5 bg-white px-4 py-3.5 text-sm text-brand-ebony placeholder:text-brand-ebony/20",
            "focus:outline-none focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/50",
            "transition-all duration-300",
            icon && "pl-12",
            error && "border-red-400 focus:ring-red-400/10",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">{error}</p>}
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
      {label && <label className="block text-[10px] font-black text-brand-ebony/40 uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-2xl border-2 border-brand-ebony/5 bg-white px-4 py-3.5 text-sm text-brand-ebony placeholder:text-brand-ebony/20 resize-none",
          "focus:outline-none focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/50",
          "transition-all duration-300 min-h-[120px]",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">{error}</p>}
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
      {label && <label className="block text-[10px] font-black text-brand-ebony/40 uppercase tracking-[0.2em] mb-2 ml-1">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full rounded-2xl border-2 border-brand-ebony/5 bg-white px-4 py-3.5 text-sm text-brand-ebony",
            "focus:outline-none focus:ring-4 focus:ring-brand-gold/10 focus:border-brand-gold/50",
            "transition-all duration-300 appearance-none cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
      </div>
      {error && <p className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── BADGE ───────────────────────────────────────────────────
interface BadgeProps { variant?: "default"|"success"|"warning"|"danger"|"info"|"gold"|"outline"; children: React.ReactNode; className?: string; }
export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    default: "bg-brand-cloud text-brand-ebony/60 border border-brand-ebony/5",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger:  "bg-red-50 text-red-700 border border-red-100",
    info:    "bg-blue-50 text-blue-700 border border-blue-100",
    gold:    "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm font-black italic",
    outline: "bg-transparent text-brand-ebony border border-brand-ebony/10",
  };
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none", variants[variant], className)}>
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
        "bg-white rounded-[2rem] border border-brand-ebony/5 shadow-sm overflow-hidden",
        onClick && "cursor-pointer hover:shadow-2xl hover:shadow-brand-ebony/10 hover:-translate-y-1 transition-all duration-500",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── SPINNER ─────────────────────────────────────────────────
export function Spinner({ size = "md", className }: { size?: "sm"|"md"|"lg"; className?: string }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-6 h-6 border-2", lg: "w-10 h-10 border-3" };
  return (
    <div className={cn("animate-spin rounded-full border-current border-t-transparent", sizes[size], className)} />
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; icon: React.ReactNode; color?: "amber" | "teal" | "purple" | "blue" | "emerald" | "brand-tanzanite" | "gold" | "indigo"; change?: string; }
export function StatCard({ label, value, icon, color = "amber", change }: StatCardProps) {
  const colors = {
    amber:   "text-brand-gold bg-brand-gold/10",
    teal:    "text-emerald-500 bg-emerald-50",
    purple:  "text-purple-500 bg-purple-50",
    blue:    "text-brand-tanzanite bg-brand-tanzanite/5",
    emerald: "text-emerald-600 bg-emerald-50",
    "brand-tanzanite": "text-brand-tanzanite bg-brand-tanzanite/10",
    gold:    "text-brand-gold bg-brand-gold/15",
    indigo:  "text-indigo-600 bg-indigo-50",
  };
  
  return (
    <Card className="p-7 relative group">
      <div className="flex items-start justify-between relative z-10">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm", colors[color])}>
          {icon}
        </div>
        {change && (
          <Badge variant="success" className="text-[9px]">{change}</Badge>
        )}
      </div>
      <div className="mt-5 relative z-10">
        <div className="font-serif text-3xl font-black text-brand-ebony tabular-nums tracking-tighter">{value}</div>
        <div className="text-[10px] font-black text-brand-ebony/30 uppercase tracking-[0.25em] mt-1.5">{label}</div>
      </div>
      <div className={cn("absolute -right-6 -bottom-6 w-28 h-28 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700", colors[color])}>
        {icon}
      </div>
    </Card>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
interface EmptyProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function Empty({ icon = <DiamondLogo className="opacity-20" />, title, description, action }: EmptyProps) {
  return (
    <div className="text-center py-20 px-8 bg-brand-cloud/30 rounded-[3rem] border border-dashed border-brand-ebony/10">
      <div className="flex justify-center mb-6">{icon}</div>
      <h3 className="font-serif text-2xl font-black text-brand-ebony mb-3 tracking-tight">{title}</h3>
      {description && <p className="text-sm font-medium text-brand-ebony/40 mb-8 max-w-sm mx-auto leading-relaxed">{description}</p>}
      <div className="flex justify-center">{action}</div>
    </div>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="space-y-1">
        <h2 className="font-serif text-4xl font-black text-brand-ebony tracking-tighter">{title}</h2>
        {subtitle && <p className="text-sm font-bold text-brand-ebony/40 tracking-tight">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────
export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm"|"md" }) {
  return (
    <div className={cn("flex items-center gap-1", size === "md" && "gap-1.5")}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={cn(
          "transition-colors",
          size === "sm" ? "text-sm" : "text-xl", 
          s <= Math.round(rating) ? "text-brand-gold" : "text-brand-ebony/10"
        )}>★</span>
      ))}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; maxWidth?: string; }
export function Modal({ open, onClose, title, children, maxWidth = "max-w-xl" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-brand-ebony/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className={cn("relative bg-white rounded-[2.5rem] shadow-2xl w-full animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden", maxWidth)}>
        {title && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-brand-ebony/5">
            <h3 className="font-serif text-2xl font-black text-brand-ebony">{title}</h3>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-cloud text-brand-ebony hover:bg-brand-ebony hover:text-white transition-all text-xl font-light">×</button>
          </div>
        )}
        <div className="px-8 py-8">{children}</div>
      </div>
    </div>
  );
}