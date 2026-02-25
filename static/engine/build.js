/* script to build the static site 
    - reads markdown files from /log/live
    - generates HTML fragments in /log/generated-html
    - builds the directory page in /pages/directory.html

NOTE: run locally via node, install dependencies.
*/

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const LIVE_DIR = path.join(__dirname, '../log/live');
const GEN_DIR = path.join(__dirname, '../log/generated-html');
const DIR_FILE = path.join(__dirname, '../pages/directory.html');

const formatDate = (dateVal) => {
    let date;
    if (dateVal instanceof Date) {
        const dateString = dateVal.toISOString().split('T')[0]; 
        date = new Date(`${dateString.replace(/-/g, '/')}, 12:00:00`);
    } else {
        date = new Date(`${dateVal.replace(/-/g, '/')}, 12:00:00`);
    }
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).toLowerCase();
};

const generateSitemap = (posts) => {
    const baseUrl = 'https://log.whitfija.com';
    const staticPages = ['about', 'directory'];
    
    const pageEntries = staticPages.map(page => `
    <url>
        <loc>${baseUrl}/?p=${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>`).join('');

    const postEntries = posts.map(p => `
    <url>
        <loc>${baseUrl}/?p=${p.shorthand}</loc>
        <lastmod>${new Date(p.date).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`).join('');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://log.whitfija.com/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    ${pageEntries}
    ${postEntries}
</urlset>`;

    fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemapContent);
    console.log(`[system]: sitemap.xml updated with ${posts.length + staticPages.length} entries.`);
};

const build = async() => {
    const { marked } = await import('marked');

    if (!fs.existsSync(GEN_DIR)) fs.mkdirSync(GEN_DIR, { recursive: true });

    const posts = [];
    const files = fs.readdirSync(LIVE_DIR).filter(f => f.endsWith('.md'));

    files.forEach(file => {
        const source = fs.readFileSync(path.join(LIVE_DIR, file), 'utf-8');
        const { data, content } = matter(source);
        if (data.hidden) return;

        const htmlContent = marked.parse(content);
        const shorthand = data.shorthand || file.replace('.md', '');
        const displayDate = formatDate(data.date);

// ------------- post HTML format -------------
        const postFragment = `
<div class="content">
    <div class="page">
        <div class="post-header">
            <h1 class="p-title">${data.title}</h1>
            <div class="post-meta-sub">
                <span style="color:var(--orange)">[${displayDate}]</span> 
                <span class="cat-${data.category}">[${data.category}]</span>
            </div>
        </div>
        <div class="post-body">
            ${htmlContent}
        </div>
    </div>
</div>`;

        fs.writeFileSync(path.join(GEN_DIR, `${shorthand}.html`), postFragment);
        posts.push({ ...data, shorthand, displayDate, dateObj: new Date(data.date) });
    });

    posts.sort((a, b) => b.dateObj - a.dateObj);

// ------------- directory HTML format -------------
    const directoryHtml = `
<div class="content">
    <div id="post-directory">
        ${posts.map(p => `
        <div class="post-entry" data-category="${p.category}">
            <div class="post-meta">
                <span class="p-date" style="color:var(--orange)">[${p.displayDate}]</span>
                <span class="p-cat cat-${p.category}">[${p.category}]</span>
            </div>
            <div class="post-meta">
                <a href="static/log/generated-html/${p.shorthand}.html" class="pja-link p-title"><b>${p.title}</b></a>
            </div>
            <div class="post-excerpt">${p.excerpt || ''}</div>
        </div>`).join('')}
    </div>
</div>`;

    fs.writeFileSync(DIR_FILE, directoryHtml);
    console.log(`[system]: re-indexed ${posts.length} files.`);

    generateSitemap(posts);
};

build().catch(err => {
    console.error("build failed", err);
    process.exit(1);
});