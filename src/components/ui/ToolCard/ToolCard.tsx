import Link from "next/link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Icon } from "@/components/ui/Icon";
import type { Tool } from "@/constants/tools";
import { cn } from "@/lib/utils/cn";

export type ToolCardProps = {
  tool: Tool;
  className?: string;
};

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <Link href={tool.href} className="block no-underline text-inherit">
      <Paper
        elevation={0}
        className={cn(
          "group h-full rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand/30 hover:shadow-md sm:p-5",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              tool.iconClassName,
            )}
          >
            <Icon icon={tool.icon} size={22} />
          </div>

          {tool.isNew && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              New!
            </span>
          )}
        </div>

        <Typography variant="h6" component="h3" className="mb-2 text-base font-semibold text-text-primary">
          {tool.title}
        </Typography>

        <Typography variant="body2" className="text-sm leading-relaxed text-text-secondary">
          {tool.description}
        </Typography>
      </Paper>
    </Link>
  );
}
