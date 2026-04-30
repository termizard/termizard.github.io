import { useText } from "../i18n/lang";

export default function Footer() {
    const t = useText();
    return <footer>{t("footer")}</footer>;
}
