import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  LogOut,
  Settings,
  Users,
  Video,
  Home,
  Menu,
  Shield,
  PlaySquare
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home, exact: true },
  { name: "Videos", href: "/admin/videos", icon: Video, exact: false },
  { name: "Series", href: "/admin/series", icon: PlaySquare, exact: false },
  { name: "Users", href: "/admin/users", icon: Users, exact: false },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, exact: false },
  { name: "Settings", href: "/admin/settings", icon: Settings, exact: false },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActiveRoute = (href: string, exact: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const NavLink = ({ item, onClick }: { item: typeof navigation[0], onClick?: () => void }) => {
    const isActive = isActiveRoute(item.href, item.exact);
    
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-orange-100 text-orange-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Shield className="h-8 w-8 text-orange-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">SAANSE</span>
          <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center text-sm text-gray-600">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback className="text-xs">
                {admin?.displayName?.charAt(0) || admin?.email?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{admin?.displayName || admin?.email}</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <Shield className="h-8 w-8 text-orange-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SAANSE</span>
            <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin</span>
          </div>
          
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                  <Shield className="h-8 w-8 text-orange-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">SAANSE</span>
                  <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin</span>
                </div>
                
                <nav className="flex-1 space-y-1 p-4">
                  {navigation.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
              Admin Dashboard
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {admin?.displayName?.charAt(0) || admin?.email?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {admin?.displayName || "Admin"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}