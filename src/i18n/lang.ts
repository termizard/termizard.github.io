import ru from "./ru.json";
import en from "./en.json";
import de from "./de.json";
import { useSyncExternalStore } from "react";

type LangCode = "ru" | "en" | "de";
type Dict = typeof ru;

const DICTS: Record<LangCode, Dict> = { ru, en, de };

let currentLang: LangCode = "ru";

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

export function setLang(lang: string) {
    if (["ru", "en", "de"].includes(lang)) {
        currentLang = lang as LangCode;
        emit();
    }
}

export function getLang(): LangCode {
    return currentLang;
}

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

export function useText() {
    const lang = useSyncExternalStore(subscribe, () => currentLang);
    const dict = DICTS[lang];
    return (key: keyof Dict) => dict[key];
}

export function useFeatures() {
    const lang = useSyncExternalStore(subscribe, () => currentLang);
    return DICTS[lang].features;
}
