import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWFo4PwnwWfNUS-s4vXQHINAejp3wwPrk",
  authDomain: "restify-1ec27.firebaseapp.com",
  projectId: "restify-1ec27",
  storageBucket: "restify-1ec27.firebasestorage.app",
  messagingSenderId: "179542882874",
  appId: "1:179542882874:web:a6166769efff7151239303",
  measurementId: "G-CEWQDRWWCW"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const loginScreen = document.getElementById('login-screen');
const googleBtn = document.getElementById('google-login-btn');
const avatarMark = document.getElementById('avatar-mark');
const avatarFallback = document.getElementById('avatar-fallback');
const userAvatarImg = document.getElementById('user-avatar-img');
const overlay = document.getElementById('overlay');
const profileSheet = document.getElementById('profile-sheet');
const profilePhoto = document.getElementById('profile-photo');
const profileNameInput = document.getElementById('profile-name-input');
const profileEmail = document.getElementById('profile-email');
const profileSaveBtn = document.getElementById('profile-save-btn');
const profileLogoutBtn = document.getElementById('profile-logout-btn');

function applyUser(user) {
  if (!avatarMark) return;
  const photo = user.photoURL || '';
  const name = user.displayName || (user.email ? user.email.split('@')[0] : 'You');
  if (photo) {
    if (userAvatarImg) { userAvatarImg.src = photo; userAvatarImg.style.display = 'block'; }
    if (avatarFallback) avatarFallback.style.display = 'none';
    if (profilePhoto) { profilePhoto.src = photo; profilePhoto.style.display = 'block'; }
  } else {
    if (userAvatarImg) userAvatarImg.style.display = 'none';
    if (profilePhoto) profilePhoto.style.display = 'none';
    if (avatarFallback) { avatarFallback.style.display = 'flex'; avatarFallback.textContent = name.charAt(0).toUpperCase(); }
  }
  if (profileNameInput) profileNameInput.value = name;
  if (profileEmail) profileEmail.textContent = user.email || '';
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (loginScreen) loginScreen.classList.add('hide');
    applyUser(user);
    renderAlbums();
  } else {
    if (loginScreen) {
      loginScreen.classList.remove('hide');
    } else {
      window.location.href = '../index.html';
    }
  }
});

if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    googleBtn.disabled = true;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        googleBtn.disabled = false;
      }
    }
  });
}

if (avatarMark) avatarMark.addEventListener('click', () => { profileSheet.classList.add('open'); overlay.classList.add('open'); });
if (overlay) overlay.addEventListener('click', () => { profileSheet.classList.remove('open'); overlay.classList.remove('open'); });

if (profileSaveBtn) {
  profileSaveBtn.addEventListener('click', async () => {
    const newName = profileNameInput.value.trim();
    if (!newName || !auth.currentUser) return;
    profileSaveBtn.disabled = true;
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
    } finally {
      profileSaveBtn.disabled = false;
      profileSheet.classList.remove('open');
      overlay.classList.remove('open');
    }
  });
}

if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', async () => { await signOut(auth); });

const tabs = document.querySelectorAll('.showcase-tabs .tab-pill');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-target');
    document.querySelectorAll('.showcase-content').forEach(c => c.classList.remove('open'));
    document.getElementById(`showcase-${target}`).classList.add('open');
  });
});

function renderAlbums() {
  const meshTarget = document.getElementById('mesh-target');
  const circleTarget = document.getElementById('circle-target');
  if (!window.myAlbumsData || !meshTarget || !circleTarget) return;

  meshTarget.innerHTML = '';
  circleTarget.innerHTML = '';

  window.myAlbumsData.forEach(album => {
    const gridItem = document.createElement('div');
    gridItem.className = 'mesh-album-card';
    gridItem.innerHTML = `
      <div class="mesh-cover-wrap">
        <img src="${album.cover}" alt="${album.title}">
        <div class="mesh-play-overlay"><i data-lucide="play"></i></div>
      </div>
      <div class="mesh-meta">
        <div class="mesh-title">${album.title}</div>
        <div class="mesh-artist">${album.artist}</div>
      </div>
    `;
    meshTarget.appendChild(gridItem);

    const circleItem = document.createElement('div');
    circleItem.className = 'vinyl-album-card';
    circleItem.innerHTML = `
      <div class="vinyl-disk-system">
        <div class="vinyl-plate"><div class="vinyl-center-label" style="background-image: url('${album.cover}')"></div></div>
        <img class="vinyl-jacket" src="${album.cover}" alt="${album.title}">
      </div>
      <div class="mesh-meta" style="text-align: center; margin-top: 14px;">
        <div class="mesh-title">${album.title}</div>
        <div class="mesh-artist">${album.artist}</div>
      </div>
    `;
    circleTarget.appendChild(circleItem);
  });
  if (window.lucide) lucide.createIcons();
}
