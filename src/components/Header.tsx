import { useState } from "react";
import { setLang, getLang } from "../i18n/lang";

const GITHUB_URL = "https://github.com/termizard/termizard";

export default function Header() {
    const [lang, updateLang] = useState(getLang());

    const changeLang = (code: string) => {
        setLang(code);
        updateLang(code);
    };

    return (
        <header className="header">
            <a href="#" className="logo">
                <div className="logo-icon">🦎</div>
                Termizard
            </a>

            <div className="header-right">
                <a
                    href={GITHUB_URL}
                    className="github-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>

                <div className="lang-switch">
                    {["ru", "en", "de"].map((code) => (
                        <button
                            key={code}
                            data-lang={code}
                            className={code === lang ? "active" : ""}
                            onClick={() => changeLang(code)}
                        >
                            {code.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}
