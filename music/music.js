document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const MUSIC_DATA_URL = '/music/music.json';
    const musicContainer = document.getElementById('music-container');
    const lyricsOverlay = document.querySelector('.lyrics-overlay');
    
    // State management
    let activeAudio = null;
    let activePlayButton = null;

    // Check required elements
    if (!musicContainer) {
        console.error('Music container element not found!');
        return;
    }

    if (!lyricsOverlay) {
        console.error('Lyrics overlay element not found!');
        return;
    }

    // Initialize music player
    fetch(MUSIC_DATA_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Loaded music data:', data);
            initializeMusicPlayer(data);
        })
        .catch(error => {
            console.error('Music player initialization failed:', error);
            showErrorToUser();
        });

    function initializeMusicPlayer(tracks) {
        // Create track elements
        tracks.forEach(track => createTrackElement(track));

        // Global event listeners
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('keydown', handleKeyPress);
        lyricsOverlay.addEventListener('click', handleLyricsOverlayClick);
    }

    function createTrackElement(track) {
        // Create track container
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';

        // Create album art section
        const albumArtContainer = createAlbumArtSection(track);
        
        // Create player controls
        const playerControls = createPlayerControls(track);
        
        // Create audio element
        const audioElement = createAudioElement(track);

        // Assemble components
        musicItem.appendChild(albumArtContainer);
        musicItem.appendChild(playerControls);
        musicItem.appendChild(audioElement);
        musicContainer.appendChild(musicItem);

        // Add audio event listeners
        audioElement.addEventListener('timeupdate', () => updateProgress(audioElement, playerControls));
        audioElement.addEventListener('loadedmetadata', () => updateDurationDisplay(audioElement, playerControls));
    }

    function createAlbumArtSection(track) {
        const container = document.createElement('div');
        container.className = 'album-art-container';

        // Album art image
        const img = document.createElement('img');
        img.src = track.image;
        img.alt = track.title;
        img.className = 'album-art';

        // Play/pause button
        const playBtn = document.createElement('button');
        playBtn.className = 'play-pause-btn';
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.addEventListener('click', () => handlePlayPause(track, playBtn));

        // Track menu
        const menu = createTrackMenu(track);
        
        container.append(img, playBtn, menu);
        return container;
    }

    function createTrackMenu(track) {
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';

        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-btn';
        menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

        const dropdown = document.createElement('div');
        dropdown.className = 'menu-dropdown';
        dropdown.innerHTML = `
            <button class="download-btn"><i class="fas fa-download"></i> Download</button>
            <button class="lyrics-btn"><i class="fas fa-scroll"></i> Lyrics</button>
        `;

        // Menu functionality
        menuBtn.addEventListener('click', () => dropdown.classList.toggle('show'));
        dropdown.querySelector('.download-btn').addEventListener('click', () => handleDownload(track));
        dropdown.querySelector('.lyrics-btn').addEventListener('click', () => showLyrics(track));

        menuContainer.append(menuBtn, dropdown);
        return menuContainer;
    }

    function createPlayerControls(track) {
        const controls = document.createElement('div');
        controls.className = 'player-controls';

        const title = document.createElement('div');
        title.className = 'song-title';
        title.textContent = track.title;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        const scrubber = document.createElement('div');
        scrubber.className = 'progress-scrubber';

        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.innerHTML = `
            <span class="current-time">0:00</span>
            <span class="duration">0:00</span>
        `;

        // Progress bar functionality
        setupProgressControls(progressContainer, timeDisplay);

        progressContainer.append(scrubber, progressBar);
        controls.append(title, progressContainer, timeDisplay);
        return controls;
    }

    function createAudioElement(track) {
        const audio = document.createElement('audio');
        audio.src = track.file;
        return audio;
    }

    // Event Handlers
    function handlePlayPause(track, button) {
        const audio = button.parentElement.nextElementSibling.nextElementSibling;
        
        if (audio.paused) {
            if (activeAudio) {
                activeAudio.pause();
                activePlayButton.innerHTML = '<i class="fas fa-play"></i>';
            }
            activeAudio = audio;
            activePlayButton = button;
            audio.play();
            button.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            button.innerHTML = '<i class="fas fa-play"></i>';
            activeAudio = null;
            activePlayButton = null;
        }
    }

    function handleDocumentClick(e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.menu-container')) {
            document.querySelectorAll('.menu-dropdown').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Escape') {
            lyricsOverlay.classList.remove('show');
        }
    }

    function handleLyricsOverlayClick(e) {
        if (e.target.classList.contains('lyrics-overlay') || 
            e.target.classList.contains('close-lyrics')) {
            lyricsOverlay.classList.remove('show');
        }
    }

    function handleDownload(track) {
        const link = document.createElement('a');
        link.href = track.file;
        link.download = `${track.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function showLyrics(track) {
        try {
            const response = await fetch(track.lyrics);
            if (!response.ok) throw new Error('Lyrics not found');
            const text = await response.text();
            
            const lyricsText = lyricsOverlay.querySelector('.lyrics-text');
            lyricsText.innerHTML = text.split('\n').map(line => 
                `<p>${line}</p>`
            ).join('');
            
            lyricsOverlay.classList.add('show');
        } catch (error) {
            console.error('Error loading lyrics:', error);
            lyricsOverlay.querySelector('.lyrics-text').textContent = 'Lyrics not available';
            lyricsOverlay.classList.add('show');
        }
    }

    // Progress Controls
    function setupProgressControls(container, timeDisplay) {
        let isDragging = false;

        const getClickedTime = (clientX) => {
            const rect = container.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return percentage;
        };

        const updateAudioTime = (percentage, audio) => {
            if (audio) audio.currentTime = percentage * audio.duration;
        };

        // Mouse events
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            const audio = container.parentElement.nextElementSibling;
            updateAudioTime(getClickedTime(e.clientX), audio);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const audio = container.parentElement.nextElementSibling;
            updateAudioTime(getClickedTime(e.clientX), audio);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            const audio = container.parentElement.nextElementSibling;
            updateAudioTime(getClickedTime(e.touches[0].clientX), audio);
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const audio = container.parentElement.nextElementSibling;
            updateAudioTime(getClickedTime(e.touches[0].clientX), audio);
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Click to scrub
        container.addEventListener('click', (e) => {
            const audio = container.parentElement.nextElementSibling;
            updateAudioTime(getClickedTime(e.clientX), audio);
        });
    }

    // UI Updates
    function updateProgress(audio, controls) {
        const progress = (audio.currentTime / audio.duration) * 100;
        const progressBar = controls.querySelector('.progress-bar');
        const scrubber = controls.querySelector('.progress-scrubber');
        const currentTime = controls.querySelector('.current-time');

        progressBar.style.width = `${progress}%`;
        scrubber.style.left = `${progress}%`;
        currentTime.textContent = formatTime(audio.currentTime);
    }

    function updateDurationDisplay(audio, controls) {
        const durationElement = controls.querySelector('.duration');
        durationElement.textContent = formatTime(audio.duration);
    }

    // Utilities
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function showErrorToUser() {
        // Implement user-facing error display
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = 'Failed to load music content. Please try again later.';
        musicContainer.appendChild(errorElement);
    }
});