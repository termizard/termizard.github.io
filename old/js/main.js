document.addEventListener("DOMContentLoaded", () => {
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const terminalBody = document.getElementById("terminal-body");
    const featuresContainer = document.getElementById("features");
    const footer = document.getElementById("footer");

    // content rendering function
    function renderLang(lang) {
        const data = LANG[lang] || LANG["en"];
        heroTitle.textContent = data.heroTitle;
        heroDesc.textContent = data.heroDesc;
        terminalBody.innerHTML = data.terminal;

        featuresContainer.innerHTML = "";
        data.features.forEach(f => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<h3>${f.title}</h3><p>${f.desc}</p>`;
            featuresContainer.appendChild(card);
        });

        footer.innerHTML = data.footer;
    }

    // source language
    let currentLang = document.documentElement.lang || "ru";
    renderLang(currentLang);

    // language selection
    document.querySelectorAll(".lang-switch button").forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.dataset.lang;
            document.documentElement.lang = lang;
            renderLang(lang);
        });
    });
});
