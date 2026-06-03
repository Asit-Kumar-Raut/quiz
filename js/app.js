// Aiko's 3D GK & Abacus Adventure - Core Application Engine
// Handles portals, click-to-speak voice synthesizers, static abacus box worksheets, and handwriting recognition.

const safeStorage = {
    getItem(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem(key, value) {
        try { localStorage.setItem(key, value); } catch (e) {}
    }
};

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Global State
const state = {
    childName: safeStorage.getItem('aiko_child_name') || '',
    portalMode: 'select', // 'select', 'small', 'big'
    gameMode: 'gk', // 'gk', 'abacus-vis', 'abacus-arith'
    classDivision: safeStorage.getItem('aiko_class') || '3', // '2', '3', '4', '5'
    difficulty: safeStorage.getItem('aiko_diff') || 'easy', // 'easy', 'medium', 'hard'
    timerEnabled: safeStorage.getItem('aiko_timer') !== 'false', // true or false
    
    // Questions track
    questions: [],
    questionIndex: 0,
    correctCount: 0,
    answered: false,
    timer: null,
    timerCount: 15,
    
    // Voice toggles
    soundEnabled: true,
    speechActive: false,
    
    // Small portal
    currentClassicGame: null,
    
    // Current text to speak on mascot click
    currentPromptSpeechText: "Hello! Click on me to hear the question!",
    currentPromptBubbleText: "Hello! Click on me to hear the question! 🌟"
};

const $ = (sel) => document.querySelector(sel);

// Indian English voice synthesizers (runs only when mascot is clicked)
let speechUtterance = null;
function speakText(text, callback, bubbleText) {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // Save to current voice buffer so clicking Aiko can repeat it
    state.currentPromptSpeechText = text;
    if (bubbleText) state.currentPromptBubbleText = bubbleText;

    // Display text in speech bubble
    const textEl = $('#aiko-text');
    if (textEl) textEl.textContent = state.currentPromptBubbleText || text;

    if (!state.soundEnabled) {
        if (callback) callback();
        return;
    }

    state.speechActive = true;
    const mouth = $('#aiko-mouth');
    if (mouth) mouth.classList.add('talking');

    speechUtterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize Indian English (en-IN) voices
    let voice = voices.find(v => {
        const lang = v.lang.toLowerCase().replace('_', '-');
        const name = v.name.toLowerCase();
        return lang === 'en-in' && (name.includes('female') || name.includes('sangeeta') || name.includes('heera') || name.includes('neerja') || name.includes('veena') || name.includes('google'));
    });
    
    if (!voice) voice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith('en-in'));
    if (!voice) voice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    
    if (voice) speechUtterance.voice = voice;
    
    speechUtterance.rate = 0.70; // Slowly and clearly like an Indian speaker
    speechUtterance.pitch = 1.15;

    speechUtterance.onend = () => {
        state.speechActive = false;
        if (mouth) mouth.classList.remove('talking');
        if (callback) callback();
    };

    speechUtterance.onerror = () => {
        state.speechActive = false;
        if (mouth) mouth.classList.remove('talking');
        if (callback) callback();
    };

    window.speechSynthesis.speak(speechUtterance);
}

// Quiet beep feedback frequencies
function playSoundTone(frequency, duration, type = 'sine') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function triggerScreenFlash(isCorrect) {
    const flashEl = isCorrect ? $('#correct-flash') : $('#wrong-flash');
    if (!flashEl) return;
    flashEl.classList.remove('active');
    void flashEl.offsetWidth; // redraw
    flashEl.classList.add('active');
    setTimeout(() => flashEl.classList.remove('active'), isCorrect ? 450 : 800);
}

function spawnConfetti() {
    const colors = ['#6c5ce7', '#ff7675', '#00b894', '#fdcb6e', '#74b9ff', '#a29bfe'];
    for (let i = 0; i < 20; i++) {
        const el = document.createElement('span');
        el.className = 'confetti';
        el.style.left = `${Math.random() * 100}%`;
        el.style.background = colors[i % colors.length];
        el.style.width = `${Math.random() * 8 + 6}px`;
        el.style.height = `${Math.random() * 8 + 6}px`;
        el.style.animationDelay = `${Math.random() * 0.3}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
    }
}

function spawnStars() {
    for (let i = 0; i < 8; i++) {
        const s = document.createElement('span');
        s.className = 'float-star';
        s.textContent = '⭐';
        s.style.left = `${20 + Math.random() * 60}%`;
        s.style.top = `${30 + Math.random() * 40}%`;
        s.style.animationDelay = `${i * 0.08}s`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1200);
    }
}

// ----------------------------------------------------------------------------
// PORTAL & NAVIGATION CONTROLLER
// ----------------------------------------------------------------------------
function navigateToScreen(screenId) {
    if (state.timer) clearInterval(state.timer);
    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
    if (recognition) {
        try { recognition.abort(); } catch (e) {}
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const mouth = $('#aiko-mouth');
        if (mouth) mouth.classList.remove('talking');
        state.speechActive = false;
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if (screenId === 'portal') {
        $('#portal-select-screen').classList.add('active');
        $('#home-nav-btn').classList.add('hidden');
        $('#welcome-explorer-tag').textContent = `Choose your learning portal, ${state.childName || 'Explorer'}!`;
        
        // Print message in bubble. ONLY speak on Click.
        setPromptText(`Hello ${state.childName}! Welcome to the portal select screen. Choose Small Children or Big Children to start!`);
    } else if (screenId === 'small-home') {
        $('#small-home-screen').classList.add('active');
        $('#home-nav-btn').classList.remove('hidden');
        renderSmallHomeUI();
    } else if (screenId === 'big-home') {
        $('#big-home-screen').classList.add('active');
        $('#home-nav-btn').classList.remove('hidden');
        setPromptText(`Welcome ${state.childName} to the big child portal! Select one of our three games: Planet GK, Abacus Visualization, or Abacus Arithmetic!`);
    } else if (screenId === 'setup') {
        $('#setup-screen').classList.add('active');
        $('#home-nav-btn').classList.remove('hidden');
        renderSetupUI();
    } else if (screenId === 'game') {
        $('#game-screen').classList.add('active');
        $('#home-nav-btn').classList.remove('hidden');
        initiateGamePlay();
    } else if (screenId === 'results') {
        $('#results-screen').classList.add('active');
        $('#home-nav-btn').classList.remove('hidden');
        renderResultsUI();
    }
}

function setPromptText(text, bubbleText) {
    state.currentPromptSpeechText = text;
    state.currentPromptBubbleText = bubbleText || text;
    const textEl = $('#aiko-text');
    if (textEl) textEl.textContent = state.currentPromptBubbleText;
}

// ----------------------------------------------------------------------------
// VOICE NAME COLLECTING popup modal
// ----------------------------------------------------------------------------
let nameSpeechRecognition = null;
let recognition = null;
let autoAdvanceTimeout = null;

function parseSpokenInput(transcript, correctWord) {
    const cleaned = transcript.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (cleaned === correctWord) return correctWord;
    
    const words = transcript.toLowerCase().replace(/[,?!();:]/g, ' ').split(/[\s\-\.]+/);
    let spellingResult = '';
    
    const LETTER_MAP = {
        'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'h': 'H', 'i': 'I', 'j': 'J',
        'k': 'K', 'l': 'L', 'm': 'M', 'n': 'N', 'o': 'O', 'p': 'P', 'q': 'Q', 'r': 'R', 's': 'S', 't': 'T',
        'u': 'U', 'v': 'V', 'w': 'W', 'x': 'X', 'y': 'Y', 'z': 'Z',
        'bee': 'B', 'be': 'B', 'see': 'C', 'sea': 'C', 'she': 'C', 'dee': 'D', 'the': 'D', 'day': 'D', 'gee': 'G', 'aitch': 'H',
        'eye': 'I', 'jay': 'J', 'kay': 'K', 'el': 'L', 'em': 'M', 'en': 'N', 'and': 'N', 'in': 'N', 'oh': 'O', 'owe': 'O', 'pee': 'P',
        'cue': 'Q', 'queue': 'Q', 'are': 'R', 'our': 'R', 'es': 'S', 'is': 'S', 'tee': 'T', 'tea': 'T', 'to': 'T', 'two': 'T', 'too': 'T',
        'you': 'U', 'vee': 'V', 'we': 'V', 'double you': 'W', 'double-u': 'W', 'ex': 'X', 'why': 'Y', 'zee': 'Z', 'zed': 'Z', 'hey': 'A'
    };
    
    for (const w of words) {
        const cleanWord = w.replace(/[^a-z]/g, '');
        if (!cleanWord) continue;
        if (LETTER_MAP[cleanWord]) {
            spellingResult += LETTER_MAP[cleanWord];
        } else if (cleanWord.length === 1 && cleanWord >= 'a' && cleanWord <= 'z') {
            spellingResult += cleanWord.toUpperCase();
        }
    }
    
    if (spellingResult.length > 0) {
        if (spellingResult === correctWord) return correctWord;
        return spellingResult;
    }
    return cleaned;
}

function startSpeechRecognition(correctWord, onUpdate, onComplete, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        onError("not-supported");
        return;
    }
    
    if (recognition) {
        try { recognition.abort(); } catch (e) {}
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    
    let finalParsed = '';
    let isFinished = false;
    
    recognition.onstart = () => {
        onUpdate({ status: 'listening', text: '' });
    };
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        
        let parsed = parseSpokenInput(transcript, correctWord);
        finalParsed = parsed;
        onUpdate({ status: 'interim', text: parsed, raw: transcript });
        if (parsed === correctWord && !isFinished) {
            isFinished = true;
            try { recognition.stop(); } catch (e) {}
        }
    };
    
    recognition.onerror = (event) => {
        onError(event.error);
    };
    
    recognition.onend = () => {
        onComplete(finalParsed);
    };
    
    recognition.start();
}

function initNameSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = $('#name-mic-btn');
    const statusLabel = $('#name-mic-status');

    if (!SpeechRecognition) {
        if (micBtn && statusLabel) {
            micBtn.style.opacity = '0.6';
            micBtn.addEventListener('click', () => {
                playSoundTone(400, 0.08);
                statusLabel.textContent = "Voice input is not supported here. Please type your name! 👇";
            });
        }
        return;
    }

    nameSpeechRecognition = new SpeechRecognition();
    nameSpeechRecognition.continuous = false;
    nameSpeechRecognition.interimResults = false;
    nameSpeechRecognition.lang = 'en-IN'; // Listen for Indian-English

    nameSpeechRecognition.onstart = () => {
        micBtn.classList.add('recording');
        micBtn.textContent = '🛑 Listening...';
        statusLabel.textContent = 'Tell me your name now! 👂';
    };

    nameSpeechRecognition.onresult = (e) => {
        let transcript = e.results[0][0].transcript;
        transcript = transcript.replace(/my name is/gi, '').replace(/i am/gi, '').replace(/\./g, '').trim();
        if (transcript.length > 0) {
            transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
        }
        $('#name-text-input').value = transcript;
        statusLabel.textContent = `I heard: "${transcript}"!`;
    };

    nameSpeechRecognition.onerror = () => {
        statusLabel.textContent = 'Mic timed out. Click button to speak!';
    };

    nameSpeechRecognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.textContent = '🎤 Say Name';
    };

    micBtn.addEventListener('click', () => {
        if (micBtn.classList.contains('recording')) {
            nameSpeechRecognition.stop();
        } else {
            nameSpeechRecognition.start();
        }
    });
}

function checkNameState() {
    if (!state.childName) {
        $('#name-modal-popup').classList.remove('hidden');
        speakText("Welcome explorer! Before we start, please tell Aiko your name by clicking the microphone!");
    } else {
        $('#name-modal-popup').classList.add('hidden');
        navigateToScreen('portal');
    }
}

// ----------------------------------------------------------------------------
// SMALL CHILDREN CLASSIC PORTAL DASHBOARD
// ----------------------------------------------------------------------------
function renderSmallHomeUI() {
    document.querySelectorAll('#classic-level-buttons .level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lvl === state.difficulty);
    });

    const hints = {
        easy: 'Numbers 0–20 · Short words · Simple colors & shapes',
        middle: 'Numbers 21–50 · Medium words · Trickier odd-one-out',
        hard: 'Numbers 51–100 · Long words · Hard rhymes & colors'
    };
    $('#classic-level-hint').textContent = hints[state.difficulty];

    const grid = $('#classic-games-grid');
    grid.innerHTML = GAMES.map(g => {
        const sub = GAME_LEVEL_LABELS[g.id]?.[state.difficulty] || '';
        return `
            <button type="button" class="game-block-card tap-3d" data-game="${g.id}" style="--game-color:${g.color}">
                <span class="game-block-emoji">${g.emoji}</span>
                <span class="game-block-title">${g.title}</span>
                <span class="game-block-desc">${sub}</span>
            </button>
        `;
    }).join('');
    
    setPromptText(`Okay ${state.childName}, select a difficulty level, then tap a game to play! Click Aiko if you need help speaking!`);
}

// ----------------------------------------------------------------------------
// SETUP SCREEN (BIG CHILDREN OPTION CONFIGS)
// ----------------------------------------------------------------------------
function renderSetupUI() {
    // Highlight Class Buttons
    document.querySelectorAll('#class-buttons .class-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.class === state.classDivision);
    });

    // Highlight Level Buttons
    document.querySelectorAll('#setup-level-buttons .level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lvl === state.difficulty);
    });

    // Timer toggles
    $('#timer-mode-on-btn').classList.toggle('active', state.timerEnabled);
    $('#timer-mode-off-btn').classList.toggle('active', !state.timerEnabled);

    const hintEl = $('#level-description-hint');
    if (state.gameMode === 'gk') {
        const descriptions = {
            easy: "🌱 Easy: Planets 101, basic science terms, and friendly animal facts.",
            medium: "⚡ Medium: Deeper solar system orbits, geography, and standard science.",
            hard: "🔥 Hard: Outer atmospheric layers, chemical properties, and historical inventors."
        };
        hintEl.textContent = descriptions[state.difficulty];
        setPromptText(`Choose your Class, Level, and Timer options for Space GK Quiz! Click Aiko to speak.`);
    } else if (state.gameMode === 'abacus-vis') {
        const descriptions = {
            easy: "🌱 Easy: Single-digit abacus beads readings. Wires: 1 (Ones place).",
            medium: "⚡ Medium: Double-digit abacus beads readings. Wires: 2 (Tens, Ones places).",
            hard: "🔥 Hard: Triple-digit abacus beads readings. Wires: 3 (Hundreds, Tens, Ones)."
        };
        hintEl.textContent = descriptions[state.difficulty];
        setPromptText(`Choose options for Abacus Visualization! Wires automatically adjust based on difficulty.`);
    } else {
        const descriptions = {
            easy: "🌱 Easy: Arithmetic sums with single digits. Wires: 1 (Ones place).",
            medium: "⚡ Medium: Arithmetic sums with 2-digit values. Wires: 2 (Tens, Ones places).",
            hard: "🔥 Hard: Arithmetic sums mixing 2 and 3-digit values. Wires: 3 (Hundreds, Tens, Ones)."
        };
        hintEl.textContent = descriptions[state.difficulty];
        setPromptText(`Choose options for Abacus Arithmetic! Solve the equations and draw answers.`);
    }
}

// ----------------------------------------------------------------------------
// CORE GAMEPLAY ENGINE
// ----------------------------------------------------------------------------
function initiateGamePlay() {
    // Defensively map difficulty keys based on portalMode to prevent crashes
    if (state.portalMode === 'big' && state.difficulty === 'middle') {
        state.difficulty = 'medium';
    } else if (state.portalMode === 'small' && state.difficulty === 'medium') {
        state.difficulty = 'middle';
    }

    state.questionIndex = 0;
    state.correctCount = 0;
    state.answered = false;

    // Reset game stage UI to clear any leftovers from previous games
    $('#prompt-area').innerHTML = '';
    $('#options-area').innerHTML = '';
    $('#options-area').className = 'options-grid-3d';
    $('#abacus-drawing-zone').classList.add('hidden');
    $('#canvases-container').innerHTML = '';

    const isBig = state.portalMode === 'big';
    const maxQs = window.QUESTIONS_PER_ROUND || 20;
    
    if (isBig) {
        if (state.gameMode === 'gk') {
            $('#hud-game-mode').textContent = '🪐 GK Quiz';
            const list = GK_QUESTIONS[state.classDivision]?.[state.difficulty] || [];
            let pool = [];
            while (pool.length < maxQs && list.length > 0) {
                pool = pool.concat(shuffleArray(list));
            }
            state.questions = pool.slice(0, maxQs);
        } else if (state.gameMode === 'abacus-vis') {
            $('#hud-game-mode').textContent = '🧮 Abacus Vis';
            state.questions = buildAbacusVisRound(state.classDivision, state.difficulty);
        } else {
            $('#hud-game-mode').textContent = '➕ Abacus Math';
            state.questions = [];
            for (let i = 0; i < maxQs; i++) {
                state.questions.push(generateAbacusQuestion(state.classDivision, state.difficulty));
            }
        }
        $('#hud-class-level').textContent = `Class ${state.classDivision} · ${state.difficulty.toUpperCase()}`;
    } else {
        $('#hud-game-mode').textContent = `🎈 ${state.currentClassicGame.title}`;
        $('#hud-class-level').textContent = `${state.difficulty.toUpperCase()}`;
        const builder = CLASSIC_BUILDERS[state.currentClassicGame.type];
        state.questions = builder(state.difficulty) || [];
    }

    loadCurrentQuestion();
}

function loadCurrentQuestion() {
    if (recognition) {
        try { recognition.abort(); } catch (e) {}
    }
    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
    state.answered = false;
    $('#next-question-btn').classList.add('hidden');
    $('#timer-box').classList.add('hidden');
    $('#options-area').classList.remove('hidden');
    $('#abacus-drawing-zone').classList.add('hidden');
    
    // Clear canvas coordinate buffers
    canvasStrokePoints = {};
    isDrawingBuffer = {};
    recognitionTimers = {};

    const total = state.questions.length;
    $('#hud-q-index').textContent = `${state.questionIndex + 1}/${total}`;
    
    const pct = (state.questionIndex / total) * 100;
    $('#game-progress-fill').style.width = `${pct}%`;

    const q = state.questions[state.questionIndex];
    if (!q) return;

    if (state.portalMode === 'big') {
        if (state.gameMode === 'gk') {
            renderGKQuestion(q);
        } else if (state.gameMode === 'abacus-vis') {
            renderAbacusVisQuestion(q);
        } else {
            renderAbacusArithQuestion(q);
        }
    } else {
        renderClassicQuestion(q);
    }
}

// 15s Timer Loop for Big Child games
function resetGameplayTimer(q) {
    if (state.timer) clearInterval(state.timer);
    if (!state.timerEnabled) return;

    state.timerCount = 15;
    const val = $('#timer-value');
    const ring = $('#timer-ring');
    const box = $('#timer-box');
    
    box.classList.remove('low-time');
    val.textContent = state.timerCount;
    ring.style.strokeDashoffset = 0;
    $('#timer-box').classList.remove('hidden');

    state.timer = setInterval(() => {
        state.timerCount--;
        val.textContent = state.timerCount;

        const offset = 107 - (107 * state.timerCount / 15);
        ring.style.strokeDashoffset = offset;

        if (state.timerCount <= 3 && state.timerCount > 0) {
            box.classList.add('low-time');
            playSoundTone(800, 0.05);
        }

        if (state.timerCount <= 0) {
            clearInterval(state.timer);
            handleTimeAdvance(q);
        }
    }, 1000);
}

function handleTimeAdvance(q) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timer);

    document.querySelectorAll('.option-btn-3d').forEach(b => {
        b.disabled = true;
        b.classList.add('locked');
        if (b.textContent === q.correct) b.classList.add('correct');
    });

    document.querySelectorAll('.bead-upper, .bead-lower').forEach(b => {
        b.style.pointerEvents = 'none';
    });
    const resetBtn = $('#reset-abacus-beads-btn');
    if (resetBtn) resetBtn.disabled = true;

    triggerScreenFlash(false);
    playSoundTone(220, 0.3, 'sawtooth');
    
    const targetAnswer = (state.portalMode === 'big' && state.gameMode === 'abacus-arith') ? q.answer : q.correct;
    const explanation = q.explanation || `The correct answer is ${targetAnswer}.`;
    setPromptText(`Time is up ${state.childName}! ${explanation}`);
    revealNextBtn();
    autoAdvanceQuestion();
}

function autoAdvanceQuestion() {
    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = setTimeout(() => {
        if (!state.answered) return;
        const isLast = state.questionIndex >= state.questions.length - 1;
        if (isLast) {
            navigateToScreen('results');
        } else {
            state.questionIndex++;
            loadCurrentQuestion();
        }
    }, 1800);
}

function revealNextBtn() {
    const nextBtn = $('#next-question-btn');
    const isLast = state.questionIndex >= state.questions.length - 1;
    nextBtn.textContent = isLast ? "Finish Adventure 🏆" : "Next Question →";
    nextBtn.classList.remove('hidden');
}

// -------------------------------------------------------------
// 1st: PLANET GK QUIZ GAME
// -------------------------------------------------------------
function renderGKQuestion(q) {
    const promptArea = $('#prompt-area');
    promptArea.innerHTML = `
        <div class="image-frame-3d">
            <img id="gk-question-image" src="${q.image}" alt="Space Image" draggable="false">
        </div>
        <h3 class="question-text">${q.question}</h3>
    `;

    const optionsArea = $('#options-area');
    optionsArea.className = 'options-grid-3d';
    optionsArea.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn-3d tap-3d';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleGKAnswer(opt, btn, q));
        optionsArea.appendChild(btn);
    });

    resetGameplayTimer(q);
    
    // Set text ONLY. Click Aiko to hear speech sound.
    setPromptText(q.question);
}

function handleGKAnswer(selected, btn, q) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timer);

    const isCorrect = selected === q.correct;
    
    document.querySelectorAll('.option-btn-3d').forEach(b => {
        b.disabled = true;
        b.classList.add('locked');
        if (b.textContent === q.correct) b.classList.add('correct');
    });

    if (isCorrect) {
        state.correctCount++;
        btn.classList.add('correct');
        triggerScreenFlash(true);
        spawnConfetti();
        spawnStars();
        playSoundTone(523, 0.12);
        setTimeout(() => playSoundTone(659, 0.15), 100);
        setPromptText(`Correct ${state.childName}! ${q.explanation}`);
        revealNextBtn();
        autoAdvanceQuestion();
    } else {
        btn.classList.add('incorrect');
        triggerScreenFlash(false);
        playSoundTone(220, 0.3, 'sawtooth');
        setPromptText(`Oops! The correct answer is ${q.correct}. ${q.explanation}`);
        revealNextBtn();
        autoAdvanceQuestion();
    }
}

// -------------------------------------------------------------
// 2nd: ABACUS VISUALIZATION GAME (IDENTIFY THE BEADS VALUE)
// -------------------------------------------------------------
function setInteractiveAbacusValue(number) {
    let columns = 1;
    if (state.difficulty === 'medium') columns = 2;
    else if (state.difficulty === 'hard') columns = 3;

    const numStr = String(number).padStart(columns, '0');
    const cols = document.querySelectorAll('#interactive-abacus-widget .abacus-column');
    if (cols.length === 0) return;

    for (let c = 0; c < columns; c++) {
        const digit = parseInt(numStr[c], 10);
        const colEl = cols[c];
        if (!colEl) continue;

        const upper = colEl.querySelector('.bead-upper');
        if (upper) {
            const active = digit >= 5;
            upper.style.top = active ? '45px' : '10px';
            upper.dataset.active = active ? 'true' : 'false';
        }

        const lowerVal = digit % 5;
        const lowers = colEl.querySelectorAll('.bead-lower');
        const sorted = Array.from(lowers).sort((x,y) => parseInt(x.dataset.idx) - parseInt(y.dataset.idx));
        
        for (let b = 0; b < 4; b++) {
            if (sorted[b]) {
                const active = b < lowerVal;
                sorted[b].style.top = active ? `${78 + b * 18}px` : `${105 + b * 18}px`;
            }
        }
    }
    const valEl = $('#abacus-value-number');
    if (valEl) valEl.textContent = number;
}

function renderAbacusVisQuestion(q) {
    const promptArea = $('#prompt-area');
    
    promptArea.innerHTML = `
        <h3 class="question-text" style="margin-bottom:12px;">What number is represented on the abacus?</h3>
        <div class="abacus-play-box-panel" style="width:100%; border-style:solid; border-color:#dfe6e9; margin-bottom:16px;">
            <p class="abacus-interactive-title" style="text-align:center;">
                Abacus Box
            </p>
            <div class="abacus-board-3d" id="interactive-abacus-widget" style="pointer-events: none;"></div>
        </div>
    `;

    $('#options-area').classList.add('hidden');

    buildAbacusBoxRods();
    setInteractiveAbacusValue(parseInt(q.correct, 10));

    setupHandwritingCanvases(q.correct);

    resetGameplayTimer(q);
    setPromptText("Count the beads on the abacus box and write your answer below!");
}

function buildFrozenAbacusBeads(number) {
    const board = $('#vis-abacus-widget');
    board.innerHTML = '';

    // Wires count matches difficulty: Easy (1), Medium (2), Hard (3)
    let columns = 1;
    let colorList = ['#60a5fa'];
    if (state.difficulty === 'medium') {
        columns = 2;
        colorList = ['#fbbf24', '#60a5fa'];
    } else if (state.difficulty === 'hard') {
        columns = 3;
        colorList = ['#f87171', '#fbbf24', '#60a5fa'];
    }

    // Format number to length. E.g. 24 -> padded to 2 digits.
    const numStr = String(number).padStart(columns, '0');

    for (let c = 0; c < columns; c++) {
        const digit = parseInt(numStr[c], 10);
        
        const col = document.createElement('div');
        col.className = 'abacus-column';
        col.style.width = `${100 / columns}%`;

        const wire = document.createElement('div');
        wire.className = 'abacus-wire';
        col.appendChild(wire);

        const divider = document.createElement('div');
        divider.className = 'abacus-divider';
        col.appendChild(divider);

        // Upper bead (active if value >= 5)
        const upperVal = digit >= 5 ? 1 : 0;
        const upper = document.createElement('div');
        upper.className = 'bead-upper';
        upper.style.background = `linear-gradient(180deg, ${colorList[c]} 0%, #1e293b 100%)`;
        upper.style.top = upperVal === 1 ? '45px' : '10px';
        col.appendChild(upper);

        // Lower beads (value = digit % 5)
        const lowerVal = digit % 5;
        for (let b = 0; b < 4; b++) {
            const active = b < lowerVal;
            const lower = document.createElement('div');
            lower.className = 'bead-lower';
            lower.style.background = `linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)`;
            lower.style.top = active ? `${78 + b * 18}px` : `${105 + b * 18}px`;
            col.appendChild(lower);
        }

        col.appendChild(divider);
        board.appendChild(col);
    }
}

// -------------------------------------------------------------
// 3rd: ABACUS ARITHMETIC (STATIC EQUATION display)
// -------------------------------------------------------------
function renderAbacusArithQuestion(q) {
    const promptArea = $('#prompt-area');
    
    let arithHtml = '<div class="abacus-arith-block">';
    q.sequence.forEach((step, index) => {
        const sign = step.op === '+' ? '+&nbsp;' : '&minus;&nbsp;';
        const isLast = index === q.sequence.length - 1;
        arithHtml += `<span class="arith-line ${isLast ? 'last' : ''}">${sign}${step.val}</span>`;
    });
    arithHtml += '</div>';

    promptArea.innerHTML = `
        ${arithHtml}
        <p class="question-text" style="font-size:0.95rem; color:#636e72;">Calculate the total sum and draw your answer!</p>
    `;

    $('#options-area').classList.add('hidden');

    setupHandwritingCanvases(q.answer);

    resetGameplayTimer(q);
    setPromptText("Add or subtract the numbers in the worksheet and draw your answer directly in the boxes!");
}

// Adaptive wires based on difficulty for interactive abacus
function buildAbacusBoxRods() {
    const board = $('#interactive-abacus-widget');
    board.innerHTML = '';

    let columnsCount = 1;
    let headers = ['1'];
    let colors = ['#60a5fa'];
    
    if (state.difficulty === 'medium') {
        columnsCount = 2;
        headers = ['10', '1'];
        colors = ['#fbbf24', '#60a5fa'];
    } else if (state.difficulty === 'hard') {
        columnsCount = 3;
        headers = ['100', '10', '1'];
        colors = ['#f87171', '#fbbf24', '#60a5fa'];
    }

    for (let c = 0; c < columnsCount; c++) {
        const col = document.createElement('div');
        col.className = 'abacus-column';
        col.dataset.col = c;
        col.style.width = `${100 / columnsCount}%`;

        const wire = document.createElement('div');
        wire.className = 'abacus-wire';
        col.appendChild(wire);

        const divider = document.createElement('div');
        divider.className = 'abacus-divider';
        col.appendChild(divider);

        // Upper bead (+5)
        const upper = document.createElement('div');
        upper.className = 'bead-upper';
        upper.style.background = `linear-gradient(180deg, ${colors[c]} 0%, #1e293b 100%)`;
        upper.style.top = '10px';
        upper.dataset.active = 'false';
        upper.addEventListener('click', () => {
            playSoundTone(600, 0.05);
            const active = upper.dataset.active === 'true';
            upper.style.top = active ? '10px' : '45px';
            upper.dataset.active = active ? 'false' : 'true';
            recalcAbacusBoxValue(columnsCount);
        });
        col.appendChild(upper);

        // 4 Lower beads (+1 each)
        for (let b = 0; b < 4; b++) {
            const lower = document.createElement('div');
            lower.className = 'bead-lower';
            lower.style.background = `linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)`;
            lower.dataset.col = c;
            lower.dataset.idx = b;
            lower.style.top = `${105 + b * 18}px`; // idle spacing
            lower.addEventListener('click', () => {
                playSoundTone(600, 0.05);
                const colBeads = document.querySelectorAll(`.bead-lower[data-col="${c}"]`);
                const sorted = Array.from(colBeads).sort((x,y) => parseInt(x.dataset.idx) - parseInt(y.dataset.idx));
                const active = sorted[b].style.top === `${78 + b * 18}px`;

                if (active) {
                    for (let k = b; k < 4; k++) {
                        sorted[k].style.top = `${105 + k * 18}px`;
                    }
                } else {
                    for (let k = 0; k <= b; k++) {
                        sorted[k].style.top = `${78 + k * 18}px`;
                    }
                }
                recalcAbacusBoxValue(columnsCount);
            });
            col.appendChild(lower);
        }

        const label = document.createElement('span');
        label.className = 'column-label';
        label.textContent = headers[c];
        col.appendChild(label);

        board.appendChild(col);
    }

    const valEl = $('#abacus-value-number');
    if (valEl) valEl.textContent = '0';
}

function recalcAbacusBoxValue(columnsCount) {
    let sum = 0;
    const multipliers = columnsCount === 3 
        ? [100, 10, 1] 
        : columnsCount === 2 
            ? [10, 1] 
            : [1];

    for (let c = 0; c < columnsCount; c++) {
        let colVal = 0;
        const colEl = document.querySelectorAll('.abacus-column')[c];
        
        const upper = colEl.querySelector('.bead-upper');
        if (upper && upper.dataset.active === 'true') colVal += 5;

        const lowers = colEl.querySelectorAll('.bead-lower');
        let activeCounts = 0;
        lowers.forEach(b => {
            const idx = parseInt(b.dataset.idx);
            if (b.style.top === `${78 + idx * 18}px`) activeCounts++;
        });
        colVal += activeCounts;

        sum += colVal * multipliers[c];
    }
    const valEl = $('#abacus-value-number');
    if (valEl) valEl.textContent = sum;
}

function resetAbacusBeads() {
    playSoundTone(400, 0.08);
    document.querySelectorAll('.bead-upper').forEach(b => {
        b.style.top = '10px';
        b.dataset.active = 'false';
    });
    document.querySelectorAll('.bead-lower').forEach(b => {
        const idx = parseInt(b.dataset.idx);
        b.style.top = `${105 + idx * 18}px`;
    });
    $('#abacus-value-number').textContent = '0';
}

// Drawing canvases setup
let canvasStrokePoints = {};
let isDrawingBuffer = {};
let recognitionTimers = {};

function setupHandwritingCanvases(correctAnswer) {
    const containers = $('#canvases-container');
    containers.innerHTML = '';

    const ansString = String(correctAnswer);
    const length = ansString.length;

    canvasStrokePoints = {};
    isDrawingBuffer = {};
    recognitionTimers = {};

    const placeNames = length === 3 
        ? ['100s', '10s', '1s'] 
        : length === 2 
            ? ['10s', '1s'] 
            : ['1s'];

    for (let i = 0; i < length; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'canvas-wrapper';

        const card = document.createElement('div');
        card.className = 'canvas-card-3d';
        card.id = `canvas-card-${i}`;

        const pred = document.createElement('div');
        pred.className = 'canvas-prediction-label';
        pred.id = `canvas-pred-${i}`;
        pred.textContent = '?';

        const canvas = document.createElement('canvas');
        canvas.className = 'digital-canvas';
        canvas.width = 90;
        canvas.height = 115;
        canvas.id = `canvas-digit-${i}`;

        const place = document.createElement('span');
        place.className = 'canvas-place-label';
        place.textContent = placeNames[i];

        card.appendChild(canvas);
        wrap.appendChild(pred);
        wrap.appendChild(card);
        wrap.appendChild(place);
        containers.appendChild(wrap);

        bindCanvasDrawingEvents(canvas, i);
    }

    $('#abacus-drawing-zone').classList.remove('hidden');
}

function bindCanvasDrawingEvents(canvas, index) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#6c5ce7'; // Match primary color
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvasStrokePoints[index] = [];
    isDrawingBuffer[index] = false;

    // Mouse Listeners
    canvas.addEventListener('mousedown', (e) => {
        isDrawingBuffer[index] = true;
        const rect = canvas.getBoundingClientRect();
        const pt = { 
            x: (e.clientX - rect.left) * (canvas.width / rect.width), 
            y: (e.clientY - rect.top) * (canvas.height / rect.height) 
        };
        canvasStrokePoints[index].push(pt);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        $(`#canvas-card-${index}`).classList.add('active-drawing');
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawingBuffer[index]) return;
        const rect = canvas.getBoundingClientRect();
        const pt = { 
            x: (e.clientX - rect.left) * (canvas.width / rect.width), 
            y: (e.clientY - rect.top) * (canvas.height / rect.height) 
        };
        canvasStrokePoints[index].push(pt);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
    });

    window.addEventListener('mouseup', () => {
        if (isDrawingBuffer[index]) {
            isDrawingBuffer[index] = false;
            $(`#canvas-card-${index}`).classList.remove('active-drawing');
            runDigitRecognition(index);
        }
    });

    // Touch Listeners
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawingBuffer[index] = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const pt = { 
            x: (touch.clientX - rect.left) * (canvas.width / rect.width), 
            y: (touch.clientY - rect.top) * (canvas.height / rect.height) 
        };
        canvasStrokePoints[index].push(pt);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        $(`#canvas-card-${index}`).classList.add('active-drawing');
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawingBuffer[index]) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const pt = { 
            x: (touch.clientX - rect.left) * (canvas.width / rect.width), 
            y: (touch.clientY - rect.top) * (canvas.height / rect.height) 
        };
        canvasStrokePoints[index].push(pt);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (isDrawingBuffer[index]) {
            isDrawingBuffer[index] = false;
            $(`#canvas-card-${index}`).classList.remove('active-drawing');
            runDigitRecognition(index);
        }
    });
}

function runDigitRecognition(index) {
    if (recognitionTimers[index]) clearTimeout(recognitionTimers[index]);

    recognitionTimers[index] = setTimeout(() => {
        const pts = canvasStrokePoints[index];
        const canvas = $(`#canvas-digit-${index}`);
        const predEl = $(`#canvas-pred-${index}`);

        if (pts.length > 0) {
            const digit = recognizeDigit(pts, canvas.width, canvas.height);
            if (digit !== null) {
                predEl.textContent = digit;
                predEl.style.color = '#00b894';
                playSoundTone(700, 0.05);
                setPromptText(`I see ${digit}! Click Aiko if you want me to speak.`);
            } else {
                predEl.textContent = '?';
                predEl.style.color = '#ff7675';
            }
        }
    }, 450);
}

function handleAbacusSubmit() {
    if (state.answered) return;

    const q = state.questions[state.questionIndex];
    const targetAnswer = state.gameMode === 'abacus-vis' ? parseInt(q.correct, 10) : q.answer;
    const ansStr = String(targetAnswer);
    
    let resultText = "";
    let incomplete = false;

    for (let i = 0; i < ansStr.length; i++) {
        const val = $(`#canvas-pred-${i}`).textContent;
        if (val === '?') {
            incomplete = true;
        } else {
            resultText += val;
        }
    }

    if (incomplete) {
        setPromptText("Please write a digit in all drawing boxes before submitting!");
        return;
    }

    const userNumber = parseInt(resultText, 10);
    const isCorrect = userNumber === targetAnswer;
    state.answered = true;
    clearInterval(state.timer);

    document.querySelectorAll('.bead-upper, .bead-lower').forEach(b => {
        b.style.pointerEvents = 'none';
    });
    const resetBtn = $('#reset-abacus-beads-btn');
    if (resetBtn) resetBtn.disabled = true;

    if (isCorrect) {
        state.correctCount++;
        triggerScreenFlash(true);
        spawnStars();
        spawnConfetti();
        playSoundTone(523, 0.15);
        setTimeout(() => playSoundTone(659, 0.15), 100);
        setPromptText(`Superb, ${state.childName}! You wrote ${userNumber}, which is correct!`);
        revealNextBtn();
        autoAdvanceQuestion();
    } else {
        triggerScreenFlash(false);
        playSoundTone(220, 0.3, 'sawtooth');
        setPromptText(`Not quite correct, ${state.childName}. You wrote ${userNumber}, but the answer is ${targetAnswer}.`);
        revealNextBtn();
        autoAdvanceQuestion();
    }
}

function clearAbacusCanvases() {
    if (state.answered) return;
    playSoundTone(300, 0.06);

    const q = state.questions[state.questionIndex];
    const targetAnswer = state.gameMode === 'abacus-vis' ? parseInt(q.correct, 10) : q.answer;
    const ansStr = String(targetAnswer);

    for (let i = 0; i < ansStr.length; i++) {
        const canvas = $(`#canvas-digit-${i}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        $(`#canvas-pred-${i}`).textContent = '?';
        canvasStrokePoints[i] = [];
    }
    setPromptText("Cleared. Draw again!");
}

// -------------------------------------------------------------
// CLASSIC SMALL CHILD GAMES RENDER
// -------------------------------------------------------------
function renderClassicQuestion(q) {
    if (recognition) {
        try { recognition.abort(); } catch (e) {}
    }

    const prompt = $('#prompt-area');
    const optionsArea = $('#options-area');

    optionsArea.className = 'options-grid-3d';
    optionsArea.innerHTML = '';

    // Speak & Spell game layout
    if (state.currentClassicGame && state.currentClassicGame.id === 'speak-spell') {
        const correctWord = q.correct.toUpperCase();
        prompt.innerHTML = `<div class="big-picture">${q.prompt}</div>`;
        
        let blanksHtml = '';
        for (let i = 0; i < correctWord.length; i++) {
            blanksHtml += `<span class="letter-blank empty" id="blank-${i}">_</span>`;
        }
        
        optionsArea.className = 'options-area speak-spell-area';
        optionsArea.innerHTML = `
            <div class="speak-spell-container">
                <div class="spelling-blanks">
                    ${blanksHtml}
                </div>
                <button type="button" class="action-btn primary mic-btn tap-3d" id="mic-btn" style="border:none;">
                    🎤 Start Speaking
                </button>
                <div class="mic-status" id="mic-status">Tap the microphone and spell the word!</div>
            </div>
        `;
        
        const micBtn = $('#mic-btn');
        const micStatus = $('#mic-status');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            micStatus.textContent = "Voice not supported in this browser. Please type the spelling below: 👇";
            optionsArea.innerHTML = `
                <div class="speak-spell-container">
                    <div class="spelling-blanks">
                        ${blanksHtml}
                    </div>
                    <input type="text" id="spelling-fallback-input" placeholder="Type spelling here..." class="fallback-text-input" style="font-family:inherit; padding:10px 16px; border:2px solid #dfe6e9; border-radius:12px; font-size:1.1rem; text-align:center; width:200px; text-transform:uppercase; background:white; margin:10px auto 0;">
                    <button type="button" class="action-btn primary check-btn tap-3d" id="fallback-check-btn" style="max-width:180px; margin-top:10px;">Submit ✓</button>
                </div>
            `;
            const checkBtn = $('#fallback-check-btn');
            const inputEl = $('#spelling-fallback-input');
            
            inputEl.addEventListener('input', () => {
                const val = inputEl.value.toUpperCase();
                for (let i = 0; i < correctWord.length; i++) {
                    const blank = $(`#blank-${i}`);
                    if (blank) {
                        if (i < val.length) {
                            blank.textContent = val[i];
                            blank.classList.remove('empty');
                            blank.classList.add('filled');
                        } else {
                            blank.textContent = '_';
                            blank.classList.remove('filled');
                            blank.classList.add('empty');
                        }
                    }
                }
            });

            checkBtn.addEventListener('click', () => {
                const val = inputEl.value.trim().toUpperCase();
                if (val === correctWord) {
                    handleClassicAnswer(val, checkBtn, q);
                } else {
                    playSoundTone(220, 0.3, 'sawtooth');
                    setPromptText(`Not quite correct. Try spelling "${correctWord}" again! 📝`);
                    inputEl.value = '';
                    
                    // Reset blanks to empty
                    for (let i = 0; i < correctWord.length; i++) {
                        const blank = $(`#blank-${i}`);
                        if (blank) {
                            blank.textContent = '_';
                            blank.classList.remove('filled');
                            blank.classList.add('empty');
                        }
                    }
                }
            });
            setPromptText("Look at the picture and type the spelling below! 📝");
            return;
        }

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) {
                if (recognition) recognition.stop();
                return;
            }
            
            micBtn.classList.add('listening');
            micBtn.innerHTML = '🛑 Listening... 👂';
            
            startSpeechRecognition(
                correctWord,
                (data) => {
                    if (data.status === 'interim') {
                        const text = data.text;
                        for (let i = 0; i < correctWord.length; i++) {
                            const blank = $(`#blank-${i}`);
                            if (blank) {
                                if (i < text.length) {
                                    blank.textContent = text[i];
                                    blank.classList.remove('empty');
                                    blank.classList.add('filled');
                                } else {
                                    blank.textContent = '_';
                                    blank.classList.remove('filled');
                                    blank.classList.add('empty');
                                }
                            }
                        }
                        micStatus.textContent = `I heard: "${data.raw}"`;
                    }
                },
                (finalParsed) => {
                    micBtn.classList.remove('listening');
                    micBtn.innerHTML = '🎤 Start Speaking';
                    
                    let spokenWord = '';
                    for (let i = 0; i < correctWord.length; i++) {
                        const blank = $(`#blank-${i}`);
                        if (blank && blank.textContent !== '_') {
                            spokenWord += blank.textContent;
                        }
                    }
                    
                    if (finalParsed.toUpperCase() === correctWord) {
                        spokenWord = correctWord;
                    }
                    
                    if (spokenWord.length === 0) {
                        micStatus.textContent = "Tap the microphone and spell the word!";
                        return;
                    }
                    
                    if (spokenWord.toUpperCase() === correctWord) {
                        for (let i = 0; i < correctWord.length; i++) {
                            const blank = $(`#blank-${i}`);
                            if (blank) {
                                blank.textContent = correctWord[i];
                                blank.classList.remove('empty');
                                blank.classList.add('filled');
                            }
                        }
                        handleClassicAnswer(spokenWord, micBtn, q);
                    } else {
                        playSoundTone(220, 0.3, 'sawtooth');
                        setPromptText(`Oops! That's not correct. Try spelling "${correctWord}" again! 🎤`);
                        
                        // Reset blanks to empty
                        for (let i = 0; i < correctWord.length; i++) {
                            const blank = $(`#blank-${i}`);
                            if (blank) {
                                blank.textContent = '_';
                                blank.classList.remove('filled');
                                blank.classList.add('empty');
                            }
                        }
                    }
                },
                (err) => {
                    micBtn.classList.remove('listening');
                    micBtn.innerHTML = '🎤 Start Speaking';
                    if (err === 'not-allowed') {
                        micStatus.textContent = 'Microphone access denied. Please allow mic in settings!';
                    } else {
                        micStatus.textContent = `Microphone timed out. Tap again to try!`;
                    }
                }
            );
        });
        
        setPromptText(q.audioText || "Spell the word out loud!");
        return;
    }

    // Number Speak game layout
    if (state.currentClassicGame && state.currentClassicGame.id === 'number-speak') {
        prompt.innerHTML = `
            <div class="speak-repeat-wrap" style="text-align:center;">
                <button type="button" class="action-btn primary repeat-btn tap-3d" id="repeat-voice-btn" style="font-size:1.4rem; padding:15px 30px; border-radius:50px; background:#FFB400; border:none; color:white; font-weight:bold; box-shadow:0 6px 0 #b37e00; margin:10px auto;">
                    🔊 Play / Repeat Number
                </button>
            </div>
            <p class="subtitle-text" style="margin-top:12px; margin-bottom:0;">Tap the button or Aiko to hear the number!</p>
        `;
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-btn-3d tap-3d';
            if (opt.type === 'image') {
                btn.innerHTML = `<img src="${opt.value}" alt="number" draggable="false">`;
            } else {
                btn.innerHTML = `<span class="num-badge">${opt.value}</span>`;
            }
            btn.addEventListener('click', () => handleClassicAnswer(opt.answer, btn, q));
            optionsArea.appendChild(btn);
        });

        setPromptText(q.audioText, "Listen carefully to the secret number! Click the repeat button or me to hear it again! 🔊");

        // Automatically speak the number on load if sound is enabled
        setTimeout(() => {
            speakText(q.audioText, null, "Listen carefully to the secret number! Click the repeat button or me to hear it again! 🔊");
        }, 100);

        $('#repeat-voice-btn').addEventListener('click', () => {
            speakText(q.audioText, null, "Listen carefully to the secret number! Click the repeat button or me to hear it again! 🔊");
        });
        return;
    }

    // Render classic question prompt formats
    if (q.promptType === 'emoji-row') {
        prompt.innerHTML = `<div class="emoji-count">${q.prompt}</div>`;
    } else if (q.promptType === 'big-emoji') {
        prompt.innerHTML = `<div class="big-picture">${q.prompt}</div>`;
    } else if (q.promptType === 'math-big') {
        prompt.innerHTML = `<div class="math-prompt">${q.prompt}</div>`;
    } else if (q.promptType === 'shape-big') {
        prompt.innerHTML = `<div class="shape-prompt">${q.shape || q.prompt}</div>`;
    } else if (q.promptType === 'compare') {
        prompt.innerHTML = `
            <div class="compare-row">
                <div class="compare-box">${q.left.text}</div>
                <span class="vs">VS</span>
                <div class="compare-box">${q.right.text}</div>
            </div>
        `;
    } else if (q.promptType === 'odd-grid') {
        prompt.innerHTML = `<div class="question-text">👀 Look closely... Find the different one!</div>`;
    }

    if (q.sublabel) {
        prompt.innerHTML += `<p class="subtitle-text" style="margin-top:12px; margin-bottom:0;">${q.sublabel}</p>`;
    }

    // Build classic options grid
    if (q.promptType === 'compare') {
        optionsArea.innerHTML = `
            <button type="button" class="option-btn-3d tap-3d" data-choice="left">← Left</button>
            <button type="button" class="option-btn-3d tap-3d" data-choice="right">Right →</button>
        `;
        optionsArea.querySelectorAll('.option-btn-3d').forEach(b => {
            b.addEventListener('click', () => handleClassicAnswer(b.dataset.choice, b, q));
        });
        return;
    }

    if (q.promptType === 'odd-grid') {
        optionsArea.className = 'odd-grid-choices';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-btn-3d emoji-option tap-3d';
            btn.textContent = opt.value;
            btn.addEventListener('click', () => handleClassicAnswer(opt.answer, btn, q));
            optionsArea.appendChild(btn);
        });
        return;
    }

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn-3d tap-3d';

        if (opt.type === 'image') {
            btn.innerHTML = `<img src="${opt.value}" alt="number" draggable="false">`;
        } else if (opt.type === 'number-badge') {
            btn.innerHTML = `<span class="num-badge">${opt.value}</span>`;
        } else if (opt.type === 'color-chip') {
            btn.innerHTML = `<span class="color-dot" style="background:${opt.colorName}"></span><span style="margin-left:8px;">${opt.value}</span>`;
            btn.classList.add('color-option');
        } else {
            btn.textContent = opt.value;
        }

        btn.addEventListener('click', () => handleClassicAnswer(opt.answer, btn, q));
        optionsArea.appendChild(btn);
    });

    let phraseText = "How many do you count?";
    if (state.currentClassicGame.id === 'picture-spell') phraseText = "How do you spell this picture?";
    if (state.currentClassicGame.id === 'color-fun') phraseText = "What color is this?";
    if (state.currentClassicGame.id === 'shape-match') phraseText = "Match this shape!";
    if (state.currentClassicGame.id === 'rhyme-time') phraseText = `What rhymes with ${q.correct}?`;
    if (q.sublabel) phraseText = q.sublabel;

    setPromptText(phraseText);
}

function handleClassicAnswer(selected, btn, q) {
    if (state.answered) return;
    state.answered = true;

    const isCorrect = selected === q.correct;

    document.querySelectorAll('.option-btn-3d').forEach(b => {
        b.disabled = true;
        b.classList.add('locked');
        if (b.textContent === q.correct || b.dataset.choice === q.correct) b.classList.add('correct');
    });

    if (isCorrect) {
        state.correctCount++;
        btn.classList.add('correct');
        triggerScreenFlash(true);
        spawnStars();
        spawnConfetti();
        playSoundTone(523, 0.12);
        setTimeout(() => playSoundTone(659, 0.15), 100);
        setPromptText(`Wonderful, ${state.childName}! That is correct!`);
        revealNextBtn();
        autoAdvanceQuestion();
    } else {
        btn.classList.add('incorrect');
        triggerScreenFlash(false);
        playSoundTone(220, 0.28, 'sawtooth');
        setPromptText(`Nice try ${state.childName}, but that is not correct. The answer is ${q.correct}.`);
        revealNextBtn();
        autoAdvanceQuestion();
    }
}

// ----------------------------------------------------------------------------
// RESULTS SCREEN PRESENTATION
// ----------------------------------------------------------------------------
function renderResultsUI() {
    const total = state.questions.length;
    const wrong = total - state.correctCount;
    const ratio = total > 0 ? state.correctCount / total : 0;

    const head = $('#results-headline');
    const text = $('#results-summary-text');
    const medal = $('#results-medal-container');

    $('#res-correct-count').textContent = state.correctCount;
    $('#res-wrong-count').textContent = wrong;

    let emoji = "⭐";
    let title = "";
    let msg = "";

    if (ratio === 1.0) {
        emoji = "🥇";
        title = `Perfect, ${state.childName}!`;
        msg = "Fantastic work! You are a brilliant superstar explorer! 🌟";
        playSoundTone(523, 0.15);
        setTimeout(() => playSoundTone(659, 0.15), 120);
        setTimeout(() => playSoundTone(784, 0.35), 240);
    } else if (ratio >= 0.8) {
        emoji = "🥈";
        title = `Great Job, ${state.childName}!`;
        msg = "Excellent! You got almost all correct! You win the silver badge! 🚀";
    } else if (ratio >= 0.6) {
        emoji = "🥉";
        title = `Super Effort, ${state.childName}!`;
        msg = "Well done! Keep practicing to win the gold medal next! 🎲";
    } else {
        emoji = "💫";
        title = `Good Try, ${state.childName}!`;
        msg = "You completed the game! Practice more and you will improve next time! 👍";
    }

    medal.innerHTML = `<span class="medal-emoji">${emoji}</span>`;
    head.textContent = title;
    text.textContent = msg;

    setPromptText(`${title}. ${msg}`);
    spawnConfetti();
}

// ----------------------------------------------------------------------------
// BOOTSTRAPPER AND ATTACHED ACTIONS
// ----------------------------------------------------------------------------
function initializeApp() {
    // Portal selectors
    $('#select-small-portal-btn').addEventListener('click', () => {
        state.portalMode = 'small';
        if (state.difficulty === 'medium') {
            state.difficulty = 'middle';
        }
        navigateToScreen('small-home');
    });

    $('#select-big-portal-btn').addEventListener('click', () => {
        state.portalMode = 'big';
        if (state.difficulty === 'middle') {
            state.difficulty = 'medium';
        }
        navigateToScreen('big-home');
    });

    // Big children games select dashboard grid
    $('#big-select-gk').addEventListener('click', () => {
        state.gameMode = 'gk';
        navigateToScreen('setup');
    });

    $('#big-select-abacus-vis').addEventListener('click', () => {
        state.gameMode = 'abacus-vis';
        navigateToScreen('setup');
    });

    $('#big-select-abacus-arith').addEventListener('click', () => {
        state.gameMode = 'abacus-arith';
        navigateToScreen('setup');
    });

    // Aiko clicked triggers voice output (on-demand voice narration)
    $('#aiko-container').addEventListener('click', () => {
        if (state.currentPromptSpeechText) {
            speakText(state.currentPromptSpeechText, null, state.currentPromptBubbleText);
        }
    });

    // Small children level selectors
    $('#classic-level-buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lvl]');
        if (btn) {
            playSoundTone(500, 0.05);
            state.difficulty = btn.dataset.lvl;
            renderSmallHomeUI();
        }
    });

    // Small children game block click triggers
    $('#classic-games-grid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-game]');
        if (card) {
            playSoundTone(600, 0.08);
            const gameId = card.dataset.game;
            state.currentClassicGame = GAMES.find(g => g.id === gameId);
            navigateToScreen('game');
        }
    });

    // Big children setup controls
    $('#class-buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-class]');
        if (btn) {
            playSoundTone(500, 0.05);
            state.classDivision = btn.dataset.class;
            safeStorage.setItem('aiko_class', state.classDivision);
            renderSetupUI();
        }
    });

    $('#setup-level-buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lvl]');
        if (btn) {
            playSoundTone(500, 0.05);
            state.difficulty = btn.dataset.lvl;
            safeStorage.setItem('aiko_diff', state.difficulty);
            renderSetupUI();
        }
    });

    $('#timer-mode-on-btn').addEventListener('click', () => {
        playSoundTone(500, 0.05);
        state.timerEnabled = true;
        safeStorage.setItem('aiko_timer', 'true');
        renderSetupUI();
    });

    $('#timer-mode-off-btn').addEventListener('click', () => {
        playSoundTone(500, 0.05);
        state.timerEnabled = false;
        safeStorage.setItem('aiko_timer', 'false');
        renderSetupUI();
    });

    // Game play action binds
    $('#start-quest-btn').addEventListener('click', () => {
        playSoundTone(700, 0.15);
        navigateToScreen('game');
    });

    $('#clear-canvases-btn').addEventListener('click', clearAbacusCanvases);
    $('#check-answer-btn').addEventListener('click', handleAbacusSubmit);

    $('#next-question-btn').addEventListener('click', () => {
        if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
        const isLast = state.questionIndex >= state.questions.length - 1;
        if (isLast) {
            navigateToScreen('results');
        } else {
            state.questionIndex++;
            loadCurrentQuestion();
        }
    });

    // Return navigational routes
    $('#game-back-btn').addEventListener('click', () => {
        clearInterval(state.timer);
        navigateToScreen(state.portalMode === 'big' ? 'setup' : 'small-home');
    });

    $('#setup-back-btn').addEventListener('click', () => navigateToScreen('big-home'));
    $('#big-home-back-btn').addEventListener('click', () => navigateToScreen('portal'));
    $('#small-home-back-btn').addEventListener('click', () => navigateToScreen('portal'));
    
    $('#home-nav-btn').addEventListener('click', () => {
        clearInterval(state.timer);
        navigateToScreen('portal');
    });
    
    $('#go-home-btn').addEventListener('click', () => navigateToScreen('portal'));
    $('#play-again-btn').addEventListener('click', () => navigateToScreen('game'));

    // Sound speech toggle
    $('#sound-toggle').addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        const btn = $('#sound-toggle');
        if (state.soundEnabled) {
            btn.textContent = '🔊 Voice On';
            btn.style.background = 'rgba(108, 92, 231, 0.1)';
            speakText("Voice enabled! Tap Aiko to hear me speak!");
        } else {
            btn.textContent = '🔇 Voice Off';
            btn.style.background = 'rgba(255, 255, 255, 0.6)';
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            const mouth = $('#aiko-mouth');
            if (mouth) mouth.classList.remove('talking');
        }
    });

    $('#logo-btn').addEventListener('click', () => {
        clearInterval(state.timer);
        navigateToScreen('portal');
    });

    // Name Confirmation button
    $('#confirm-name-btn').addEventListener('click', () => {
        const nameVal = $('#name-text-input').value.trim();
        if (nameVal.length > 0) {
            state.childName = nameVal;
            safeStorage.setItem('aiko_child_name', state.childName);
            $('#name-modal-popup').classList.add('hidden');
            navigateToScreen('portal');
        } else {
            setPromptText("Please input or say your name first explorer!");
        }
    });

    // Init speech hooks
    initNameSpeechRecognition();
    checkNameState();
}

window.addEventListener('DOMContentLoaded', initializeApp);
