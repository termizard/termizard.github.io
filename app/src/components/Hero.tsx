import React from "react";
import { useTranslation } from "react-i18next";

export default function Hero() {
    const { t } = useTranslation();

    return (
        <section>
            <div className="hero-content">
                <div className="hero-text">
                    <h1>{t("heroTitle")}</h1>
                    <p>{t("heroDesc")}</p>
                </div>

                <div className="hero-image">
                    <img src="/lizard.png" alt={t("heroImageAlt", "Termizard Mascot")} />
                </div>
            </div>
        </section>
    );
}
