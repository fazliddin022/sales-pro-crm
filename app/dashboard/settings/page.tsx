"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Lock,
  Save,
  Check,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
  if (session?.user) {
    setForm((prev) => ({
      ...prev,
      name: session.user?.name || "",
      email: session.user?.email || "",
    }));
  }
}, [session]);

  const handleSave = async () => {
    setError("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings.");
        return;
      }

      // Session yangilash
      await update({ name: form.name });

      setSaved(true);
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    fontSize: "0.875rem",
    outline: "none",
    color: "#111827",
    background: "white",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
          Settings
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Manage your account settings.
        </p>
      </div>

      {/* Avatar */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
      }}>
        <div style={{
          width: "72px",
          height: "72px",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: "white", fontSize: "1.75rem", fontWeight: 700 }}>
            {form.name.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "#111827", fontSize: "1.125rem" }}>
            {form.name || "Your Name"}
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{form.email}</p>
          <span style={{
            display: "inline-block",
            marginTop: "0.375rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            background: "#eff6ff",
            color: "#2563eb",
          }}>
            Active Account
          </span>
        </div>
      </div>

      {/* Profile */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
      }}>
        <h2 style={{ fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
          Profile Information
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#374151",
              marginBottom: "0.5rem",
            }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }} />
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#374151",
              marginBottom: "0.5rem",
            }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }} />
              <input
                value={form.email}
                disabled
                style={{
                  ...INPUT_STYLE,
                  background: "#f9fafb",
                  color: "#9ca3af",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.375rem" }}>
              Email cannot be changed.
            </p>
          </div>
        </div>
      </div>

      {/* Password */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}>
          <Shield size={18} color="#2563eb" />
          <h2 style={{ fontWeight: 600, color: "#111827" }}>
            Change Password
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { key: "currentPassword", label: "Current Password", placeholder: "••••••••" },
            { key: "newPassword", label: "New Password", placeholder: "Min. 6 characters" },
            { key: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
          ].map((field) => (
            <div key={field.key}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                {field.label}
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }} />
                <input
                  type="password"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "0.75rem",
          padding: "0.875rem 1rem",
          fontSize: "0.875rem",
          color: "#dc2626",
        }}>
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.875rem",
          background: saved
            ? "#059669"
            : saving
            ? "#93c5fd"
            : "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "white",
          border: "none",
          borderRadius: "0.75rem",
          cursor: saving ? "not-allowed" : "pointer",
          fontSize: "0.875rem",
          fontWeight: 600,
          transition: "all 0.3s",
        }}
      >
        {saved ? <Check size={18} /> : <Save size={18} />}
        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}