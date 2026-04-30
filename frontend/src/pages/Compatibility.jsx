import React, { useState } from "react";
import { SectionHeader } from "../components/UI";

const foodOptions = [
    {
        label: "🔴 Ethylene Producers",
        items: [
            { value: "E", name: "Apple", emoji: "🍎" },
            { value: "E", name: "Banana", emoji: "🍌" },
            { value: "E", name: "Mango", emoji: "🥭" },
            { value: "E", name: "Tomato", emoji: "🍅" },
            { value: "E", name: "Avocado", emoji: "🥑" },
            { value: "E", name: "Pear", emoji: "🍐" },
            { value: "E", name: "Kiwi", emoji: "🥝" },
        ],
    },
    {
        label: "🟡 Ethylene Sensitive",
        items: [
            { value: "S", name: "Spinach", emoji: "🥬" },
            { value: "S", name: "Broccoli", emoji: "🥦" },
            { value: "S", name: "Carrot", emoji: "🥕" },
            { value: "S", name: "Lettuce", emoji: "🥬" },
            { value: "S", name: "Cucumber", emoji: "🥒" },
            { value: "S", name: "Capsicum", emoji: "🫑" },
        ],
    },
    {
        label: "🟢 Safe With Most",
        items: [
            { value: "N", name: "Orange", emoji: "🍊" },
            { value: "N", name: "Lemon", emoji: "🍋" },
            { value: "N", name: "Grapes", emoji: "🍇" },
            { value: "N", name: "Strawberry", emoji: "🍓" },
        ],
    },
    {
        label: "⚪ Separate Storage",
        items: [
            { value: "P", name: "Onion", emoji: "🧅" },
            { value: "P", name: "Potato", emoji: "🥔" },
            { value: "P", name: "Garlic", emoji: "🧄" },
        ],
    },
];

export default function CompatibilityChecker() {
    const [item1, setItem1] = useState(null);
    const [item2, setItem2] = useState(null);
    const [result, setResult] = useState(null);

    const handleCheck = () => {
        if (!item1 || !item2) {
            setResult(null);
            return;
        }

        let bg, border, color, icon, title, body;

        if (
            (item1.value === "E" && item2.value === "S") ||
            (item1.value === "S" && item2.value === "E")
        ) {
            bg = "rgba(239,68,68,0.1)";
            border = "1px solid rgba(239,68,68,0.3)";
            color = "#ef4444";
            icon = "✗";
            title = "Do NOT Store Together";
            body = (
                <>
                    <strong>{item1.name}</strong> and <strong>{item2.name}</strong> must not share the same drawer.
                </>
            );
        } else if (item1.value === "P" || item2.value === "P") {
            bg = "rgba(234,179,8,0.1)";
            border = "1px solid rgba(234,179,8,0.3)";
            color = "#eab308";
            icon = "⚠";
            title = "Use Dedicated Storage Zones";
            const strongItem = item1.value === "P" ? item1 : item2;
            body = <> <strong>{strongItem.name}</strong> has a strong odour. </>;
        } else if (item1.value === "E" && item2.value === "E") {
            bg = "rgba(234,179,8,0.1)";
            border = "1px solid rgba(234,179,8,0.3)";
            color = "#eab308";
            icon = "⚠";
            title = "Store With Caution";
            body = <>Both <strong>{item1.name}</strong> and <strong>{item2.name}</strong> produce ethylene.</>;
        } else {
            bg = "rgba(34,197,94,0.1)";
            border = "1px solid rgba(34,197,94,0.3)";
            color = "#22c55e";
            icon = "✓";
            title = "Safe to Store Together";
            body = <> <strong>{item1.name}</strong> and <strong>{item2.name}</strong> are compatible. </>;
        }

        setResult({ bg, border, color, icon, title, body });
    };

    const renderSelect = (setItem) => (
        <select
            style={{
                width: "100%",
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#020617",
                color: "#e2e8f0",
                fontSize: 13,
            }}
            onChange={(e) => {
                const selected = foodOptions.flatMap(g => g.items).find(i => i.name === e.target.value);
                setItem(selected);
            }}
        >
            <option value="">— Select —</option>
            {foodOptions.map((group, i) => (
                <optgroup key={i} label={group.label}>
                    {group.items.map((item, idx) => (
                        <option key={idx} value={item.name}>
                            {item.emoji} {item.name}
                        </option>
                    ))}
                </optgroup>
            ))}
        </select>
    );

    const pillStyle = {
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        background: "rgba(148,163,184,0.08)",
        border: "1px solid #334155",
        color: "#cbd5f5"
    };

    return (
        <div>
            <SectionHeader title="Compatibility" subtitle="Food storage compatibility checker" />

            {/* ── Checker Card ── */}
            <div style={{
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 20,
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(8px)",
                marginBottom: 20
            }}>
                <div style={{ fontWeight: 600, marginBottom: 16, color: "#f1f5f9" }}>
                    Check Storage Compatibility
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Food Item 1</div>
                        {renderSelect(setItem1)}
                    </div>

                    <div style={{
                        alignSelf: "center",
                        padding: "6px 10px",
                        border: "1px solid #334155",
                        borderRadius: 999,
                        fontSize: 12,
                        color: "#64748b",
                        marginTop: "20px"
                    }}>
                        VS
                    </div>

                    <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Food Item 2</div>
                        {renderSelect(setItem2)}
                    </div>
                </div>

                <button
                    onClick={handleCheck}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        border: "none",
                        background: "#0ea5e9",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    Check Compatibility →
                </button>

                {result && (
                    <div style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        background: result.bg,
                        border: result.border
                    }}>
                        <div style={{ fontWeight: 600, color: result.color }}>
                            {result.icon} {result.title}
                        </div>
                        <div style={{ fontSize: 13, color: "#cbd5f5" }}>{result.body}</div>
                    </div>
                )}
            </div>

            {/* ── Ethylene Reference Card ── */}
            <div style={{
                border: "1px solid #1e293b",
                borderRadius: 12,
                padding: 20,
                background: "rgba(15,23,42,0.6)",
                backdropFilter: "blur(8px)"
            }}>
                <div style={{ fontWeight: 600, marginBottom: 16, color: "#f1f5f9" }}>
                    Ethylene Storage Reference
                </div>

                {[
                    {
                        color: "#ef4444",
                        title: "⚠ Produces Ethylene — Keep Separate",
                        items: ["🍎 Apple", "🍌 Banana", "🥭 Mango", "🍅 Tomato", "🥑 Avocado", "🍐 Pear", "🥝 Kiwi"]
                    },
                    {
                        color: "#eab308",
                        title: "🛡 Sensitive to Ethylene",
                        items: ["🥕 Carrot", "🥦 Broccoli", "🥬 Spinach", "🥬 Lettuce", "🥒 Cucumber", "🫑 Capsicum"]
                    },
                    {
                        color: "#22c55e",
                        title: "✓ Safe With Most Items",
                        items: ["🍊 Orange", "🍋 Lemon", "🍇 Grapes", "🍓 Strawberry", "🥛 Dairy (sealed)"]
                    },
                    {
                        color: "#a78bfa",
                        title: "📦 Store Separately",
                        items: ["🧅 Onion", "🥔 Potato", "🧄 Garlic"]
                    }
                ].map((group, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ color: group.color, fontSize: 13, marginBottom: 6 }}>
                            {group.title}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {group.items.map((item, idx) => (
                                <span key={idx} style={pillStyle}>{item}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}