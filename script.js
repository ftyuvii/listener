// RedWave Music - Vanilla JS Music Player
const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const albumArt = document.getElementById('album-art');
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const visualizerCanvas = document.getElementById('visualizer-canvas');
const ctx = visualizerCanvas.getContext('2d');

// State
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
let lastVolume = 0.8;
let audioContext, analyser, source, bufferLength, dataArray;

// Load songs from musics/ folder
async function loadSongs() {
    // In production, you'd use a server or manifest. For demo/local, assume filenames.
    // User should place MP3s in musics/ and list them here or use fetch if server.
    const musicFiles = [
        'song1.mp3',
        'song2.mp3',
        'song3.mp3',
        // Add more as needed
    ];
    
    songs = musicFiles.map((file, index) => ({
        id: index,
        title: formatTitle(file),
        artist: 'RedWave Artist',
        src: `musics/${file}`,
        cover: `https://picsum.photos/id/${100 + index}/600/600` // Placeholder covers
    }));
    
    if (songs.length > 0) {
        loadSong(0);
    } else {
        console.warn('No songs found in musics/ folder. Add MP3 files.');
    }
}

function formatTitle(filename) {
    return filename
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Load song
function loadSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    
    audio.src = song.src;
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumArt.src = song.cover;
    
    // Reset progress
    progress.value = 0;
    progressFill.style.width = '0%';
    
    // Auto play next
    audio.onended = () => {
        if (isRepeat) {
            audio.currentTime = 0;
            audio.play();
        } else {
            nextSong();
        }
    };
    
    updateVisualizerConnection();
}

// Play/Pause
function togglePlay() {
    if (!audio.src) return;
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(e => console.error('Playback failed:', e));
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
    toggleAlbumRotation();
}

function updatePlayButton() {
    if (isPlaying) {
        playPauseBtn.innerHTML = '❚❚';
        playPauseBtn.classList.add('playing');
    } else {
        playPauseBtn.innerHTML = '▶';
        playPauseBtn.classList.remove('playing');
    }
}

function toggleAlbumRotation() {
    const wrapper = document.querySelector('.album-wrapper');
    if (isPlaying) {
        wrapper.classList.add('playing');
    } else {
        wrapper.classList.remove('playing');
    }
}

// Next / Previous
function nextSong() {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) nextIndex = 0;
    loadSong(nextIndex);
    if (isPlaying) audio.play();
}

function prevSong() {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = songs.length - 1;
    loadSong(prevIndex);
    if (isPlaying) audio.play();
}

// Shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? '#ff2020' : '';
}

// Repeat
function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? '#ff2020' : '';
}

// Progress
function updateProgress() {
    if (!audio.duration) return;
    
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progress.value = progressPercent;
    
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

// Volume
volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
    if (audio.volume > 0) {
        isMuted = false;
        muteBtn.textContent = '🔊';
    }
});

muteBtn.addEventListener('click', () => {
    if (isMuted) {
        audio.volume = lastVolume;
        volumeSlider.value = lastVolume;
        muteBtn.textContent = '🔊';
    } else {
        lastVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        muteBtn.textContent = '🔇';
    }
    isMuted = !isMuted;
});

// Keyboard shortcuts (nice to have)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
    if (e.code === 'ArrowRight') nextSong();
    if (e.code === 'ArrowLeft') prevSong();
});

// Visualizer
function initVisualizer() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    } catch(e) {
        console.log('Visualizer not supported');
    }
}

function updateVisualizerConnection() {
    if (!source && audioContext) {
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

function drawVisualizer() {
    if (!analyser) {
        requestAnimationFrame(drawVisualizer);
        return;
    }
    
    requestAnimationFrame(drawVisualizer);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    
    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * visualizerCanvas.height * 0.9;
        
        const hue = 0; // Red theme
        ctx.fillStyle = `hsl(${hue}, 100%, ${50 + (barHeight / visualizerCanvas.height) * 40}%)`;
        
        ctx.fillRect(x, visualizerCanvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
    }
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
favoriteBtn.addEventListener('click', () => {
    favoriteBtn.classList.toggle('active');
    favoriteBtn.textContent = favoriteBtn.classList.contains('active') ? '♥' : '♡';
});

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

// Initialize
window.onload = () => {
    loadSongs();
    initVisualizer();
    drawVisualizer();
    
    // Set initial volume
    audio.volume = 0.8;
    
    // Touch friendly
    document.documentElement.style.setProperty('--touch-scale', '1.05');
    
    console.log('%cRedWave Music initialized. Add MP3 files to musics/ folder.', 'color: #ff2020; font-weight: bold');
};