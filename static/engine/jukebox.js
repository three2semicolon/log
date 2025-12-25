/* script to handle the music player UI interactions 
    - minimizes and expands the player on header click
    TODO: add play/pause functionality
    TODO: volume control
*/

document.addEventListener('DOMContentLoaded', () => {
    const playerContainer = document.querySelector('#music-player');
    const playerHeader = playerContainer.querySelector('h1');

    // set initial state to minimized
    playerContainer.classList.add('minimized');

    playerHeader.addEventListener('click', () => {
        playerContainer.classList.toggle('minimized');
    });
});