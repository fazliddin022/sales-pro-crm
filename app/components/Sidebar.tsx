"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart2,
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/deals", label: "Deals", icon: Briefcase },
  { href: "/dashboard/activities", label: "Activities", icon: Calendar },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "240px",
      background: "white",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "1.5rem",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          borderRadius: "0.625rem",
          padding: "0.5rem",
          display: "flex",
        }}>
          <BarChart2 size={20} color="white" />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>
            SalesPro
          </p>
          <p style={{ fontSize: "0.7rem", color: "#9ca3af" }}>CRM Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.75rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  background: active
                    ? "linear-gradient(135deg, #eff6ff, #f5f3ff)"
                    : "transparent",
                  color: active ? "#2563eb" : "#6b7280",
                  transition: "all 0.2s",
                  border: active ? "1px solid #dbeafe" : "1px solid transparent",
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.875rem",
            color: "#ef4444",
            fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}