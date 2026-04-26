import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const displayName =
    user?.firstName || user?.email?.split("@")[0] || "Account";
  const initial = (
    user?.firstName?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "About", href: "/about" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                nam<span className="text-primary">Findz</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/report/lost">
              <Button variant="outline" className="hidden sm:inline-flex border-primary text-primary hover:bg-primary/5">
                I lost something
              </Button>
            </Link>
            <Link href="/report/found">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                I found something
              </Button>
            </Link>
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className="h-9 w-9 border border-border">
                      {user?.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{displayName}</span>
                      {user?.email ? (
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      ) : null}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-reports" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      My Reports
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={login}
                className="hidden sm:inline-flex"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                nam<span className="text-primary">Findz</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              A community noticeboard for Namibia and beyond. We reunite people with what matters most to them.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">Browse Reports</Link></li>
              <li><Link href="/report/lost" className="text-muted-foreground hover:text-primary transition-colors">Report Lost Item</Link></li>
              <li><Link href="/report/found" className="text-muted-foreground hover:text-primary transition-colors">Report Found Item</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Statistics</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Safety Tips</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">How it works</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} namFindz. All rights reserved.</p>
          <p>Built with purpose for the community.</p>
        </div>
      </footer>
    </div>
  );
}
