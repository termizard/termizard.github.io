import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

type Heading = { depth: number; text: string };
type DocItem = { path: string; title: string; headings: Heading[]; lang: string; group: string };
type VersionData = { version: string; isLatest: boolean; docs: DocItem[] };

const defaultLang = "en";

export default function Docs() {
    const { t, i18n } = useTranslation();
    
    // States for versioning
    const [allVersionsData, setAllVersionsData] = useState<VersionData[]>([]);
    const [currentVersion, setCurrentVersion] = useState<string>("");
    
    // List of documents for the SELECTED version
    const [list, setList] = useState<DocItem[]>([]);
    
    const [selected, setSelected] = useState<DocItem | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [html, setHtml] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pendingHashRef = useRef<string | null>(null);

    // 1. We are monitoring the interface language changes (i18n)
    useEffect(() => {
        if (!selected || list.length === 0) return;
        
        const uiLang = i18n.language || defaultLang;
        if (selected.lang === uiLang) return;

        // We are looking for the same document (by group) in a new language within the CURRENT version
        const newDoc = list.find((item) => item.group === selected.group && item.lang === uiLang);

        if (newDoc) {
            setSelected(newDoc);
            // We write the new path to the hash while preserving the current version
            window.location.hash = `#docs/v${currentVersion}/${encodeURIComponent(newDoc.path.replace(`${currentVersion}/`, ""))}`;
        }
    }, [i18n.language, list, currentVersion]);

    // 2. Initial request for the version and document index
    useEffect(() => {
        fetch("docs/index.json")
            .then((r) => {
                if (!r.ok) throw new Error(`index.json fetch failed: ${r.status}`);
                return r.json();
            })
            .then((data: any) => {
                if (!Array.isArray(data)) throw new Error("index.json is not an array");
                
                // Normalizing the version structure data
                const normalizedVersions: VersionData[] = data.map((v: any) => ({
                    version: String(v.version),
                    isLatest: Boolean(v.isLatest),
                    docs: (v.docs || []).map((it: any) => ({
                        path: String(it.path || ""),
                        title: String(it.title || it.path || "Untitled"),
                        headings: Array.isArray(it.headings)
                            ? it.headings.map((h: any) => ({ depth: Number(h.depth || 0), text: String(h.text || "") }))
                            : [],
                        lang: String(it.lang || defaultLang),
                        group: String(it.group || ""),
                    }))
                }));

                setAllVersionsData(normalizedVersions);

                // Determine the latest version by default
                const latestVerObj = normalizedVersions.find(v => v.isLatest) || normalizedVersions[0];
                const latestVersionStr = latestVerObj ? latestVerObj.version : "";

                // Parsing the current URL hash
                const hash = window.location.hash || "";
                let targetVersion = latestVersionStr;
                let targetDocPathInsideVersion = "";

                if (hash.startsWith("#docs/")) {
                    const rawPath = hash.slice("#docs/".length).split("#")[0];
                    const decodedPath = decodeURIComponent(rawPath);

                    // Check if the URL has a version prefix (e.g. v0.0.3/...)
                    const versionMatch = decodedPath.match(/^v(\d+\.\d+\.\d+)\/(.*)$/);
                    
                    if (versionMatch) {
                        targetVersion = versionMatch[1];
                        targetDocPathInsideVersion = versionMatch[2];
                    } else {
                        // If there is no version in the URL, but a file is specified (old format), 
                        // use the default version and leave the file
                        targetDocPathInsideVersion = decodedPath;
                    }
                }

                setCurrentVersion(targetVersion);

                // Filter documents according to the selected version
                const activeVersionData = normalizedVersions.find(v => v.version === targetVersion) || latestVerObj;
                const activeDocs = activeVersionData ? activeVersionData.docs : [];
                setList(activeDocs);

                // Select the active document
                if (activeDocs.length > 0) {
                    let found = activeDocs.find(x => x.path === `${targetVersion}/${targetDocPathInsideVersion}`);
                    
                    // If a specific file is not found, simply search for a matching file/group name
                    if (!found && targetDocPathInsideVersion) {
                        const cleanGroup = targetDocPathInsideVersion.replace(/\.html?$/, "");
                        found = activeDocs.find(x => x.group === cleanGroup && x.lang === (i18n.language || defaultLang)) 
                                || activeDocs.find(x => x.group === cleanGroup) ;
                    }

                    const selectedDoc = found || activeDocs.find(x => x.lang === (i18n.language || defaultLang)) || activeDocs[0];
                    
                    if (selectedDoc) {
                        setSelected(selectedDoc);
                        setSelectedGroup(selectedDoc.group);
                        try { i18n.changeLanguage(selectedDoc.lang); } catch {}
                        
                        // We force the correct hash with the version into the URL
                        const relativePath = selectedDoc.path.replace(`${targetVersion}/`, "");
                        window.location.hash = `#docs/v${targetVersion}/${encodeURIComponent(relativePath)}`;
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load docs index:", err);
                setAllVersionsData([]);
            });
    }, [i18n]);

    // 3. oading HTML content of the selected document
    useEffect(() => {
        if (!selected) {
            setHtml(`<p>${t("docs.selectDocument", "Select a document")}</p>`);
            return;
        }
        // Request for a file (e.g. docs/0.0.3/intro1.en.html)
        const url = `docs/${selected.path}`;
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
                    if (anchor && !anchor.startsWith("docs/")) {
                        setTimeout(() => {
                            const el = document.getElementById(decodeURIComponent(anchor));
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 120);
                    }
                }
            })
            .catch((err) => {
                console.error("Failed to load doc:", err);
                setHtml(`<h1>${t("docs.errorTitle", "Error")}</h1><p>${t("docs.errorMessage", "The documentation page could not be loaded.")}</p>`);
            });
    }, [selected, t]);

    // 4. Listen to manual hash changes in the browser address bar
    useEffect(() => {
        const onHash = () => {
            const hash = window.location.hash || "";
            if (!hash.startsWith("#docs/")) return;
            
            const rawPath = hash.slice("#docs/".length).split("#")[0];
            const decodedPath = decodeURIComponent(rawPath);
            const versionMatch = decodedPath.match(/^v(\d+\.\d+\.\d+)\/(.*)$/);
            
            if (!versionMatch) return;

            const hashVersion = versionMatch[1];
            const hashDocPath = versionMatch[2];

            // If the version in the URL has changed, switch the version context
            if (hashVersion !== currentVersion) {
                setCurrentVersion(hashVersion);
                const targetVerData = allVersionsData.find(v => v.version === hashVersion);
                if (targetVerData) {
                    setList(targetVerData.docs);
                    const found = targetVerData.docs.find(x => x.path === `${hashVersion}/${hashDocPath}`);
                    if (found) {
                        setSelected(found);
                        setSelectedGroup(found.group);
                        try { i18n.changeLanguage(found.lang); } catch {}
                    }
                }
            } else {
                // If the version is the same, just switch the document within this version
                const foundExact = list.find((x) => x.path === `${currentVersion}/${hashDocPath}`);
                if (foundExact) {
                    setSelected(foundExact);
                    setSelectedGroup(foundExact.group);
                    try { i18n.changeLanguage(foundExact.lang); } catch {}
                }
            }
        };

        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [list, i18n, currentVersion, allVersionsData]);

    // Version change handler in the drop-down list
    const handleVersionChange = (newVer: string) => {
        if (newVer === currentVersion) return;
        
        setCurrentVersion(newVer);
        const targetVerData = allVersionsData.find(v => v.version === newVer);
        const targetDocs = targetVerData ? targetVerData.docs : [];
        setList(targetDocs);

        // We try to keep the same document open when switching to another version.
        let nextDoc = null;
        if (selected) {
            nextDoc = targetDocs.find(x => x.group === selected.group && x.lang === selected.lang)
                   || targetDocs.find(x => x.group === selected.group)
                   || targetDocs[0];
        } else {
            nextDoc = targetDocs[0];
        }

        if (nextDoc) {
            setSelected(nextDoc);
            setSelectedGroup(nextDoc.group);
            const relativePath = nextDoc.path.replace(`${newVer}/`, "");
            window.location.hash = `#docs/v${newVer}/${encodeURIComponent(relativePath)}`;
        }
    };

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
        const relativePath = item.path.replace(`${currentVersion}/`, "");
        window.location.hash = `#docs/v${currentVersion}/${encodeURIComponent(relativePath)}`;
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

                {/* VERSION SELECTOR */}
                {allVersionsData.length > 0 && (
                    <div className="docs-version-selector" style={{ padding: "0 15px 15px 15px" }}>
                        <label style={{ fontSize: "12px", display: "block", marginBottom: "4px", opacity: 0.7 }}>
                            {t("docs.version", "Version")}:
                        </label>
                        <select 
                            value={currentVersion} 
                            onChange={(e) => handleVersionChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                background: "#fff",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            {allVersionsData.map((v) => (
                                <option key={v.version} value={v.version}>
                                    {v.version} {v.isLatest ? `(${t("docs.latest", "latest")})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

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
                                    href={`#docs/v${currentVersion}/${encodeURIComponent(display.path.replace(`${currentVersion}/`, ""))}`}
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
                                            const relPath = display.path.replace(`${currentVersion}/`, "");
                                            return (
                                                <a
                                                    key={i}
                                                    href={`#docs/v${currentVersion}/${encodeURIComponent(relPath)}#${encodeURIComponent(anchor)}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        window.location.hash = `#docs/v${currentVersion}/${encodeURIComponent(relPath)}#${encodeURIComponent(anchor)}`;
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
                </div>

                <article className="docs-article" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    );
}