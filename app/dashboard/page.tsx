import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { contacts, deals, activities } from "@/lib/schema";
import { eq, count, sum } from "drizzle-orm";
import {
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  // Real statistika — Neon'dan
  const [totalContacts] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.userId, userId));

  const [totalDeals] = await db
    .select({ count: count() })
    .from(deals)
    .where(eq(deals.userId, userId));

  const [totalRevenue] = await db
    .select({ sum: sum(deals.value) })
    .from(deals)
    .where(eq(deals.userId, userId));

  const [totalActivities] = await db
    .select({ count: count() })
    .from(activities)
    .where(eq(activities.userId, userId));

  const [pendingActivities] = await db
    .select({ count: count() })
    .from(activities)
    .where(eq(activities.userId, userId));

  // So'nggi contacts
  const recentContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(contacts.createdAt)
    .limit(5);

  // So'nggi deals
  const recentDeals = await db
    .select()
    .from(deals)
    .where(eq(deals.userId, userId))
    .orderBy(deals.createdAt)
    .limit(5);

  const KPIS = [
    {
      title: "Total Contacts",
      value: totalContacts.count,
      icon: Users,
      color: "#2563eb",
      bg: "#eff6ff",
      suffix: "",
    },
    {
      title: "Active Deals",
      value: totalDeals.count,
      icon: Briefcase,
      color: "#7c3aed",
      bg: "#f5f3ff",
      suffix: "",
    },
    {
      title: "Total Revenue",
      value: `$${(Number(totalRevenue.sum) || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "#059669",
      bg: "#ecfdf5",
      suffix: "",
    },
    {
      title: "Activities",
      value: totalActivities.count,
      icon: Calendar,
      color: "#d97706",
      bg: "#fffbeb",
      suffix: "",
    },
  ];

  const STAGE_COLORS: Record<string, string> = {
    lead: "#6b7280",
    qualified: "#2563eb",
    proposal: "#7c3aed",
    negotiation: "#d97706",
    closed_won: "#059669",
    closed_lost: "#dc2626",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
          Good morning, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          You have {pendingActivities.count} pending activities today.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      }}>
        {KPIS.map((kpi) => (
          <div key={kpi.title} style={{
            background: "white",
            borderRadius: "1rem",
            padding: "1.25rem",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{
                background: kpi.bg,
                padding: "0.625rem",
                borderRadius: "0.75rem",
              }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <ArrowUpRight size={16} color="#9ca3af" />
            </div>
            <div>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827" }}>
                {kpi.value}{kpi.suffix}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                {kpi.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent rows */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
      }}>
        {/* Recent Contacts */}
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}>
            <h2 style={{ fontWeight: 600, color: "#111827" }}>Recent Contacts</h2>
            <TrendingUp size={16} color="#9ca3af" />
          </div>

          {recentContacts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#9ca3af" }}>
              <Users size={32} style={{ margin: "0 auto 0.5rem" }} />
              <p style={{ fontSize: "0.875rem" }}>No contacts yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentContacts.map((contact) => (
                <div key={contact.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem",
                  borderRadius: "0.75rem",
                  background: "#f9fafb",
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {contact.name}
                    </p>
                    <p style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {contact.company || contact.email || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}>
            <h2 style={{ fontWeight: 600, color: "#111827" }}>Recent Deals</h2>
            <Briefcase size={16} color="#9ca3af" />
          </div>

          {recentDeals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#9ca3af" }}>
              <Briefcase size={32} style={{ margin: "0 auto 0.5rem" }} />
              <p style={{ fontSize: "0.875rem" }}>No deals yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentDeals.map((deal) => (
                <div key={deal.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.625rem",
                  borderRadius: "0.75rem",
                  background: "#f9fafb",
                }}>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <p style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {deal.title}
                    </p>
                    <span style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.125rem 0.5rem",
                      borderRadius: "999px",
                      background: `${STAGE_COLORS[deal.stage || "lead"]}20`,
                      color: STAGE_COLORS[deal.stage || "lead"],
                      marginTop: "0.25rem",
                      textTransform: "capitalize",
                    }}>
                      {deal.stage?.replace("_", " ")}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, color: "#059669", fontSize: "0.875rem" }}>
                    ${(deal.value || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div style={{
          background: "white",
          borderRadius: "1rem",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}>
            <h2 style={{ fontWeight: 600, color: "#111827" }}>Activity Summary</h2>
            <Calendar size={16} color="#9ca3af" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Total Activities", value: totalActivities.count, icon: Calendar, color: "#2563eb" },
              { label: "Pending", value: pendingActivities.count, icon: Clock, color: "#d97706" },
              { label: "Completed", value: 0, icon: CheckCircle2, color: "#059669" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                background: "#f9fafb",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <item.icon size={16} color={item.color} />
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}