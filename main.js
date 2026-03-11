const audio = document.getElementById('radioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volIcon = document.getElementById('volIcon');
const volumeSlider = document.getElementById('volumeSlider');
const field = document.getElementById('sticker-field');
const countDisplay = document.getElementById('real-count');

const assets = ['eye.png', 'fly.png', 'ram.png', 'turtle.png'];
for (let i = 0; i < 16; i++) {
    const img = document.createElement('img');
    img.src = `resource/img/${assets[Math.floor(Math.random() * assets.length)]}`;
    img.className = 'particle-sticker';
    img.style.left = Math.random() * 95 + '%';
    img.style.top = Math.random() * 95 + '%';
    img.style.width = (Math.random() * 150 + 150) + 'px';
    img.style.animationDuration = (Math.random() * 15 + 10) + 's';
    field.appendChild(img);
}

let isPlaying = false;

function startPlayback() {
    audio.play().then(() => {
        playIcon.src = 'resource/icons/pause-circle.svg';
        field.classList.remove('paused');
        isPlaying = true;
    }).catch(err => {
        console.log("Autoplay prevent");
    });
}

window.addEventListener('load', startPlayback);

playBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().then(() => {
            playIcon.src = 'resource/icons/pause-circle.svg';
            field.classList.remove('paused');
            isPlaying = true;
        }).catch(err => console.log("Playback blocked"));
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

    if (val === 0) {
        volIcon.src = 'resource/icons/volume-mute.svg';
    } else if (val < 0.3) {
        volIcon.src = 'resource/icons/volume-low.svg';
    } else if (val < 0.7) {
        volIcon.src = 'resource/icons/volume-medium.svg';
    } else {
        volIcon.src = 'resource/icons/volume-high.svg';
    }
});

const bc = new BroadcastChannel('wyatt_realtime_count');
let sessions = new Set();
const mySession = Math.random().toString(36).substring(7);

function sync() {
    bc.postMessage({ type: 'HEARTBEAT', id: mySession });
}

bc.onmessage = (e) => {
    if (e.data.type === 'HEARTBEAT') {
        sessions.add(e.data.id);
        bc.postMessage({ type: 'ACK', id: mySession });
    } else if (e.data.type === 'ACK') {
        sessions.add(e.data.id);
    }
    updateCounter();
};

function updateCounter() {
    const total = sessions.size + 1;
    countDisplay.innerText = total.toString().padStart(2, '0');
    setTimeout(() => sessions.clear(), 4000);
}

setInterval(sync, 2000);
sync();
