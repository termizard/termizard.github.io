const LANG = {
    ru: {
        heroTitle: "Termizard",
        heroDesc: "Высокопроизводительный эмулятор терминала нового поколения, написанный на Go с рендерингом на GPU.",
        terminal: `
            <div><span class="cmd">❯</span> termizard --status</div>
            <div style="margin: 10px 0;">
                [<span class="success">DONE</span>] PTY spawn (creack/pty)<br>
                [<span class="success">DONE</span>] Stream Reader & UTF-8 Sync<br>
                [<span class="success">DONE</span>] VTE Parser & Grid Update<br>
                [<span class="success">DONE</span>] Console Test Output
            </div>
            <div><span class="cmd">❯</span> Building Stage 2: GPU Rendering...<span class="cursor"></span></div>
        `,
        features: [
            { title: "VTE Parser", desc: "Собственный парсер управляющих последовательностей на основе конечного автомата." },
            { title: "Cross-Platform PTY", desc: "Унифицированный интерфейс для работы с псевдотерминалами в Unix и Windows." },
            { title: "GPU Accelerated", desc: "Архитектура, разделяющая логику терминала и отрисовку, обеспечивающая 60+ FPS." }
        ],
        footer: "&copy; 2026 Termizard Project. Built with Go & Gio."
    },

    en: {
        heroTitle: "Termizard",
        heroDesc: "A high-performance next-generation terminal emulator written in Go with GPU rendering.",
        terminal: `
            <div><span class="cmd">❯</span> termizard --status</div>
            <div style="margin: 10px 0;">
                [<span class="success">DONE</span>] PTY spawn (creack/pty)<br>
                [<span class="success">DONE</span>] Stream Reader & UTF-8 Sync<br>
                [<span class="success">DONE</span>] VTE Parser & Grid Update<br>
                [<span class="success">DONE</span>] Console Test Output
            </div>
            <div><span class="cmd">❯</span> Building Stage 2: GPU Rendering...<span class="cursor"></span></div>
        `,
        features: [
            { title: "VTE Parser", desc: "Custom finite-state machine parser for control sequences." },
            { title: "Cross-Platform PTY", desc: "Unified interface for pseudo-terminals on Unix and Windows." },
            { title: "GPU Accelerated", desc: "Architecture separating logic and rendering for 60+ FPS performance." }
        ],
        footer: "&copy; 2026 Termizard Project. Built with Go & Gio."
    },

    de: {
        heroTitle: "Termizard",
        heroDesc: "Ein leistungsstarker Terminal-Emulator der nächsten Generation, geschrieben in Go mit GPU-Rendering.",
        terminal: `
            <div><span class="cmd">❯</span> termizard --status</div>
            <div style="margin: 10px 0;">
                [<span class="success">DONE</span>] PTY-Start (creack/pty)<br>
                [<span class="success">DONE</span>] Stream Reader & UTF-8 Sync<br>
                [<span class="success">DONE</span>] VTE Parser & Grid Update<br>
                [<span class="success">DONE</span>] Konsolenausgabe-Test
            </div>
            <div><span class="cmd">❯</span> Baue Phase 2: GPU Rendering...<span class="cursor"></span></div>
        `,
        features: [
            { title: "VTE Parser", desc: "Eigener Parser für Steuersequenzen basierend auf endlichen Automaten." },
            { title: "Cross-Platform PTY", desc: "Einheitliche Schnittstelle für Pseudo-Terminals unter Unix und Windows." },
            { title: "GPU Accelerated", desc: "Architektur trennt Logik und Rendering für über 60 FPS." }
        ],
        footer: "&copy; 2026 Termizard Projekt. Entwickelt mit Go & Gio."
    }
};
