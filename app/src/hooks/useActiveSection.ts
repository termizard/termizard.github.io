import { useEffect, useState } from "react";

export function useActiveSection(root: Element | null = null, thresholds = [0.25, 0.5, 0.75]) {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const panels = Array.from(document.querySelectorAll<HTMLElement>(".panel"));
        if (!panels.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting);
                if (visible.length === 0) return;
                visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                const top = visible[0];
                const id = (top.target as HTMLElement).id || null;
                setActiveId(id);
            },
            {
                root: root ?? null,
                threshold: thresholds,
            }
        );

        panels.forEach(p => observer.observe(p));
        if (!activeId && panels[0]) setActiveId(panels[0].id || null);

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return activeId;
}
