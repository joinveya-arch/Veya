"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, initials } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full bg-surface-sunken",
  {
    variants: {
      size: {
        sm: "size-8 text-[0.6875rem]",
        md: "size-10 text-caption",
        lg: "size-14 text-body",
        xl: "size-20 text-h4",
        "2xl": "size-28 text-h3",
      },
      ring: {
        true: "ring-2 ring-surface ring-offset-2 ring-offset-background",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  name: string;
}

export function Avatar({
  className,
  size,
  ring,
  src,
  name,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(avatarVariants({ size, ring }), className)}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : 0}
        className="flex size-full items-center justify-center bg-burgundy-50 font-display font-medium tracking-wide text-burgundy-600 dark:bg-surface-soft dark:text-champagne-200"
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
