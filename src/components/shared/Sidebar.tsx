// src/components/shared/Sidebar.tsx
'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FolderKanban, 
  MessageSquare, 
  FileText, 
  Megaphone, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";  // ← 使用 next-auth/react 的 signOut（client 專用）

interface SidebarProps {
  role?: string | null;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    // 使用 client 端 signOut，並指定 redirect
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-72 md:border-r md:bg-muted/40 md:dark:bg-muted/20">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">CRM 系統</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {role === "ADMIN" && "管理員"}
          {role === "EMPLOYEE" && "員工"}
          {role === "CUSTOMER" && "客戶"}
        </p>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {/* 共用首頁 */}
          <SidebarLink 
            href="/dashboard" 
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="儀表板"
            active={isActive("/dashboard")}
          />

          {/* Admin 專屬選單 */}
          {role === "ADMIN" && (
            <>
              <SidebarLink 
                href="/dashboard/admin/customers" 
                icon={<Users className="h-5 w-5" />}
                label="客戶管理"
                active={isActive("/dashboard/admin/customers")}
              />
              <SidebarLink 
                href="/dashboard/admin/employees" 
                icon={<Users className="h-5 w-5" />}
                label="員工管理"
                active={isActive("/dashboard/admin/employees")}
              />
              <SidebarLink 
                href="/dashboard/admin/products" 
                icon={<Package className="h-5 w-5" />}
                label="產品管理"
                active={isActive("/dashboard/admin/products")}
              />
              <SidebarLink 
                href="/dashboard/admin/projects" 
                icon={<FolderKanban className="h-5 w-5" />}
                label="項目管理"
                active={isActive("/dashboard/admin/projects")}
              />
              <SidebarLink 
                href="/dashboard/admin/tasks" 
                icon={<FolderKanban className="h-5 w-5" />}
                label="任務指派中心"
                active={isActive("/dashboard/admin/tasks")}
              />
              <SidebarLink 
                href="/dashboard/admin/reports" 
                icon={<FileText className="h-5 w-5" />}
                label="報告管理"
                active={isActive("/dashboard/admin/reports")}
              />
              <SidebarLink 
                href="/dashboard/admin/broadcasts" 
                icon={<Megaphone className="h-5 w-5" />}
                label="廣播/廣告管理"
                active={isActive("/dashboard/admin/broadcasts")}
              />
            </>
          )}

          {/* Employee 專屬選單 */}
          {role === "EMPLOYEE" && (
            <>
              <SidebarLink 
                href="/dashboard/staff/myclient" 
                icon={<Users className="h-5 w-5" />}
                label="我的潛力客戶"
                active={isActive("/dashboard/staff/myclient")}
              />
              <SidebarLink 
                href="/dashboard/staff/workspace" 
                icon={<FileText className="h-5 w-5" />}
                label="工作區（報告/活動）"
                active={isActive("/dashboard/staff/workspace")}
              />
            </>
          )}

          {/* Customer 專屬選單 */}
          {role === "CUSTOMER" && (
            <>
              <SidebarLink 
                href="/dashboard/client/products" 
                icon={<Package className="h-5 w-5" />}
                label="產品與申請"
                active={isActive("/dashboard/client/products")}
              />
              <SidebarLink 
                href="/dashboard/client/messages" 
                icon={<MessageSquare className="h-5 w-5" />}
                label="我的對話"
                active={isActive("/dashboard/client/messages")}
              />
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}  // ← 使用 async handler
        >
          <LogOut className="h-5 w-5 mr-2" />
          登出
        </Button>
      </div>
    </div>
  );
}

// 共用 Sidebar 選單項目組件
function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3",
          active && "bg-secondary text-secondary-foreground"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
}