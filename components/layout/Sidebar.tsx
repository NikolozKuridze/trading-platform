'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  Coins,
  LineChart,
  CandlestickChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Trading',
    icon: TrendingUp,
    children: [
      { name: 'Spot Trading', href: '/trading/spot', icon: Coins },
      { name: 'Futures Trading', href: '/trading/futures', icon: CandlestickChart },
      { name: 'Trading History', href: '/trading/history', icon: History },
    ],
  },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const helpItems = [
  { name: 'Documentation', href: '/help/docs', icon: HelpCircle },
  { name: 'Support', href: '/help/support', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['Trading'])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="flex h-full flex-col gap-y-5 overflow-y-auto border-r bg-card px-3 py-4">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <LineChart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">TradePro</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <Collapsible
                      open={openMenus.includes(item.name)}
                      onOpenChange={() => toggleMenu(item.name)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full justify-between',
                            item.children.some((child) => isActive(child.href))
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <span className="flex items-center">
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              openMenus.includes(item.name) && 'rotate-180'
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 space-y-1 px-2">
                        {item.children.map((child) => (
                          <Button
                            key={child.name}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start pl-9',
                              isActive(child.href)
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                            asChild
                          >
                            <Link href={child.href}>
                              <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {child.name}
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        isActive(item.href!)
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      )}
                      asChild
                    >
                      <Link href={item.href!}>
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </li>

          {/* Help section */}
          <li className="mt-auto">
            <div className="border-t pt-4">
              <p className="px-3 text-xs font-semibold text-muted-foreground">
                HELP & SUPPORT
              </p>
              <ul role="list" className="mt-2 space-y-1">
                {helpItems.map((item) => (
                  <li key={item.name}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        {item.name}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Trading Account Selector */}
          <li className="mt-4 border-t pt-4">
            <div className="px-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                TRADING ACCOUNT
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
              >
                <span className="truncate">Main Account</span>
                <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
              </Button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}