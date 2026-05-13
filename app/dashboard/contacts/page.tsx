"use client";

import { useEffect, useState } from "react";
import { Contact } from "@/lib/schema";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  Users,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  position: "",
  notes: "",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const res = await fetch("/api/contacts");
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  };

  const handleOpen = (contact?: Contact) => {
    if (contact) {
      setEditing(contact);
      setForm({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        notes: contact.notes || "",
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      if (editing) {
        const res = await fetch(`/api/contacts/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setContacts(contacts.map((c) => c.id === updated.id ? updated : c));
      } else {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setContacts([...contacts, created]);
      }
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
            Contacts
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {contacts.length} total contacts
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
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: "400px" }}>
        <Search size={16} style={{
          position: "absolute",
          left: "0.875rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#9ca3af",
        }} />
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...INPUT_STYLE,
            paddingLeft: "2.5rem",
          }}
        />
      </div>

      {/* Table */}
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
            <Users size={40} style={{ margin: "0 auto 1rem" }} />
            <p style={{ fontWeight: 500 }}>No contacts found</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Add your first contact to get started
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                {["Name", "Email", "Phone", "Company", "Position", ""].map((h) => (
                  <th key={h} style={{
                    padding: "0.875rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact, i) => (
                <tr
                  key={contact.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                      <span style={{ fontWeight: 500, color: "#111827", fontSize: "0.875rem" }}>
                        {contact.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {contact.email && <Mail size={13} color="#9ca3af" />}
                      <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {contact.email || "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {contact.phone && <Phone size={13} color="#9ca3af" />}
                      <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {contact.phone || "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      {contact.company && <Building2 size={13} color="#9ca3af" />}
                      <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {contact.company || "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {contact.position || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleOpen(contact)}
                        style={{
                          background: "#f3f4f6",
                          border: "none",
                          borderRadius: "0.5rem",
                          padding: "0.375rem",
                          cursor: "pointer",
                          display: "flex",
                          color: "#6b7280",
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        style={{
                          background: "#fef2f2",
                          border: "none",
                          borderRadius: "0.5rem",
                          padding: "0.375rem",
                          cursor: "pointer",
                          display: "flex",
                          color: "#ef4444",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            maxWidth: "480px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}>
              <h2 style={{ fontWeight: 700, color: "#111827" }}>
                {editing ? "Edit Contact" : "New Contact"}
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
              {[
                { key: "name", label: "Full Name *", placeholder: "John Doe" },
                { key: "email", label: "Email", placeholder: "john@example.com" },
                { key: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
                { key: "company", label: "Company", placeholder: "Acme Inc." },
                { key: "position", label: "Position", placeholder: "CEO" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "0.375rem",
                  }}>
                    {field.label}
                  </label>
                  <input
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}

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
                  style={{
                    ...INPUT_STYLE,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
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
                disabled={saving || !form.name.trim()}
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