import { cn } from "@/lib/utils/cn";

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

export function Container({ children, className, as: Component = "div" }: ContainerProps) {
  return (
    <Component className={cn("mx-auto w-full px-[25px] lg:px-[30px]", className)}>
      {children}
    </Component>
  );
}
