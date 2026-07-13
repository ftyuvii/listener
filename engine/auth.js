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
const googleBtnLabel = googleBtn ? googleBtn.querySelector('span') : null;
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

function showApp(user) {
  applyUser(user);
  if (loginScreen) loginScreen.classList.add('hide');
}

function showLogin() {
  closeProfileSheet();
  if (loginScreen) {
    loginScreen.classList.remove('hide');
    if (googleBtn) googleBtn.disabled = false;
    if (googleBtnLabel) googleBtnLabel.textContent = 'Continue with Google';
  } else {
    window.location.href = 'index.html';
  }
}

function openProfileSheet() {
  if (!profileSheet || !overlay) return;
  profileSheet.classList.add('open');
  overlay.classList.add('open');
}

function closeProfileSheet() {
  if (!profileSheet || !overlay) return;
  profileSheet.classList.remove('open');
  overlay.classList.remove('open');
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showApp(user);
  } else {
    showLogin();
  }
});

if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    googleBtn.disabled = true;
    if (googleBtnLabel) googleBtnLabel.textContent = 'Signing in...';
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        googleBtn.disabled = false;
        if (googleBtnLabel) googleBtnLabel.textContent = 'Continue with Google';
      }
    }
  });
}

if (avatarMark) {
  avatarMark.addEventListener('click', openProfileSheet);
}

if (overlay) {
  overlay.addEventListener('click', () => {
    if (profileSheet && profileSheet.classList.contains('open')) closeProfileSheet();
  });
}

if (profileSaveBtn) {
  profileSaveBtn.addEventListener('click', async () => {
    const newName = profileNameInput.value.trim();
    if (!newName || !auth.currentUser) return;
    profileSaveBtn.disabled = true;
    profileSaveBtn.textContent = 'Saving...';
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      if (profileEmail) profileEmail.textContent = auth.currentUser.email || '';
    } finally {
      profileSaveBtn.disabled = false;
      profileSaveBtn.textContent = 'Save Changes';
      closeProfileSheet();
    }
  });
}

if (profileLogoutBtn) {
  profileLogoutBtn.addEventListener('click', async () => {
    await signOut(auth);
  });
}
