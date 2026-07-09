const songs = [
    "musics/song1.mp3",
    "musics/song2.mp3",
    "musics/song3.mp3",
    "musics/song4.mp3"
];

// Elements
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const songTitle = document.querySelector(".song-title");
const songStatus = document.querySelector(".song-status");

let currentSong = null;
let isPlaying = false;

// Get random song
function getRandomSong() {
    let randomSong;

    do {
        randomSong = songs[Math.floor(Math.random() * songs.length)];
    } while (songs.length > 1 && randomSong === currentSong);

    return randomSong;
}

// Extract song name
function getSongName(path) {
    return path
        .split("/")
        .pop()
        .replace(".mp3", "")
        .replace(/_/g, " ");
}

// Load random song
function loadRandomSong() {

    currentSong = getRandomSong();

    audio.src = currentSong;

    songTitle.textContent = getSongName(currentSong);

    songStatus.textContent = "Loading...";
}

// Play current song
function playSong() {

    audio.play()
        .then(() => {

            isPlaying = true;

            playBtn.innerHTML = "⏸";

            songStatus.textContent = "Playing";

        })
        .catch(err => {

            console.log(err);

            songStatus.textContent =
                "Tap Play To Start";
        });

}

// Pause song
function pauseSong() {

    audio.pause();

    isPlaying = false;

    playBtn.innerHTML = "▶";

    songStatus.textContent = "Paused";
}

// Play button
playBtn.addEventListener("click", () => {

    if (!audio.src) {

        loadRandomSong();

        playSong();

        return;
    }

    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }

});

// When song ends
audio.addEventListener("ended", () => {

    loadRandomSong();

    playSong();

});

// Song started
audio.addEventListener("playing", () => {

    isPlaying = true;

    playBtn.innerHTML = "⏸";

    songStatus.textContent = "Playing";

});

// Song paused
audio.addEventListener("pause", () => {

    if (!audio.ended) {

        isPlaying = false;

        playBtn.innerHTML = "▶";

        songStatus.textContent = "Paused";
    }

});

// Error
audio.addEventListener("error", () => {

    songStatus.textContent =
        "Song Not Found";

});

// First load
loadRandomSong();