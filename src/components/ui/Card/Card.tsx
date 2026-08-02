import type { LucideIcon } from "lucide-react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils/cn";

export type CardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
};

export function Card({ title, description, icon, className, children }: CardProps) {
  return (
    <Paper
      elevation={0}
      className={cn(
        "rounded-2xl border border-black/5 p-6 transition-shadow hover:shadow-md",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon icon={icon} size={24} />
        </div>
      )}

      <Typography variant="h6" component="h3" className="mb-2 font-semibold">
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" className="leading-relaxed">
        {description}
      </Typography>

      {children}
    </Paper>
  );
}
