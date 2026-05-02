import React from "react";
import { useTranslation } from "react-i18next";

type Feature = { title: string; desc: string };

export default function Features() {
    const { t } = useTranslation();
    const features = t("features", { returnObjects: true }) as Feature[];

    if (!Array.isArray(features)) return null;

    return (
        <section className="features" aria-label={t("features.aria", "Features")}>
            {features.map((f, i) => (
                <div className="card" key={i}>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                </div>
            ))}
        </section>
    );
}
