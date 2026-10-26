import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "bg-indigo-600 text-white hover:bg-indigo-700", outline: "border border-[var(--border)] bg-[var(--surface)] hover:bg-black/5", ghost: "hover:bg-black/5" }, size: { default: "h-10 px-4", sm: "h-9 px-3", icon: "h-10 w-10" } }, defaultVariants: { variant: "default", size: "default" } });
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export function Button({ className, variant, size, ...props }: ButtonProps) { return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
