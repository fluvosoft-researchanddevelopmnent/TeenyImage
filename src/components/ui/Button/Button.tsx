"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";

import { cn } from "@/lib/utils/cn";

export type ButtonProps = MuiButtonProps & {
  className?: string;
};

export function Button({ className, variant = "contained", ...props }: ButtonProps) {
  return (
    <MuiButton
      variant={variant}
      className={cn(className)}
      {...props}
    />
  );
}
