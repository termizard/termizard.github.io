import { useText } from "../i18n/lang";

export default function Hero() {
    const t = useText();
    return (
        <section className="hero">
            <h1>{t("heroTitle")}</h1>
            <p>{t("heroDesc")}</p>
        </section>
    );
}
