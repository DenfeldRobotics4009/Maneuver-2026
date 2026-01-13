import * as React from "react"
import { cn } from "@/core/lib/utils"
import { useSidebar } from "./context"
import { SIDEBAR_WIDTH_MOBILE } from "./constants"

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) flex-col transition-transform duration-300 ease-in-out",
          side === "left" ? "left-0" : "right-0",
          side === "left" 
            ? (openMobile ? "translate-x-0" : "-translate-x-full")
            : (openMobile ? "translate-x-0" : "translate-x-full"),
          className
        )}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden 2xl:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear 2xl:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  const { openMobile } = useSidebar()
  
  // Check if we're below 2xl breakpoint (same as useIsMobile hook)
  const [isBelow2xlBreakpoint, setIsBelow2xlBreakpoint] = React.useState(false)
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      setIsBelow2xlBreakpoint(window.innerWidth < 1536)
    }
    
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])
  
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full overflow-auto flex-col transition-transform duration-300 ease-in-out",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        // Push behavior for all devices below 2xl - push content to the right when sidebar is open
        isBelow2xlBreakpoint && openMobile && "translate-x-72",
        // Prevent interaction with content when sidebar is open (below 2xl)
        isBelow2xlBreakpoint && openMobile && "pointer-events-none",
        className
      )}
      style={
        {
          "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
