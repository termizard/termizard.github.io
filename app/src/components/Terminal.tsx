import React from "react";
import { useTranslation } from "react-i18next";

export default function Terminal() {
    const { t } = useTranslation();

    return (
        <section>
            <div className="terminal-window">
                <div className="terminal-header" aria-hidden>
                    <div className="dot red" />
                    <div className="dot yellow" />
                    <div className="dot green" />
                </div>

                <div
                    className="terminal-body"
                    dangerouslySetInnerHTML={{ __html: t("terminalHtml") }}
                />
            </div>
        </section>
    );
}
