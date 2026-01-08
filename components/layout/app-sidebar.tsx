"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Inbox,
  Car,
  ListTodo,
  Settings,
  BookOpen,
  ChevronRight,
  Zap,
  Calculator,
  Send,
  TrendingUp,
  GitBranch,
  FlaskConical,
  BarChart3,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "10,000ft portfolio view",
  },
  {
    name: "Pipeline",
    href: "/pipeline",
    icon: GitBranch,
    description: "Upcoming defleet 30-90 days",
    badge: 234,
  },
  {
    name: "Intake & Triage",
    href: "/intake",
    icon: Inbox,
    description: "New vehicles & data validation",
    badge: 127,
  },
  {
    name: "Ready to List",
    href: "/listing",
    icon: Send,
    description: "Launch price, channel, tactic",
    badge: 89,
  },
  {
    name: "Action Queue",
    href: "/actions",
    icon: ListTodo,
    description: "Daily next best actions",
    badge: 42,
  },
  {
    name: "Pacing & Risk",
    href: "/pacing",
    icon: TrendingUp,
    description: "Month-end compression",
  },
  {
    name: "Pricing",
    href: "/pricing",
    icon: Calculator,
    description: "Valuations & market intelligence",
    badge: 18,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Car,
    description: "All stock management",
  },
]

const toolsNav = [
  {
    name: "Simulation",
    href: "/simulation",
    icon: FlaskConical,
    description: "What-if scenario modeling",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Model performance & learning",
  },
]

const secondaryNav = [
  {
    name: "Playbooks",
    href: "/playbooks",
    icon: BookOpen,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isVehicleDetail = pathname.startsWith("/vehicle/")

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Decision Engine</span>
              <span className="text-xs text-muted-foreground">Remarketing</span>
            </div>
          </Link>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <div className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Operations</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0 opacity-0 transition-opacity", isActive && "opacity-100")}
                />
              </Link>
            )
          })}

          {/* Vehicle detail indicator */}
          {isVehicleDetail && (
            <div className="mt-2 px-3 py-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-primary" />
                <span className="font-medium">Vehicle Detail</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Viewing single vehicle</p>
            </div>
          )}

          <div className="mt-6 mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</div>
          {toolsNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0 opacity-0 transition-opacity", isActive && "opacity-100")}
                />
              </Link>
            )
          })}
        </nav>

        {/* Secondary navigation */}
        <div className="border-t p-3">
          <div className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Configuration
          </div>
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* User section */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Jan de Vries</p>
              <p className="text-xs text-muted-foreground">NSC Netherlands</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
