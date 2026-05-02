import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

type Heading = { depth: number; text: string };
type DocItem = { path: string; title: string; headings: Heading[]; lang: string; group: string };

const defaultLang = "en";

export default function Docs() {
    const { t, i18n } = useTranslation();
    const [list, setList] = useState<DocItem[]>([]);
    const [selected, setSelected] = useState<DocItem | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [html, setHtml] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pendingHashRef = useRef<string | null>(null);

    // keep component aware of current UI language from header
    useEffect(() => {
        // when header changes language via i18n, this effect will run (i18n.language is reactive)
        // we don't store it in local state; we read i18n.language where needed
    }, [i18n.language]);

    useEffect(() => {
        fetch("/docs/index.json")
            .then((r) => {
                if (!r.ok) throw new Error(`index.json fetch failed: ${r.status}`);
                return r.json();
            })
            .then((data: unknown) => {
                if (!Array.isArray(data)) throw new Error("index.json is not an array");
                const normalized = data.map((it: any) => ({
                    path: String(it.path || ""),
                    title: String(it.title || it.path || "Untitled"),
                    headings: Array.isArray(it.headings)
                        ? it.headings.map((h: any) => ({ depth: Number(h.depth || 0), text: String(h.text || "") }))
                        : [],
                    lang: String(it.lang || defaultLang),
                    group: String(it.group || (it.path || "").replace(/\.html?$/, "")),
                })) as DocItem[];

                setList(normalized);

                // initial selection: prefer current UI language
                const hash = window.location.hash || "";
                if (hash.startsWith("#docs/")) {
                    const docPath = decodeURIComponent(hash.slice("#docs/".length).split("#")[0]);
                    const found = normalized.find((x) => x.path === docPath);
                    if (found) {
                        setSelected(found);
                        setSelectedGroup(found.group);
                        try { i18n.changeLanguage(found.lang); } catch {}
                    } else {
                        // try group#lang or fallback to UI language
                        const maybe = docPath.split("#");
                        const groupPart = maybe[0];
                        const langPart = maybe[1];
                        if (groupPart) {
                            const byGroupAndLang = normalized.find((x) => x.group === groupPart && x.lang === (langPart || i18n.language || defaultLang));
                            if (byGroupAndLang) {
                                setSelected(byGroupAndLang);
                                setSelectedGroup(byGroupAndLang.group);
                                try { i18n.changeLanguage(byGroupAndLang.lang); } catch {}
                            } else {
                                pendingHashRef.current = hash;
                                const fallback = normalized.find((x) => x.lang === (i18n.language || defaultLang)) || normalized[0];
                                if (fallback) {
                                    setSelected(fallback);
                                    setSelectedGroup(fallback.group);
                                }
                            }
                        } else {
                            pendingHashRef.current = hash;
                            const fallback = normalized.find((x) => x.lang === (i18n.language || defaultLang)) || normalized[0];
                            if (fallback) {
                                setSelected(fallback);
                                setSelectedGroup(fallback.group);
                            }
                        }
                    }
                } else {
                    const first = normalized.find((x) => x.lang === (i18n.language || defaultLang)) || normalized[0];
                    if (first) {
                        setSelected(first);
                        setSelectedGroup(first.group);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load docs index:", err);
                setList([]);
            });
    }, [i18n, i18n.language]);

    useEffect(() => {
        if (!selected) {
            setHtml(`<p>${t("docs.selectDocument", "Select a document")}</p>`);
            return;
        }
        const url = `/docs/${selected.path}`;
        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
                return r.text();
            })
            .then((text) => {
                setHtml(text);
                const fullHash = window.location.hash || "";
                if (fullHash.includes("#")) {
                    const parts = fullHash.split("#");
                    const anchor = parts[parts.length - 1];
                    if (anchor) {
                        setTimeout(() => {
                            const el = document.getElementById(decodeURIComponent(anchor));
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 120);
                    }
                } else if (pendingHashRef.current) {
                    const ph = pendingHashRef.current;
                    if (ph.includes("#")) {
                        const anchor = ph.split("#").pop();
                        if (anchor) {
                            setTimeout(() => {
                                const el = document.getElementById(decodeURIComponent(anchor));
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 120);
                        }
                    }
                    pendingHashRef.current = null;
                }
            })
            .catch((err) => {
                console.error("Failed to load doc:", err);
                setHtml(`<h1>${t("docs.errorTitle", "Error")}</h1><p>${t("docs.errorMessage", "The documentation page could not be loaded.")}</p>`);
            });
    }, [selected, t]);

    useEffect(() => {
        const onHash = () => {
            const hash = window.location.hash || "";
            if (!hash.startsWith("#docs/")) return;
            const [docPart] = hash.slice("#docs/".length).split("#");
            const docPath = decodeURIComponent(docPart || "");
            if (!docPath) return;
            const foundExact = list.find((x) => x.path === docPath);
            if (foundExact) {
                setSelected(foundExact);
                setSelectedGroup(foundExact.group);
                try { i18n.changeLanguage(foundExact.lang); } catch {}
                return;
            }
            const maybe = docPath.split("#");
            const groupPart = maybe[0];
            const langPart = maybe[1];
            if (groupPart) {
                const found = list.find((x) => x.group === groupPart && x.lang === (langPart || i18n.language || defaultLang));
                if (found) {
                    setSelected(found);
                    setSelectedGroup(found.group);
                    try { i18n.changeLanguage(found.lang); } catch {}
                    return;
                }
            }
            pendingHashRef.current = hash;
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [list, i18n]);

    function slugify(text: string) {
        return String(text).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    }

    function goHome() {
        window.location.hash = "#home";
    }

    function selectItem(item: DocItem) {
        setSelected(item);
        setSelectedGroup(item.group);
        try { i18n.changeLanguage(item.lang); } catch {}
        window.location.hash = `#docs/${encodeURIComponent(item.path)}`;
        setSidebarOpen(false);
    }

    return (
        <div className="docs-root site-panel" style={{ display: "flex", gap: 20 }}>
            <aside className={`docs-sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="docs-sidebar-header">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button
                            className="btn-ghost"
                            onClick={() => goHome()}
                            aria-label={t("docs.backHome", "Home")}
                            title={t("docs.backHome", "Home")}
                            style={{ fontSize: 16, lineHeight: 1 }}
                        >
                            ←
                        </button>

                        <strong>{t("docs.title", "Docs")}</strong>
                    </div>
                    <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label={t("docs.closeSidebar", "Close")}>
                        ✕
                    </button>
                </div>

                <nav className="docs-nav" aria-label={t("docs.navigation", "Documentation")}>
                    {list.length === 0 && <div className="muted">{t("docs.notFound", "Documentation not found")}</div>}

                    {Object.entries(
                        list.reduce<Record<string, DocItem[]>>((acc, it) => {
                            (acc[it.group] = acc[it.group] || []).push(it);
                            return acc;
                        }, {})
                    ).map(([group, items]) => {
                        const uiLang = i18n.language || defaultLang;
                        const display = items.find((x) => x.lang === uiLang) || items.find((x) => x.lang === defaultLang) || items[0];
                        const subs = display.headings.filter((h) => h.depth > 1);
                        return (
                            <div key={group} className={`docs-section ${selectedGroup === group ? "active" : ""}`}>
                                <a
                                    href={`#docs/${encodeURIComponent(display.path)}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        selectItem(display);
                                    }}
                                    className="docs-link"
                                >
                                    {String(display.title)}
                                </a>

                                {subs.length > 0 && (
                                    <div className="docs-subs">
                                        {subs.map((s, i) => {
                                            const text = String(s.text || "");
                                            const anchor = slugify(text);
                                            return (
                                                <a
                                                    key={i}
                                                    href={`#docs/${encodeURIComponent(display.path)}#${encodeURIComponent(anchor)}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.location.hash = `#docs/${encodeURIComponent(display.path)}#${encodeURIComponent(anchor)}`;
                                                        setSelected(display);
                                                        setSelectedGroup(group);
                                                        setSidebarOpen(false);
                                                    }}
                                                    className="docs-sub-link"
                                                >
                                                    {text}
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            <div className="docs-content" style={{ flex: 1 }}>
                <div className="docs-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <button className="btn-ghost" onClick={() => setSidebarOpen((s) => !s)} aria-label={t("docs.toggleSidebar", "Открыть меню")}>
                            ☰
                        </button>
                        <span style={{ marginLeft: 12, fontWeight: 600 }}>{selected?.title || t("docs.title", "Документация")}</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {/* You can add additional buttons here if required */}
                    </div>
                </div>

                <article className="docs-article" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    );
}
