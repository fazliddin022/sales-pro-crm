"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BarChart2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password.");
          return;
        }
        router.push("/dashboard");
      } else {
        if (!form.name.trim()) {
          setError("Please enter your name.");
          return;
        }

        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed.");
          return;
        }

        // Auto login
        await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    background: "white",
    color: "#111827",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f9ff 0%, #f9fafb 50%, #f0fdf4 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <BarChart2 size={28} color="white" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            SalesPro CRM
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #f3f4f6",
        }}>
          {/* Tabs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#f3f4f6",
            borderRadius: "0.75rem",
            padding: "0.25rem",
            marginBottom: "1.5rem",
          }}>
            {["Login", "Sign Up"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === "Login"); setError(""); }}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  background: (isLogin && tab === "Login") || (!isLogin && tab === "Sign Up")
                    ? "white"
                    : "transparent",
                  color: (isLogin && tab === "Login") || (!isLogin && tab === "Sign Up")
                    ? "#111827"
                    : "#6b7280",
                  boxShadow: (isLogin && tab === "Login") || (!isLogin && tab === "Sign Up")
                    ? "0 1px 4px rgba(0,0,0,0.08)"
                    : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {!isLogin && (
              <div style={{ position: "relative" }}>
                <User size={16} style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }} />
                <input
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  style={INPUT_STYLE}
                />
              </div>
            )}

            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }} />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                style={INPUT_STYLE}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{ ...INPUT_STYLE, paddingRight: "3rem" }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "#dc2626",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "0.5rem",
              }}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>

        <p style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#9ca3af",
          marginTop: "1.5rem",
        }}>
          Powered by Next.js + Neon PostgreSQL 🚀
        </p>
      </div>
    </div>
  );
}