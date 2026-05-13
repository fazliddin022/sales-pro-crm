import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import Sidebar from "../components/Sidebar";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <header style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 2rem",
          height: "87px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ color: "white", fontSize: "0.875rem", fontWeight: 700 }}>
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                {session.user?.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                {session.user?.email}
              </p>
            </div>
          </div>
        </header>

        <main style={{ padding: "2rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}