import { useText } from "../i18n/lang";

export default function Hero() {
    const t = useText();

    return (
        <div className="hero-content">
            <div className="hero-text">
                <h1>{t("heroTitle")}</h1>
                <p>{t("heroDesc")}</p>
            </div>

            <div className="hero-image">
                <img src="/lizard.png" alt="Termizard Mascot" />
            </div>
        </div>
    );
}
