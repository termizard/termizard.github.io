import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLenis } from "@studio-freight/react-lenis";
import { useActiveSection } from "../hooks/useActiveSection";

const GITHUB_URL = "https://github.com/termizard/termizard";

export default function Header() {
    const { t, i18n } = useTranslation();
    const lenis = useLenis();
    const brand = t("heroTitle", "Termizard");

    const [open, setOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [, setTick] = useState(0);

    // Синхронизация языка
    useEffect(() => {
        const onChange = () => setTick((s) => s + 1);
        i18n.on("languageChanged", onChange);
        return () => i18n.off("languageChanged", onChange);
    }, [i18n]);

    // Логика скрытия хидера при скролле
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;

            // Если открыто мобильное меню, не скрываем хидер
            if (open) {
                setIsVisible(true);
                return;
            }

            // Скрываем при скролле вниз (если прокрутили больше 100px)
            // Показываем при скролле вверх
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", controlHeader, { passive: true });
        return () => window.removeEventListener("scroll", controlHeader);
    }, [lastScrollY, open]);

    const changeLang = async (code: string) => {
        await i18n.changeLanguage(code);
        try {
            localStorage.setItem("i18nextLng", code);
        } catch {}
        setOpen(false);
    };

    const current = i18n.language || "en";
    const activeId = useActiveSection();

    const scrollToTop = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setOpen(false);
        if (lenis && typeof lenis.scrollTo === "function") {
            lenis.scrollTo(0);
            return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    function handleDocsToggle(e: React.MouseEvent) {
        e.preventDefault();
        setOpen(false);

        const currentHash = window.location.hash || "#home";
        const onDocs = currentHash.startsWith("#docs");

        if (!onDocs) {
            window.location.hash = "#docs";
            const scrollTarget = 0;
            if (lenis && typeof lenis.scrollTo === "function") {
                setTimeout(() => lenis.scrollTo(scrollTarget), 60);
            } else {
                setTimeout(() => window.scrollTo({ top: scrollTarget, behavior: "smooth" }), 60);
            }
        }
    }

    return (
        <header
            className={`header ${!isVisible ? "header--hidden" : ""}`}
            role="banner"
        >
            <div className="header-left">
                <a href="#home" className="logo" aria-label={brand} onClick={scrollToTop}>
                    <div className="logo-icon" aria-hidden>
                        🦎
                    </div>
                    <span className="brand-name">{brand}</span>
                </a>
            </div>

            <nav
                className={`header-nav ${open ? "open" : ""}`}
                role="navigation"
                aria-label={t("nav.aria", "Main navigation")}
            >
                <div className="nav-buttons" role="menubar">
                    <a
                        href="#home"
                        className={`btn btn-ghost nav-btn ${activeId === "home" ? "active" : ""}`}
                        aria-current={activeId === "home" ? "page" : undefined}
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToTop(e);
                            window.location.hash = "#home";
                        }}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                            <path fill="currentColor" d="M12 3.3l8 6.2V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1V9.5l8-6.2z" />
                        </svg>
                        <span className="btn-label">{t("menu.home", "Home")}</span>
                    </a>

                    <a
                        href="#docs"
                        className={`btn btn-ghost nav-btn ${activeId === "docs" ? "active" : ""}`}
                        aria-current={activeId === "docs" ? "page" : undefined}
                        onClick={handleDocsToggle}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                            <path
                                fill="currentColor"
                                d="M6 2h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6V2zm10 0h2v16h-2V2zM4 6h1v14a2 2 0 0 0 2 2h9v-2H7V6H4z"
                            />
                        </svg>
                        <span className="btn-label">{t("menu.docs", "Docs")}</span>
                    </a>
                </div>

                <div className="header-actions">
                    <a
                        href={GITHUB_URL}
                        className="btn btn-ghost github-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg className="github-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                            <path
                                fill="currentColor"
                                d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.93 3.19 9.11 7.61 10.59.56.1.76-.24.76-.53 0-.26-.01-1.12-.02-2.03-3.09.67-3.74-1.49-3.74-1.49-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.66 2.55 1.18 3.17.9.1-.7.38-1.18.69-1.45-2.47-.28-5.07-1.24-5.07-5.52 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.12 1.15a10.8 10.8 0 0 1 2.84-.38c.96.01 1.93.13 2.84.38 2.17-1.45 3.12-1.15 3.12-1.15.61 1.54.23 2.68.11 2.96.72.79 1.16 1.79 1.16 3.01 0 4.29-2.61 5.24-5.09 5.52.39.34.74 1.02.74 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.77.53 4.42-1.48 7.61-5.66 7.61-10.59C23.25 5.48 18.27.5 12 .5z"
                            />
                        </svg>
                        <span className="btn-label">GitHub</span>
                    </a>

                    <div className="lang-switch" role="tablist">
                        {(["ru", "en", "de"] as const).map((code) => (
                            <button
                                key={code}
                                role="tab"
                                aria-selected={code === current}
                                className={`lang-btn ${code === current ? "active" : ""}`}
                                onClick={() => changeLang(code)}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <button
                className={`hamburger ${open ? "is-open" : ""}`}
                aria-label={open ? t("menu.close") : t("menu.open")}
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
            >
                <span className="hamburger-box">
                    <span className="hamburger-inner" />
                </span>
            </button>
        </header>
    );
}
