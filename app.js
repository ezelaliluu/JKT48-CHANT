let currentSetlistKey = Object.keys(jkt48Setlists)[0]; 
let activeIndex = 0;
let isTransitioning = false;

const setlistSelector = document.getElementById('setlist-selector');
const tracklistContainer = document.getElementById('tracklist-container');
const crossfadeContainer = document.getElementById('crossfade-container');
const lyricsContainer = document.getElementById('lyrics-container');
const audioPlayer = document.getElementById('audio-player');
const currentTrackTag = document.getElementById('current-track-tag');
const trackCounter = document.getElementById('track-counter');
const btnPlayToggle = document.getElementById('btn-play-toggle');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const timeCurrent = document.getElementById('time-current');
const timeDuration = document.getElementById('time-duration');

function getActivePlaylist() {
    return jkt48Setlists[currentSetlistKey].playlist;
}

function initSetlistSelector() {
    setlistSelector.innerHTML = Object.keys(jkt48Setlists).map(key => `
        <option value="${key}">${jkt48Setlists[key].name}</option>
    `).join('');

    setlistSelector.addEventListener('change', (e) => {
        currentSetlistKey = e.target.value;
        document.getElementById('setlist-title').innerText = jkt48Setlists[currentSetlistKey].name;
        
        activeIndex = 0;
        audioPlayer.pause();
        btnPlayToggle.innerText = "▶";
        resetProgressBar();
        crossfadeContainer.innerHTML = '';
        
        renderTracklist();
        triggerCrossFadeTransition(0);
    });
}

function renderTracklist() {
    const currentPlaylist = getActivePlaylist();
    tracklistContainer.innerHTML = currentPlaylist.map(song => {
        const isActive = song.id === activeIndex;
        return `
            <button onclick="selectTrack(${song.id})" 
                class="w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-between group relative border ${
                    isActive 
                    ? 'text-[#e60012] bg-red-50/60 border-red-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 border-transparent hover:text-gray-900'
                }" id="track-item-${song.id}">
                <div class="flex items-center gap-3 truncate pr-4">
                    <span class="text-[10px] font-mono tracking-wider ${isActive ? 'text-[#e60012]' : 'text-gray-400'}">
                        ${String(song.id + 1).padStart(2, '0')}
                    </span>
                    <span class="truncate tracking-tight font-bold ${isActive ? 'font-extrabold' : 'font-semibold'}">
                        ${song.title}
                    </span>
                </div>
                ${isActive ? `<span class="text-[9px] font-black tracking-widest text-[#e60012] animate-pulse shrink-0">● PLAY</span>` : `<span class="text-[9px] font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">PLAY ▶</span>`}
            </button>
        `;
    }).join('');
}

function triggerCrossFadeTransition(newIndex) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    activeIndex = newIndex;
    const currentPlaylist = getActivePlaylist();
    const newTrack = currentPlaylist[activeIndex];
    
    const newCard = document.createElement('div');
    newCard.className = 'absolute w-full h-full bg-[#e60012] p-1.5 border border-red-700/10 rounded-xl shadow-md opacity-0 flex flex-col justify-between';
    newCard.innerHTML = `
        <div class="w-full h-full bg-white relative overflow-hidden flex flex-col justify-between rounded-lg">
            <div class="w-full h-[78%] bg-gray-50">
                <img src="${newTrack.cover}" class="w-full h-full object-cover pointer-events-none" alt="${newTrack.title}">
            </div>
            <div class="p-3 bg-white flex flex-col justify-center flex-1 border-t border-gray-100">
                <span class="text-[9px] font-extrabold text-[#e60012] tracking-wider uppercase block">STAGE TRACK</span>
                <h2 class="text-xs font-black text-gray-900 leading-tight tracking-tight truncate mt-0.5">${newTrack.title}</h2>
            </div>
            <span class="absolute top-2 left-2 text-white text-xs opacity-70">✦</span>
        </div>
    `;

    const oldCard = crossfadeContainer.firstElementChild;
    if (oldCard) {
        oldCard.classList.remove('card-fade-in');
        oldCard.classList.add('card-fade-out');
        crossfadeContainer.appendChild(newCard);
        newCard.classList.add('card-fade-in');

        setTimeout(() => {
            oldCard.remove();
            syncTrackData(activeIndex);
            isTransitioning = false;
        }, 300);
    } else {
        crossfadeContainer.appendChild(newCard);
        newCard.classList.add('card-fade-in');
        syncTrackData(activeIndex);
        isTransitioning = false;
    }
}

function selectTrack(id) {
    if (id === activeIndex) return;
    triggerCrossFadeTransition(id);
}

function syncTrackData(index) {
    const currentPlaylist = getActivePlaylist();
    const track = currentPlaylist[index];
    
    currentTrackTag.innerText = track.title.toUpperCase();
    trackCounter.innerText = `${activeIndex + 1} / ${currentPlaylist.length}`;
    audioPlayer.src = track.src;
    resetProgressBar();

    lyricsContainer.innerHTML = track.lyrics.map((line, idx) => `
        <div id="line-${idx}" 
             onclick="seekToLyric(${line.time})" 
             class="transition-all duration-500 transform origin-left cursor-pointer hover:opacity-80 space-y-1">
            
            <p id="text-target-${idx}" class="font-bold tracking-tight text-xl md:text-2xl text-gray-900 opacity-20 transition-opacity duration-500">${line.text}</p>
            
            ${line.chant ? `
                <p id="chant-target-${idx}" class="font-extrabold tracking-tight text-lg md:text-xl text-[#e60012] italic mt-1 opacity-20 transition-opacity duration-500">
                    ${line.chant}
                </p>
            ` : ''}
        </div>
    `).join('');

    renderTracklist();
    if (btnPlayToggle.innerText === "⏸️") {
        audioPlayer.play().catch(() => {});
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function resetProgressBar() {
    progressBar.style.width = '0%';
    timeCurrent.innerText = "0:00";
    timeDuration.innerText = "0:00";
}

audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    if (duration) {
        const progressPercentage = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        timeCurrent.innerText = formatTime(currentTime);
        timeDuration.innerText = formatTime(duration);
    }

    const currentPlaylist = getActivePlaylist();
    const currentLyrics = currentPlaylist[activeIndex].lyrics;
    
    currentLyrics.forEach((line, idx) => {
        const container = document.getElementById(`line-${idx}`);
        const textElement = document.getElementById(`text-target-${idx}`);
        const chantElement = document.getElementById(`chant-target-${idx}`);
        
        if (!container || !textElement) return;
        
        const isCurrent = currentTime >= line.time && (idx === currentLyrics.length - 1 || currentTime < currentLyrics[idx + 1].time);
        
        if (isCurrent) {
            textElement.classList.replace('opacity-20', 'opacity-100');
            if (chantElement) chantElement.classList.replace('opacity-20', 'opacity-100');
            
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            textElement.classList.replace('opacity-100', 'opacity-20');
            if (chantElement) chantElement.classList.replace('opacity-100', 'opacity-20');
        }
    });
});

audioPlayer.addEventListener('loadedmetadata', () => {
    timeDuration.innerText = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('ended', () => {
    const currentPlaylist = getActivePlaylist();
    if (activeIndex < currentPlaylist.length - 1) {
        triggerCrossFadeTransition(activeIndex + 1);
    } else {
        btnPlayToggle.innerText = "▶";
        resetProgressBar();
    }
});

progressContainer.addEventListener('click', (e) => {
    const duration = audioPlayer.duration;
    if (!duration) return;
    
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left; 
    const width = rect.width; 
    
    const newTime = (clickX / width) * duration;
    audioPlayer.currentTime = newTime;
});

function seekToLyric(targetTime) {
    if (isNaN(targetTime) || !audioPlayer.duration) return;
    audioPlayer.currentTime = targetTime;
    if (audioPlayer.paused) {
        audioPlayer.play().catch(() => {});
        btnPlayToggle.innerText = "⏸️";
    }
}

btnPlayToggle.addEventListener('click', () => {
    if (audioPlayer.paused) { 
        audioPlayer.play().catch(() => {}); 
        btnPlayToggle.innerText = "⏸️"; 
    } else { 
        audioPlayer.pause(); 
        btnPlayToggle.innerText = "▶"; 
    }
});

document.getElementById('btn-next').addEventListener('click', () => { 
    const currentPlaylist = getActivePlaylist();
    if (activeIndex < currentPlaylist.length - 1) triggerCrossFadeTransition(activeIndex + 1); 
});

document.getElementById('btn-prev').addEventListener('click', () => { 
    if (activeIndex > 0) triggerCrossFadeTransition(activeIndex - 1); 
});

window.addEventListener('keydown', (e) => {
    if (e.key === " " || e.code === "Space") {
        e.preventDefault(); 
        if (audioPlayer.paused) { 
            audioPlayer.play().catch(() => {}); 
            btnPlayToggle.innerText = "⏸️"; 
        } else { 
            audioPlayer.pause(); 
            btnPlayToggle.innerText = "▶"; 
        }
    }
});

initSetlistSelector();
document.getElementById('setlist-title').innerText = jkt48Setlists[currentSetlistKey].name;
renderTracklist();
triggerCrossFadeTransition(0);
audioPlayer.pause();
btnPlayToggle.innerText = "▶";