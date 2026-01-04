/* script to handle the music player UI interactions 
    - minimizes and expands the player on header click
    TODO: add play/pause functionality
    TODO: volume control
*/

document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.querySelector('#music-player');
    const playerHeader = document.querySelector('#player-bar h1');
    const widgetIframe = document.getElementById('sc-widget');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playStatusIcon = document.getElementById('play-status-icon');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    // soundcloud api
    const widget = SC.Widget(widgetIframe);

    // randomize
    const totalTracks = 15;
    const randomIndex = Math.floor(Math.random() * totalTracks);
    let currentSrc = widgetIframe.src;
    widgetIframe.src = `${currentSrc}&start_track=${randomIndex}`;

    // controls
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        widget.toggle();
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        widget.next();
    });
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        widget.prev();
    });

    // state updates
    widget.bind(SC.Widget.Events.PLAY, () => {
        playStatusIcon.src = 'static/visuals/img/pause.png';
    });
    widget.bind(SC.Widget.Events.PAUSE, () => {
        playStatusIcon.src = 'static/visuals/img/play-button.png';
    });

    // minimize/maximize
    playerContainer.classList.add('minimized');
    playerHeader.addEventListener('click', () => {
        playerContainer.classList.toggle('minimized');
    });
});