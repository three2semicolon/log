/*  scripts for page visuals 
    - melt text effect
    - circly spike virus thing
*/

// -------------------- melt --------------------
const melt = (selector, depth) => {
    const targets = document.querySelectorAll(selector);
    if (!targets) return;

    targets.forEach(target => {
        const words = target.innerText.split(' ');
        target.innerHTML = '';

        words.forEach(word => {
            // container for each word
            const container = document.createElement('span');
            container.className = 'melt-container';
            
            // clean top layer
            const source = document.createElement('span');
            source.className = 'source-text';
            source.innerText = word + ' '; // add space back
            
            // well for copies
            const well = document.createElement('div');
            well.className = 'drip-well';
            well.setAttribute('aria-hidden', 'true');

            container.appendChild(source);
            container.appendChild(well);
            target.appendChild(container);

            // copy gen
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

melt('.melt', 60);

/* -------------------- circle ----------------------- */
const path = document.querySelector('#spike-path');
const numSpikes = 12;
const centerX = 100;
const centerY = 100;

let time = 0;
let mousePos = { x: 0, y: 0 };
let mouseIntensity = 0;
let burst = 0;

const getPathData = (timeOffset) => {
    let points = [];
    const totalPoints = numSpikes * 2;
    
    for (let i = 0; i < totalPoints; i++) {
        const isPeak = i % 2 === 0;
        const angle = ((Math.PI * 2 * i) / totalPoints) + (timeOffset * 0.15);

        // directional pull
        const spikeDirX = Math.cos(angle);
        const spikeDirY = Math.sin(angle);
        const towardMouse = (spikeDirX * mousePos.x + spikeDirY * mousePos.y);
        const pull = Math.max(0, towardMouse) * mouseIntensity * 35;

        // jitter
        const noise = Math.sin(timeOffset * 3 + i * 0.8) * 12 + 
                      Math.cos(timeOffset * 1.5 + i * i) * 8;
        const baseRadius = isPeak ? (90 + burst) : 60;
        const r = baseRadius + noise + (isPeak ? pull : pull * 0.3);

        points.push({
            x: centerX + r * Math.cos(angle),
            y: centerY + r * Math.sin(angle)
        });
    }

    // smoothing
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        d += ` Q ${curr.x},${curr.y} ${midX},${midY}`;
    }
    return d + ' Z';
};

const animate = () => {
    time += 0.02; 
    
    // decay the burst
    if (burst > 0.5) burst *= 0.98;
    else burst = 0;

    path.setAttribute('d', getPathData(time));
    requestAnimationFrame(animate);
};

// mouse pull
window.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    mousePos = { x: nx, y: ny };
    mouseIntensity = Math.sqrt(nx*nx + ny*ny) * 2;
});

// burst
window.addEventListener('mousedown', () => {
    burst = 100;
});

animate();