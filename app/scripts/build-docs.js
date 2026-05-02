// scripts/build-docs.js
// Static page generator from docs/**/*.md -> public/docs/*.html + index.json (multi-language)
const fs = require('fs').promises;
const path = require('path');
const fg = require('fast-glob');
const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

const DOCS_DIR = path.resolve(process.cwd(), 'docs');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'docs');

// Configuration: if a file does not have the .lang.md extension, treat it as "defaultLang"
const defaultLang = 'en';

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

function slugify(text) {
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
}

function extractHeadingsFromMarkdown(md) {
    const lines = String(md || '').split(/\r?\n/);
    const headings = [];
    for (const line of lines) {
        const m = line.match(/^(#{1,6})\s+(.*)$/);
        if (m) headings.push({ depth: m[1].length, text: m[2].trim() });
    }
    return headings;
}

async function copyAssets() {
    const all = await fg(path.join(DOCS_DIR, '**/*').replace(/\\/g, '/'), { dot: true, onlyFiles: false });
    for (const p of all) {
        const rel = path.relative(DOCS_DIR, p);
        const src = path.join(DOCS_DIR, rel);
        const dest = path.join(OUT_DIR, rel);
        const stat = await fs.stat(src);
        if (stat.isDirectory()) {
            await ensureDir(dest);
        } else {
            if (!src.endsWith('.md')) {
                await ensureDir(path.dirname(dest));
                await fs.copyFile(src, dest);
            }
        }
    }
}

(async () => {
    try {
        const mdParser = new MarkdownIt({ html: true, linkify: true, typographer: true })
            .use(markdownItAnchor, { slugify, permalink: false });

        const pattern = path.join(DOCS_DIR, '**/*.md').replace(/\\/g, '/');
        const files = await fg(pattern);
        const index = [];

        // Utility function: parses a filename into {group, lang, filename}
        // Supports: name.lang.md and name.md
        function parseDocFilename(rel) {
            const base = path.basename(rel); // e.g. intro.ru.md or guide/intro.en.md
            const parts = base.split('.');
            if (parts.length >= 3) {
                // last is md, penultimate is lang
                const ext = parts.pop(); // md
                const lang = parts.pop(); // ru/en/de
                const name = parts.join('.'); // intro or guide.part
                const group = path.join(path.dirname(rel), name).replace(/\\/g, '/'); // relative path without lang and ext
                return { group, lang, filename: rel };
            } else {
                // name.md (no lang)
                const nameNoExt = base.replace(/\.md$/, '');
                const group = path.join(path.dirname(rel), nameNoExt).replace(/\\/g, '/');
                return { group, lang: defaultLang, filename: rel };
            }
        }

        for (const file of files) {
            const rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/'); // e.g. guide/intro.ru.md
            const meta = parseDocFilename(rel);
            const raw = await fs.readFile(file, 'utf8');
            const md = String(raw || '');

            // extract headings for index (H1..H6)
            const headings = extractHeadingsFromMarkdown(md);
            const h1 = headings.find(h => h.depth === 1);
            const title = h1 ? h1.text : path.basename(file, '.md');

            // render HTML body
            const htmlBody = mdParser.render(md);

            // write HTML file: keep language in filename, e.g. intro.ru.html
            const outPath = path.join(OUT_DIR, rel).replace(/\.md$/, '.html');
            await ensureDir(path.dirname(outPath));

            const pageHtml = `<!doctype html>
<html lang="${meta.lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/docs/styles/docs.css">
</head>
<body>
<main class="docs-article">
${htmlBody}
</main>
</body>
</html>`;

            await fs.writeFile(outPath, pageHtml, 'utf8');

            // normalize headings for index.json
            const normalizedHeadings = (headings || []).map(h => ({ depth: Number(h.depth || 0), text: String(h.text || '') }));

            // push index entry with language and group
            index.push({
                path: rel.replace(/\.md$/, '.html'), // path to HTML relative to /docs/
                title: String(title || rel),
                headings: normalizedHeadings,
                lang: meta.lang,
                group: meta.group // base name used to group translations
            });
        }

        // copy assets (images etc.)
        await copyAssets();

        await ensureDir(OUT_DIR);
        await fs.writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');

        console.log('Docs built:', index.length, 'files ->', OUT_DIR);
    } catch (err) {
        console.error('build-docs error:', err);
        process.exit(1);
    }
})();

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
