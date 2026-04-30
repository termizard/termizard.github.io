import { useText } from "../i18n/lang";

export default function Terminal() {
    const t = useText();
    return (
        <section>
            <div className="terminal-window">
                <div className="terminal-header">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                </div>
                <div
                    className="terminal-body"
                    dangerouslySetInnerHTML={{ __html: t("terminalHtml") }}
                />
            </div>
        </section>
    );
}
