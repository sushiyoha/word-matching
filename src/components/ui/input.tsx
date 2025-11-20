// src/components/ui/input.tsx (升级版)

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// ✨ 看这里！我们用 React.forwardRef 把整个组件包了起来 ✨
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => { // ✨ 并且在这里“接住”了 ref
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref} // ✨ 最后把 ref 这个“对讲机”交给了真正的 input 标签
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }