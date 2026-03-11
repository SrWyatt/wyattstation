const audio = document.getElementById('radioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volIcon = document.getElementById('volIcon');
const volumeSlider = document.getElementById('volumeSlider');
const field = document.getElementById('sticker-field');
const countDisplay = document.getElementById('real-count');
const statusText = document.getElementById('status-text');

const assets = ['eye.png', 'fly.png', 'ram.png', 'turtle.png'];
for (let i = 0; i < 15; i++) {
    const img = document.createElement('img');
    img.src = `resource/img/${assets[Math.floor(Math.random() * assets.length)]}`;
    img.className = 'particle-sticker';
    img.style.left = Math.random() * 85 + '%';
    img.style.top = Math.random() * 85 + '%';
    img.style.width = (Math.random() * 250 + 150) + 'px';
    img.style.animationDuration = (Math.random() * 50 + 30) + 's';
    img.style.animationDelay = (Math.random() * -20) + 's';
    field.appendChild(img);
}

let isPlaying = false;

audio.addEventListener('error', () => {
    statusText.innerText = 'SERVER_OFFLINE';
});

playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().then(() => {
            playIcon.src = 'resource/icons/pause-circle.svg';
            field.classList.remove('paused');
            isPlaying = true;
            statusText.innerText = 'LIVE';
        }).catch(() => {
            statusText.innerText = 'SERVER_OFFLINE';
        });
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

const bc = new BroadcastChannel('wyatt_realtime_count');
let sessions = new Set();
const mySession = Math.random().toString(36).substring(7);

function sync() {
    bc.postMessage({ type: 'HEARTBEAT', id: mySession });
}

bc.onmessage = (e) => {
    if (e.data.type === 'HEARTBEAT' || e.data.type === 'ACK') {
        sessions.add(e.data.id);
        if (e.data.type === 'HEARTBEAT') bc.postMessage({ type: 'ACK', id: mySession });
    }
    countDisplay.innerText = (sessions.size + 1).toString().padStart(2, '0');
};

setInterval(() => {
    sessions.clear();
    sync();
}, 4000);
sync();
