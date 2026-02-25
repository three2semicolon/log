/* handles navigation and dynamic content loading
    - loads static pages
    - controls the directory filtering and navigation 
*/

document.addEventListener('DOMContentLoaded', () => {
    const navContext = document.querySelector('#nav-context');
    const contentArea = document.querySelector('.content');
    let currentFilter = 'all'; 

    const loadPage = async (pageName, forcePost = false) => {
        const contentArea = document.querySelector('.content');
        const isPost = forcePost || (pageName !== 'about' && pageName !== 'directory');
        const folder = isPost ? 'static/log/generated-html' : 'static/pages';
        const targetFile = `${folder}/${pageName}.html`;

        try {
            const res = await fetch(targetFile);
            if (!res.ok) throw new Error("page missing");
            const html = await res.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const newContent = doc.querySelector('.content') 
                ? doc.querySelector('.content').innerHTML 
                : doc.body.innerHTML;

            contentArea.innerHTML = newContent;

            if (isPost) {
                // grab title from the generated fragment
                const postTitle = doc.querySelector('.p-title')?.innerText || pageName;
                document.title = `${postTitle.toLowerCase()} | words*`;
            } else if (pageName === 'about') {
                document.title = `about | words*`;
            } else {
                // reset to default for the directory
                document.title = `words*`;
            }

            window.history.pushState({page: pageName}, '', `?p=${pageName}`);

            updateNavContext(pageName);

            if (pageName === 'directory') {
                filterPosts(currentFilter);
            }

        } catch (err) {
            console.error("fetch failed:", err);
            contentArea.innerHTML = `<p style="color:var(--orange)">[system error]: failed to load ${pageName}</p>`;
        }
    };

    const updateNavContext = (pageName) => {
        if (pageName !== 'directory') {
            navContext.innerHTML = `<a href="directory.html" id="directory-link" class="pja-link">directory</a>`;
        } else {
            renderDirectoryControls(currentFilter);
        }
    };

    const renderDirectoryControls = (filterLabel) => {
        navContext.innerHTML = `
            <div id="directory-controls">
                <a href="#" id="filter-trigger">directory [${filterLabel}]</a>
                <div id="directory-menu">
                    <a href="#" class="filter-opt" data-filter="all">all</a>
                    <a href="#" class="filter-opt" data-filter="general">general</a>
                    <a href="#" class="filter-opt" data-filter="music">music</a>
                    <a href="#" class="filter-opt" data-filter="visualists">visualists</a>
                    <a href="#" class="filter-opt" data-filter="reviews">reviews</a>
                    <a href="#" class="filter-opt" data-filter="recipes">recipes</a>
                </div>
            </div>`;
    };

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        const postEntry = e.target.closest('.post-entry');
        const titleLink = e.target.closest('#title');
        
        if (link || postEntry) {
            const targetLink = link || postEntry.querySelector('.pja-link');
            const href = targetLink ? targetLink.getAttribute('href') : null;

            if (href && href !== '#' && (targetLink.classList.contains('pja-link') || targetLink.id === 'about-link')) {
                e.preventDefault();
                const isPost = href.includes('generated-html');
                const pageName = href.split('/').pop().replace('.html', '');
                loadPage(pageName, isPost);
                return;
            }
        }

        // dropdown toggle
        if (link && (link.id === 'filter-trigger')) {
            e.preventDefault();
            document.querySelector('#directory-menu').classList.toggle('open');
        }

        // category filtering
        if (link && link.classList.contains('filter-opt')) {
            e.preventDefault();
            currentFilter = link.dataset.filter;
            filterPosts(currentFilter);
            document.querySelector('#filter-trigger').innerText = `directory [${currentFilter}]`;
            document.querySelector('#directory-menu').classList.remove('open');
        }

        // title click
        if (titleLink) {
            e.preventDefault();
            loadPage('directory');
        }
    });

    // init
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get('p') || 'directory';
    loadPage(initialPage);
});

function filterPosts(category) {
    const posts = document.querySelectorAll('.post-entry');
    posts.forEach(post => {
        post.style.display = (category === 'all' || post.dataset.category === category) 
            ? 'block' : 'none';
    });
}

const copyPermalink = (e, shorthand) => {
    if (e) e.preventDefault();
    
    const url = `https://log.whitfija.com/?p=${shorthand}`;
    
    navigator.clipboard.writeText(url).then(() => {
        const btn = e.target;
        const originalText = btn.textContent;
        
        btn.textContent = '[copied!]';
        setTimeout(() => { 
            btn.textContent = originalText; 
        }, 2000);
    }).catch(err => {
        console.error('could not copy tape link: ', err);
    });
};