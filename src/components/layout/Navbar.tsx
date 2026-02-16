"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useMemo } from "react"
import { 
  Menu, 
  X, 
  Home, 
  Compass, 
  PlusCircle, 
  User, 
  Award,
  LogOut,
  Swords,
  ShoppingBag,
  Target,
  LucideIcon
} from "lucide-react"
import { isFeatureEnabled } from "@/lib/features"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  requireAuth?: boolean
  authRedirect?: boolean
}

function getNavItems(): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "首页", icon: Home },
    { href: "/explore", label: "发现", icon: Compass },
  ]
  
  if (isFeatureEnabled("DEBATE")) {
    items.push({ href: "/debates", label: "辩论", icon: Swords })
  }
  if (isFeatureEnabled("LEADERBOARD")) {
    items.push({ href: "/leaderboard", label: "排行榜", icon: Award })
  }
  if (isFeatureEnabled("TASKS")) {
    items.push({ href: "/tasks", label: "任务", icon: Target })
  }
  
  items.push({ href: "/create", label: "创建榜单", icon: PlusCircle, requireAuth: true, authRedirect: true })
  
  return items
}

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = useMemo(() => getNavItems(), [])

  function getNavItemHref(item: NavItem): string {
    if (item.authRedirect && status !== "authenticated") {
      return `/auth/signin?callbackUrl=${encodeURIComponent(item.href)}`
    }
    return item.href
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-1.5 rounded-lg">
              <Swords className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Battle Top
            </span>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => {
              if (item.requireAuth && !item.authRedirect && status !== "authenticated") return null
              return (
                <Link
                  key={item.href}
                  href={getNavItemHref(item)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {isFeatureEnabled("SHOP") && (
              <Link
                href="/shop"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>商城</span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ""}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <span>{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-primary-600 to-accent-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                if (item.requireAuth && !item.authRedirect && status !== "authenticated") return null
                return (
                  <Link
                    key={item.href}
                    href={getNavItemHref(item)}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              {isFeatureEnabled("SHOP") && (
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>商城</span>
                </Link>
              )}
              <div className="border-t pt-3 mt-3">
                {status === "authenticated" ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <User className="h-5 w-5" />
                      <span>个人中心</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>退出登录</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      登录
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}