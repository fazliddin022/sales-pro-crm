"use client";

import { useEffect, useState } from "react";
import { Deal } from "@/lib/schema";
import {
  Plus,
  X,
  Check,
  Trash2,
  DollarSign,
  GripVertical,
} from "lucide-react";

const STAGES = [
  { key: "lead", label: "Lead", color: "#6b7280", bg: "#f3f4f6" },
  { key: "qualified", label: "Qualified", color: "#2563eb", bg: "#eff6ff" },
  { key: "proposal", label: "Proposal", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "negotiation", label: "Negotiation", color: "#d97706", bg: "#fffbeb" },
  { key: "closed_won", label: "Won ✓", color: "#059669", bg: "#ecfdf5" },
  { key: "closed_lost", label: "Lost ✗", color: "#dc2626", bg: "#fef2f2" },
];

const PRIORITIES = [
  { key: "low", label: "Low", color: "#059669" },
  { key: "medium", label: "Medium", color: "#d97706" },
  { key: "high", label: "High", color: "#dc2626" },
];

const EMPTY_FORM = {
  title: "",
  value: "",
  stage: "lead",
  priority: "medium",
  notes: "",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const res = await fetch("/api/deals");
    const data = await res.json();
    setDeals(data);
    setLoading(false);
  };

  const handleOpen = (deal?: Deal, stage?: string) => {
    if (deal) {
      setEditing(deal);
      setForm({
        title: deal.title,
        value: String(deal.value || ""),
        stage: deal.stage || "lead",
        priority: deal.priority || "medium",
        notes: deal.notes || "",
      });
    } else {
      setEditing(null);
      setForm({ ...EMPTY_FORM, stage: stage || "lead" });
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      const payload = {
        ...form,
        value: Number(form.value) || 0,
      };

      if (editing) {
        const res = await fetch(`/api/deals/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setDeals(deals.map((d) => d.id === updated.id ? updated : d));
      } else {
        const res = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setDeals([...deals, created]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    setDeals(deals.filter((d) => d.id !== id));
  };

  // Drag & Drop handlers
  const handleDragStart = (dealId: string) => {
    setDragging(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (!dragging) return;

    const deal = deals.find((d) => d.id === dragging);
    if (!deal || deal.stage === stage) {
      setDragging(null);
      return;
    }

    // Optimistic update
    setDeals(deals.map((d) =>
      d.id === dragging ? { ...d, stage: stage as Deal["stage"] } : d
    ));

    // API call
    await fetch(`/api/deals/${dragging}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...deal, stage }),
    });

    setDragging(null);
  };

  const getStageDeals = (stage: string) =>
    deals.filter((d) => d.stage === stage);

  const getStageTotal = (stage: string) =>
    getStageDeals(stage).reduce((sum, d) => sum + (d.value || 0), 0);

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "4rem", color: "#9ca3af" }}>
        Loading deals...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
            Deals Pipeline
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {deals.length} deals · $
            {deals.reduce((s, d) => s + (d.value || 0), 0).toLocaleString()} total
          </p>
        </div>
        <button
          onClick={() => handleOpen()}
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
          Add Deal
        </button>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        paddingBottom: "1rem",
      }}>
        {STAGES.map((stage) => {
          const stageDeals = getStageDeals(stage.key);
          const stageTotal = getStageTotal(stage.key);

          return (
            <div
              key={stage.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
              style={{
                minWidth: "240px",
                maxWidth: "280px",
                flex: "0 0 auto",
                background: "#f9fafb",
                borderRadius: "1rem",
                padding: "1rem",
                border: "2px dashed transparent",
                transition: "border-color 0.2s",
              }}
            >
              {/* Column header */}
              <div style={{ marginBottom: "0.875rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.375rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: stage.color,
                    }} />
                    <span style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {stage.label}
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      background: stage.bg,
                      color: stage.color,
                      padding: "0.1rem 0.5rem",
                      borderRadius: "999px",
                      fontWeight: 600,
                    }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpen(undefined, stage.key)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9ca3af",
                      display: "flex",
                      padding: "0.125rem",
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {stageTotal > 0 && (
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                    ${stageTotal.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {stageDeals.map((deal) => {
                  const priority = PRIORITIES.find((p) => p.key === deal.priority);
                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      onDragEnd={() => setDragging(null)}
                      style={{
                        background: "white",
                        borderRadius: "0.75rem",
                        padding: "0.875rem",
                        border: "1px solid #e5e7eb",
                        cursor: "grab",
                        opacity: dragging === deal.id ? 0.5 : 1,
                        transition: "all 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.5rem",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <GripVertical size={14} color="#d1d5db" />
                          <p style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#111827",
                            lineHeight: 1.3,
                          }}>
                            {deal.title}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button
                            onClick={() => handleOpen(deal)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#9ca3af",
                              padding: "0.125rem",
                              display: "flex",
                            }}
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(deal.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#fca5a5",
                              padding: "0.125rem",
                              display: "flex",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {deal.value ? (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          marginBottom: "0.5rem",
                        }}>
                          <DollarSign size={13} color="#059669" />
                          <span style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#059669",
                          }}>
                            {deal.value.toLocaleString()}
                          </span>
                        </div>
                      ) : null}

                      {priority && (
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          background: `${priority.color}15`,
                          color: priority.color,
                        }}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "1.5rem 0.5rem",
                    color: "#d1d5db",
                    fontSize: "0.75rem",
                    border: "2px dashed #e5e7eb",
                    borderRadius: "0.75rem",
                  }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
              <h2 style={{ fontWeight: 700, color: "#111827" }}>
                {editing ? "Edit Deal" : "New Deal"}
              </h2>
              <button
                onClick={handleClose}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}>
                  Deal Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Website Redesign Project"
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
                  Value ($)
                </label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="5000"
                  style={INPUT_STYLE}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "0.375rem",
                  }}>
                    Stage
                  </label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    style={INPUT_STYLE}
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "0.375rem",
                  }}>
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={INPUT_STYLE}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}>
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "inherit" }}
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
                onClick={handleClose}
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
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}