import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Enhanced brand variants with gradients and better effects
        brand: "bg-gradient-brand text-white hover:scale-105 shadow-button-brand hover:shadow-brand transition-all duration-300 border-0",
        "brand-secondary": "bg-gradient-to-r from-brand-secondary to-brand text-white hover:scale-105 shadow-button-brand hover:shadow-brand transition-all duration-300",
        "brand-outline": "border-2 border-brand text-brand bg-transparent hover:bg-gradient-brand hover:text-white hover:border-transparent hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-button-brand",
        "brand-ghost": "text-brand hover:bg-gradient-brand/10 hover:text-brand-dark hover:scale-105 transition-all duration-300",
        "brand-subtle": "bg-brand/10 text-brand hover:bg-brand/20 hover:scale-105 transition-all duration-300 border border-brand/20 hover:border-brand/30",
        hero: "bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 hover:bg-gradient-to-r hover:from-white/30 hover:to-white/20 backdrop-blur-lg shadow-button-brand hover:shadow-brand hover:scale-105 transition-all duration-300",
        success: "bg-gradient-to-r from-success to-success/80 text-white hover:scale-105 shadow-sm hover:shadow-md transition-all duration-300",
        warning: "bg-gradient-to-r from-warning to-warning/80 text-white hover:scale-105 shadow-sm hover:shadow-md transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };