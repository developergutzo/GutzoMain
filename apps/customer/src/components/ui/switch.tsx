"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        width: '50px',
        height: '30px',
        padding: '2px',
        backgroundColor: props.checked ? '#34C759' : '#E9E9EA',
        ...props.style
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full shadow-lg ring-0 transition-transform"
        )}
        style={{
             width: '26px',
             height: '26px',
             backgroundColor: 'white',
             borderRadius: '9999px',
             transform: props.checked ? 'translateX(20px)' : 'translateX(0)'
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
