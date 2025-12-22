const melt = (selector, depth) => {
    const targets = document.querySelectorAll(selector);
    if (!targets) return;

    targets.forEach(target => {
        const words = target.innerText.split(' ');
        target.innerHTML = ''; // clear original text

        words.forEach(word => {
            // create the modular container for each word
            const container = document.createElement('span');
            container.className = 'melt-container';
            
            // the clean top layer
            const source = document.createElement('span');
            source.className = 'source-text';
            source.innerText = word + ' '; // add space back
            
            // the well for the drips
            const well = document.createElement('div');
            well.className = 'drip-well';
            well.setAttribute('aria-hidden', 'true');

            container.appendChild(source);
            container.appendChild(well);
            target.appendChild(container);

            // generate the slices for this specific word
            for (let i = 1; i <= depth; i++) {
                const slice = document.createElement('span');
                slice.className = 'drip-slice';
                slice.innerText = word + ' ';
                slice.style.top = `${i}px`;
                well.appendChild(slice);
            }
        });
    });
};

// run it on your main header
melt('.liquid', 60);