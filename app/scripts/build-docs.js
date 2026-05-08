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

function parseDocFilename(base, relPathInsideVersion) {
    const parts = base.split('.');
    if (parts.length >= 3) {
        const ext = parts.pop(); // md
        const lang = parts.pop(); // ru/en/de
        const name = parts.join('.'); // test2 or intro1
        const group = path.join(path.dirname(relPathInsideVersion), name).replace(/\\/g, '/');
        return { group, lang };
    } else {
        const nameNoExt = base.replace(/\.md$/, '');
        const group = path.join(path.dirname(relPathInsideVersion), nameNoExt).replace(/\\/g, '/');
        return { group, lang: defaultLang };
    }
}

function compareVersions(v1, v2) {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if ((p1[i] || 0) > (p2[i] || 0)) return 1;
        if ((p1[i] || 0) < (p2[i] || 0)) return -1;
    }
    return 0;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

        // We clean out the old public/docs build folder to remove any remaining junk.
        await fs.rm(OUT_DIR, { recursive: true, force: true });
        await ensureDir(OUT_DIR);

        // 1. Getting and sorting version folders
        const dirEntries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
        const versions = dirEntries
            .filter(entry => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
            .map(entry => entry.name)
            .sort(compareVersions);

        if (versions.length === 0) {
            console.warn('No version folders (e.g. X.Y.Z) found in docs/ directory.');
            process.exit(0);
        }

        console.log('Found sorted versions:', versions);

        const indexJson = [];
        // Virtual file state storage for inheritance: Map(key -> fileMetadata)
        // key: "group/lang" (for example, "test2/en")
        let virtualFileSystem = new Map();

        // 2. We go sequentially from the smaller version to the larger one.
        for (let i = 0; i < versions.length; i++) {
            const version = versions[i];
            const versionSrcDir = path.join(DOCS_DIR, version);
            const versionOutDir = path.join(OUT_DIR, version);
            await ensureDir(versionOutDir);

            // We search all .md files inside a specific version folder
            const pattern = path.join(versionSrcDir, '**/*.md').replace(/\\/g, '/');
            const files = await fg(pattern);

            // We overlay new/modified files of the current version onto our virtual storage
            for (const file of files) {
                const relPathInsideVersion = path.relative(versionSrcDir, file).replace(/\\/g, '/'); // например, "test2.en.md"
                const base = path.basename(relPathInsideVersion);
                const { group, lang } = parseDocFilename(base, relPathInsideVersion);
                
                const key = `${group}/${lang}`;
                virtualFileSystem.set(key, {
                    absoluteSourcePath: file,
                    relPathInsideVersion,
                    group,
                    lang
                });
            }

            const currentVersionDocs = [];

            // 3. We compile all files that are relevant for this version (including legacy ones)
            for (const [key, meta] of virtualFileSystem.entries()) {
                const raw = await fs.readFile(meta.absoluteSourcePath, 'utf8');
                const md = String(raw || '');

                const headings = extractHeadingsFromMarkdown(md);
                const h1 = headings.find(h => h.depth === 1);
                const title = h1 ? h1.text : path.basename(meta.absoluteSourcePath, '.md');

                const htmlBody = mdParser.render(md);
                
                // Save path: public/docs/[version]/[relative path].html
                const outHtmlRelPath = meta.relPathInsideVersion.replace(/\.md$/, '.html');
                const outPath = path.join(versionOutDir, outHtmlRelPath);
                await ensureDir(path.dirname(outPath));

                const pageHtml = `<!doctype html>
<html lang="${meta.lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="styles/docs.css">
</head>
<body>
<main class="docs-article">
${htmlBody}
</main>
</body>
</html>`;

                await fs.writeFile(outPath, pageHtml, 'utf8');

                const normalizedHeadings = headings.map(h => ({ depth: Number(h.depth || 0), text: String(h.text || '') }));

                currentVersionDocs.push({
                    path: `${version}/${outHtmlRelPath}`, // relative path from /public/docs/
                    title: String(title),
                    headings: normalizedHeadings,
                    lang: meta.lang,
                    group: meta.group
                });
            }

            // Add the version and its document list to the index.json array.
            indexJson.push({
                version: version,
                isLatest: i === versions.length - 1, // The most recent version in the array is marked as Latest
                docs: currentVersionDocs
            });
        }

        // We write the final structured version index
        await fs.writeFile(path.join(OUT_DIR, 'index.json'), JSON.stringify(indexJson, null, 2), 'utf8');
        console.log(`Successfully compiled documentation for ${versions.length} versions!`);

    } catch (err) {
        console.error('build-docs error:', err);
        process.exit(1);
    }
})();
