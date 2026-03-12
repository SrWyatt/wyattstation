const audio = document.getElementById('radioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volIcon = document.getElementById('volIcon');
const volumeSlider = document.getElementById('volumeSlider');
const field = document.getElementById('sticker-field');
const statusText = document.getElementById('status-text');
const syncBtn = document.getElementById('syncBtn');
const antennaIcon = document.getElementById('antennaIcon');
const trackTitle = document.getElementById('track-title');

const assets = ['eye.png', 'fly.png', 'ram.png', 'turtle.png', 'atom.png', 'brain.png', 'leaf.png'];
let lastAsset = '';

for (let i = 0; i < 25; i++) {
    const img = document.createElement('img');
    let randomAsset = assets[Math.floor(Math.random() * assets.length)];
    while (randomAsset === lastAsset) { randomAsset = assets[Math.floor(Math.random() * assets.length)]; }
    lastAsset = randomAsset;
    img.src = `resource/img/${randomAsset}`;
    img.className = 'particle-sticker';
    img.style.left = `${Math.random() * 100}%`;
    img.style.top = `${Math.random() * 100}%`;
    const duration = Math.random() * 40 + 20;
    img.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 35}vw`);
    img.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 35}vh`);
    img.style.animationDuration = `${duration}s`;
    img.style.animationDelay = `${Math.random() * -20}s`;
    field.appendChild(img);
}

async function updateMetadata() {
    try {
        const response = await fetch('now_playing.json');
        if (!response.ok) throw new Error();
        const data = await response.json();
        trackTitle.innerText = data.song.toUpperCase();
    } catch (e) {
        trackTitle.innerText = 'WYATT STATION - BROADCAST';
    }
}

setInterval(updateMetadata, 10000);
updateMetadata();

let isPlaying = false;

function checkSync() {
    if (!isPlaying) return;
    const latency = audio.buffered.length > 0 ? (audio.buffered.end(0) - audio.currentTime) : 0;
    if (latency > 6) {
        antennaIcon.className = 'static-yellow';
        syncBtn.disabled = false;
    } else {
        antennaIcon.className = 'pulse-red-white';
        syncBtn.disabled = true;
    }
}

setInterval(checkSync, 4000);

syncBtn.addEventListener('click', () => {
    const currentVol = audio.volume;
    audio.src = "https://stream.zeno.fm/2gi6vrilgwbtv";
    audio.load();
    audio.play();
    audio.volume = currentVol;
    antennaIcon.className = 'pulse-red-white';
    syncBtn.disabled = true;
});

playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().then(() => {
            playIcon.src = 'resource/icons/pause-circle.svg';
            field.classList.remove('paused');
            isPlaying = true;
            statusText.innerText = 'LIVE';
        }).catch(() => { statusText.innerText = 'SERVER_OFFLINE'; });
    } else {
        audio.pause();
        playIcon.src = 'resource/icons/play-circle-outline.svg';
        field.classList.add('paused');
        isPlaying = false;
    }
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    audio.volume = val;
    if (val === 0) volIcon.src = 'resource/icons/volume-mute.svg';
    else if (val < 0.5) volIcon.src = 'resource/icons/volume-low.svg';
    else volIcon.src = 'resource/icons/volume-medium.svg';
});
