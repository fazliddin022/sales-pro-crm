"use client";

import { useEffect, useState } from "react";
import { Activity } from "@/lib/schema";
import {
  Plus,
  X,
  Check,
  Trash2,
  Phone,
  Mail,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  Circle,
  CheckCircle2,
} from "lucide-react";

const ACTIVITY_TYPES = [
  { key: "call", label: "Call", icon: Phone, color: "#2563eb", bg: "#eff6ff" },
  { key: "email", label: "Email", icon: Mail, color: "#7c3aed", bg: "#f5f3ff" },
  { key: "meeting", label: "Meeting", icon: Users, color: "#059669", bg: "#ecfdf5" },
  { key: "note", label: "Note", icon: FileText, color: "#d97706", bg: "#fffbeb" },
  { key: "task", label: "Task", icon: CheckSquare, color: "#dc2626", bg: "#fef2f2" },
];

const EMPTY_FORM = {
  type: "call",
  title: "",
  description: "",
  dueDate: "",
};

export default function ActivitiesPage() {
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivityList(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setActivityList([created, ...activityList]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (activity: Activity) => {
    const updated = { ...activity, completed: !activity.completed };
    await fetch(`/api/activities/${activity.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setActivityList(activityList.map((a) =>
      a.id === activity.id ? { ...a, completed: !a.completed } : a
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    setActivityList(activityList.filter((a) => a.id !== id));
  };

  const filtered = activityList.filter((a) => {
    if (filter === "pending") return !a.completed;
    if (filter === "completed") return a.completed;
    return true;
  });

  const counts = {
    all: activityList.length,
    pending: activityList.filter((a) => !a.completed).length,
    completed: activityList.filter((a) => a.completed).length,
  };

  const INPUT_STYLE: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid #e5e7eb",
    borderRadius: "0.625rem",
    fontSize: "0.875rem",
    outline: "none",
    color: "#111827",
    background: "white",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            Activities
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {counts.pending} pending · {counts.completed} completed
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "white",
            border: "none",
            borderRadius: "0.75rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.375rem 1rem",
              borderRadius: "999px",
              border: "1px solid",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
              background: filter === f ? "#2563eb" : "white",
              color: filter === f ? "white" : "#6b7280",
              borderColor: filter === f ? "#2563eb" : "#e5e7eb",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Activity type summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "0.75rem",
      }}>
        {ACTIVITY_TYPES.map((type) => {
          const count = activityList.filter((a) => a.type === type.key).length;
          return (
            <div key={type.key} style={{
              background: "white",
              borderRadius: "0.875rem",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}>
              <div style={{
                background: type.bg,
                padding: "0.5rem",
                borderRadius: "0.625rem",
                width: "fit-content",
              }}>
                <type.icon size={16} color={type.color} />
              </div>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
                {count}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{type.label}s</p>
            </div>
          );
        })}
      </div>

      {/* Activity list */}
      <div style={{
        background: "white",
        borderRadius: "1rem",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <Calendar size={40} style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontWeight: 500 }}>No activities found</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Add your first activity to get started
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((activity, i) => {
              const typeConfig = ACTIVITY_TYPES.find((t) => t.key === activity.type);
              const Icon = typeConfig?.icon || Calendar;

              return (
                <div
                  key={activity.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.25rem",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                    opacity: activity.completed ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {/* Complete toggle */}
                  <button
                    onClick={() => handleToggle(activity)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexShrink: 0,
                      color: activity.completed ? "#059669" : "#d1d5db",
                    }}
                  >
                    {activity.completed
                      ? <CheckCircle2 size={22} />
                      : <Circle size={22} />
                    }
                  </button>

                  {/* Type icon */}
                  <div style={{
                    background: typeConfig?.bg || "#f3f4f6",
                    padding: "0.5rem",
                    borderRadius: "0.625rem",
                    display: "flex",
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={typeConfig?.color || "#6b7280"} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#111827",
                      textDecoration: activity.completed ? "line-through" : "none",
                    }}>
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.125rem" }}>
                        {activity.description}
                      </p>
                    )}
                  </div>

                  {/* Due date */}
                  {activity.dueDate && (
                    <span style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      flexShrink: 0,
                    }}>
                      <Calendar size={12} />
                      {new Date(activity.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}

                  {/* Type badge */}
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    background: typeConfig?.bg || "#f3f4f6",
                    color: typeConfig?.color || "#6b7280",
                    flexShrink: 0,
                  }}>
                    {typeConfig?.label}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(activity.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#fca5a5",
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}>
          <div style={{
            background: "white",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
              <h2 style={{ fontWeight: 700, color: "#111827" }}>New Activity</h2>
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.375rem",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.5rem",
              }}>
                Type
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {ACTIVITY_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setForm({ ...form, type: type.key })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "999px",
                      border: "1px solid",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      background: form.type === type.key ? type.bg : "white",
                      color: form.type === type.key ? type.color : "#6b7280",
                      borderColor: form.type === type.key ? type.color : "#e5e7eb",
                    }}
                  >
                    <type.icon size={13} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}>
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Follow-up call with John"
                  style={INPUT_STYLE}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                  style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1.5rem",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                style={{
                  padding: "0.625rem 1.25rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  background: saving ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <Check size={16} />
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}