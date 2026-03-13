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
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

const assets = ['eye.png', 'fly.png', 'ram.png', 'turtle.png', 'atom.png', 'brain.png', 'leaf.png', 'frog.png', 'crow.png', 'butterfly.png'];
let lastAsset = '';
const stickers = [];

const filters = [
    'grayscale(100%) brightness(0.6)',
    'grayscale(100%) brightness(0.9)',
    'grayscale(100%) brightness(1.2)',
    'grayscale(100%) contrast(1.3)'
];

function initStickers() {
    const isSmallScreen = window.innerWidth < 1400;
    const cols = isSmallScreen ? 5 : 6;
    const rows = isSmallScreen ? 4 : 5;
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    field.innerHTML = '';

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const img = document.createElement('img');
            let randomAsset = assets[Math.floor(Math.random() * assets.length)];
            while (randomAsset === lastAsset) { randomAsset = assets[Math.floor(Math.random() * assets.length)]; }
            lastAsset = randomAsset;

            img.src = `resource/img/${randomAsset}`;
            img.className = 'particle-sticker';

            const offsetX = (Math.random() - 0.5) * (cellWidth * 0.6);
            const offsetY = (Math.random() - 0.5) * (cellHeight * 0.6);

            img.style.left = `${(c * cellWidth) + (cellWidth / 2) + offsetX}%`;
            img.style.top = `${(r * cellHeight) + (cellHeight / 2) + offsetY}%`;

            const sizeVariation = Math.random();
            let baseSize;
            if (sizeVariation > 0.85) baseSize = isSmallScreen ? 160 : 220;
            else if (sizeVariation > 0.4) baseSize = isSmallScreen ? 110 : 160;
            else baseSize = isSmallScreen ? 70 : 90;

            img.style.width = `${baseSize}px`;
            img.style.filter = filters[Math.floor(Math.random() * filters.length)];

            const driftDur = Math.random() * 45 + 35;
            const fadeDur = Math.random() * 25 + 15;

            img.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 20}vw`);
            img.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 20}vh`);

            img.style.animation = `drift ${driftDur}s linear infinite, fadeCycle ${fadeDur}s ease-in-out infinite`;
            img.style.animationDelay = `0s, ${Math.random() * -25}s`;

            field.appendChild(img);
            stickers.push(img);
        }
    }
}

initStickers();

let audioCtx;
let analyser;
let source;
let dataArray;

function setupVisualizer() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    draw();
}

function draw() {
    requestAnimationFrame(draw);
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    let totalResonance = 0;
    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;
        canvasCtx.fillStyle = '#d92121';
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
        totalResonance += dataArray[i];
    }

    const avg = totalResonance / dataArray.length;
    const scale = 1 + (avg / 700);
    stickers.forEach(s => {
        s.style.transform = `scale(${scale})`;
    });
}

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
        setupVisualizer();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
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

window.addEventListener('resize', () => {
    initStickers();
});
