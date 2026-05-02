import React, { useState } from "react";
import { setLang, getLang } from "../i18n/lang";
import { useText } from "../i18n/lang";

const GITHUB_URL = "https://github.com/termizard/termizard";

export default function Header() {
    const t = useText(); // возвращает функцию (key) => string
    const brand = t("heroTitle") || "Termizard";

    const [lang, setLocalLang] = useState(getLang());
    const [open, setOpen] = useState(false);

    const changeLang = (code: string) => {
        setLang(code);
        setLocalLang(code);
        setOpen(false);
    };

    const nav = [
        { id: "home", label: "Главная", href: "#home" },
        { id: "docs", label: "Док", href: "#features" }, // замените href на реальную страницу /docs если есть
    ];

    return (
        <header className="header" role="banner">
            <div className="header-left">
                <a href="#home" className="logo" aria-label={brand}>
                    <div className="logo-icon" aria-hidden>🦎</div>
                    <span className="brand-name">{brand}</span>
                </a>
            </div>

            <nav className={`header-nav ${open ? "open" : ""}`} role="navigation" aria-label="Main navigation">
                <ul className="nav-list">
                    {nav.map((item) => (
                        <li key={item.id} className="nav-item">
                            <a href={item.href} className="nav-link" onClick={() => setOpen(false)}>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="header-actions">
                    <a
                        href={GITHUB_URL}
                        className="btn btn-ghost github-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open GitHub repository"
                    >
                        <svg className="github-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                            <path fill="currentColor" d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.93 3.19 9.11 7.61 10.59.56.1.76-.24.76-.53 0-.26-.01-1.12-.02-2.03-3.09.67-3.74-1.49-3.74-1.49-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.55 1.18 3.17.9.1-.7.38-1.18.69-1.45-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.12 1.15a10.8 10.8 0 0 1 2.84-.38c.96.01 1.93.13 2.84.38 2.17-1.45 3.12-1.15 3.12-1.15.61 1.54.23 2.68.11 2.96.72.79 1.16 1.79 1.16 3.01 0 4.29-2.61 5.24-5.09 5.52.39.34.74 1.02.74 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.77.53 4.42-1.48 7.61-5.66 7.61-10.59C23.25 5.48 18.27.5 12 .5z"/>
                        </svg>
                        <span className="btn-label">GitHub</span>
                    </a>

                    <div className="lang-switch" role="tablist" aria-label="Language switch">
                        {(["ru", "en", "de"] as const).map((code) => (
                            <button
                                key={code}
                                role="tab"
                                aria-selected={code === lang}
                                className={`lang-btn ${code === lang ? "active" : ""}`}
                                onClick={() => changeLang(code)}
                                title={code.toUpperCase()}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* mobile toggle */}
            <button
                className={`hamburger ${open ? "is-open" : ""}`}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
            >
                <span className="hamburger-box"><span className="hamburger-inner" /></span>
            </button>
        </header>
    );
}
