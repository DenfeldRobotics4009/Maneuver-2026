"use client"

// Export main components
export { Sidebar, SidebarInset } from "./sidebar/core"
export { SidebarProvider } from "./sidebar/provider"

// Export layout components
export {
  SidebarTrigger,
  SidebarRail,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "./sidebar/layout"

// Export menu components
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar/menu"

// Export context and hook
export { useSidebar } from "./sidebar/context"
export type { SidebarContextProps } from "./sidebar/context"
