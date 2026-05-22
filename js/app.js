const state = {
    currentGame: null,
    level: localStorage.getItem('funLearnLevel') || 'easy',
    questions: [],
    index: 0,
    correct: 0,
    answered: false,
    roundId: 0,
    isBusy: false,
    advanceTimer: null,
    gameResults: JSON.parse(localStorage.getItem('funLearnResults') || '{}')
};

function resultKey(gameId) {
    return `${gameId}_${state.level}`;
}

const $ = (sel) => document.querySelector(sel);

const homeScreen = $('#home-screen');
const gameScreen = $('#game-screen');
const resultsScreen = $('#results-screen');
const gameGrid = $('#game-grid');
const progressStrip = $('#progress-strip');
const progressBadges = $('#progress-badges');
const allDoneBanner = $('#all-done-banner');
const wrongFlash = $('#wrong-flash');
const correctFlash = $('#correct-flash');
const appEl = $('#app');

function clearAdvanceTimer() {
    if (state.advanceTimer) {
        clearTimeout(state.advanceTimer);
        state.advanceTimer = null;
    }
}

function scrollAppTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    appEl?.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function showScreen(name) {
    clearAdvanceTimer();
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
    });
    const map = { home: homeScreen, game: gameScreen, results: resultsScreen };
    const screen = map[name];
    if (screen) {
        screen.classList.add('active');
        screen.setAttribute('aria-hidden', 'false');
    }
    document.body.dataset.screen = name;
    requestAnimationFrame(scrollAppTop);
}

function saveResults() {
    localStorage.setItem('funLearnResults', JSON.stringify(state.gameResults));
}

function triggerWrongFlash() {
    wrongFlash.classList.remove('active');
    void wrongFlash.offsetWidth;
    wrongFlash.classList.add('active');
    $('#quiz-area')?.classList.add('card-wiggle');
    setTimeout(() => {
        wrongFlash.classList.remove('active');
        $('#quiz-area')?.classList.remove('card-wiggle');
    }, 900);
}

function triggerCorrectFlash() {
    correctFlash.classList.remove('active');
    void correctFlash.offsetWidth;
    correctFlash.classList.add('active');
    setTimeout(() => correctFlash.classList.remove('active'), 500);
}

function spawnStars() {
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('span');
        s.className = 'float-star';
        s.textContent = '⭐';
        s.style.left = `${15 + Math.random() * 70}%`;
        s.style.top = `${25 + Math.random() * 35}%`;
        s.style.animationDelay = `${i * 0.06}s`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

function renderLevelPicker() {
    const container = $('#level-buttons');
    if (!container) return;

    container.innerHTML = LEVEL_ORDER.map(id => {
        const L = LEVELS[id];
        const active = state.level === id ? 'active' : '';
        return `
            <button type="button" class="level-btn ${active}" data-level="${id}" style="--lvl-color:${L.color}" aria-pressed="${active ? 'true' : 'false'}">
                <span class="lvl-emoji">${L.emoji}</span>
                <span class="lvl-name">${L.label}</span>
            </button>
        `;
    }).join('');

    const hint = $('#level-hint');
    if (hint) hint.textContent = LEVELS[state.level].hint;
}

function selectLevel(id) {
    if (!LEVELS[id] || state.level === id || state.isBusy) return;
    state.level = id;
    setLevel(id);
    localStorage.setItem('funLearnLevel', id);
    renderLevelPicker();
    renderHome();
}

function renderHome() {
    setLevel(state.level);
    renderLevelPicker();
    state.isBusy = false;

    gameGrid.innerHTML = GAMES.map(g => {
        const played = state.gameResults[resultKey(g.id)];
        const medal = played ? getMedal(played.correct, played.total).emoji : '';
        const tierNote = getGameLevelLabel(g.id, state.level);
        return `
            <button class="game-card tap-btn" type="button" data-game="${g.id}" style="--card-color:${g.color}">
                <span class="card-emoji">${g.emoji}</span>
                <span class="card-title">${g.title}</span>
                <span class="card-desc">${g.description}</span>
                <span class="card-tier">${tierNote}</span>
                ${medal ? `<span class="card-medal">${medal}</span>` : ''}
            </button>
        `;
    }).join('');

    updateProgressStrip();
}

function updateProgressStrip() {
    const played = GAMES.filter(g => state.gameResults[resultKey(g.id)]);
    if (played.length === 0) {
        progressStrip.classList.add('hidden');
        allDoneBanner.classList.add('hidden');
        return;
    }

    progressStrip.classList.remove('hidden');
    const lvlLabel = LEVELS[state.level].label;
    progressBadges.innerHTML = GAMES.map(g => {
        const r = state.gameResults[resultKey(g.id)];
        if (!r) return `<span class="badge empty" title="${g.title} (${lvlLabel})">○</span>`;
        const m = getMedal(r.correct, r.total);
        return `<span class="badge ${m.class}" title="${g.title} ${lvlLabel}: ${r.correct}/${r.total}">${m.emoji}</span>`;
    }).join('');

    const allAtLevel = GAMES.every(g => state.gameResults[resultKey(g.id)]);
    allDoneBanner.classList.toggle('hidden', !allAtLevel);
}

function startGame(gameId) {
    if (state.isBusy) return;

    const game = GAMES.find(g => g.id === gameId);
    if (!game) return;

    state.isBusy = true;
    setLevel(state.level);

    const builder = ROUND_BUILDERS[game.type];
    newRoundSeed();
    state.roundId = Date.now();
    state.currentGame = game;

    try {
        state.questions = builder(game) || [];
    } catch (e) {
        console.error(e);
        state.questions = [];
    }

    if (!state.questions.length) {
        alert('Oops! Could not load questions. Please try again.');
        state.isBusy = false;
        return;
    }

    state.index = 0;
    state.correct = 0;
    state.answered = false;

    const L = LEVELS[state.level];
    $('#game-title').textContent = `${game.emoji} ${game.title}`;
    const badge = $('#level-badge');
    if (badge) {
        badge.textContent = `${L.emoji} ${L.label}`;
        badge.style.background = L.color;
    }

    $('#feedback').classList.add('hidden');
    $('#next-btn').classList.add('hidden');
    $('#quiz-area').classList.remove('card-wiggle', 'is-loading');

    showScreen('game');
    renderQuestion();
    state.isBusy = false;
}

function renderQuestion() {
    const q = state.questions[state.index];
    if (!q) return;

    const total = state.questions.length;
    const pct = (state.index / total) * 100;

    $('#q-progress').textContent = `${state.index + 1} / ${total}`;
    $('#progress-fill').style.width = `${pct}%`;

    const promptArea = $('#prompt-area');
    const optionsArea = $('#options-area');
    optionsArea.innerHTML = '';
    state.answered = false;
    $('#next-btn').classList.add('hidden');

    promptArea.classList.remove('pop-in');
    void promptArea.offsetWidth;
    promptArea.classList.add('pop-in');

    let promptHtml = '';
    if (q.promptType === 'emoji-row') {
        promptHtml = `<div class="emoji-count">${q.prompt}</div>`;
    } else if (q.promptType === 'big-emoji') {
        promptHtml = `<div class="big-picture">${q.prompt}</div>`;
    } else if (q.promptType === 'math-big') {
        promptHtml = `<div class="math-prompt">${q.prompt}</div>`;
    } else if (q.promptType === 'shape-big') {
        promptHtml = `<div class="shape-prompt">${q.prompt}</div>`;
    } else if (q.promptType === 'compare') {
        promptHtml = `
            <div class="compare-row">
                <div class="compare-box">${q.left.text}</div>
                <span class="vs">VS</span>
                <div class="compare-box">${q.right.text}</div>
            </div>
        `;
    } else if (q.promptType === 'odd-grid') {
        promptHtml = `<div class="odd-hint">👀 Look closely...</div>`;
    }

    if (q.sublabel) {
        promptHtml += `<p class="sublabel">${q.sublabel}</p>`;
    }
    promptArea.innerHTML = promptHtml;

    const bindOption = (btn, answer) => {
        btn.dataset.answer = answer;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleAnswer(btn, answer);
        });
    };

    if (q.promptType === 'compare') {
        const wrap = document.createElement('div');
        wrap.className = 'compare-btns';
        q.options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-btn compare-choice tap-btn';
            btn.textContent = opt.label;
            bindOption(btn, opt.answer);
            wrap.appendChild(btn);
        });
        optionsArea.className = 'options-area';
        optionsArea.appendChild(wrap);
        return;
    }

    if (q.promptType === 'odd-one-out') {
        optionsArea.className = 'options-area odd-options';
        q.options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'option-btn emoji-option tap-btn';
            btn.textContent = opt.value;
            bindOption(btn, opt.answer);
            optionsArea.appendChild(btn);
        });
        return;
    }

    const gridClass = q.options.length <= 3 ? 'opts-3' : 'opts-4';
    optionsArea.className = `options-area ${gridClass}`;

    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn tap-btn';

        if (opt.type === 'image') {
            btn.innerHTML = `<img src="${opt.value}" alt="number option" draggable="false">`;
        } else if (opt.type === 'number-badge') {
            btn.innerHTML = `<span class="num-badge">${opt.value}</span>`;
            btn.classList.add('number-badge-btn');
        } else if (opt.type === 'color-chip') {
            btn.innerHTML = `<span class="color-dot" style="background:${opt.colorName}"></span><span>${opt.value}</span>`;
            btn.classList.add('color-option');
        } else if (opt.type === 'emoji-btn') {
            btn.textContent = opt.value;
            btn.classList.add('emoji-option');
        } else {
            btn.textContent = opt.value;
            btn.classList.add('text-option');
        }

        bindOption(btn, opt.answer);
        optionsArea.appendChild(btn);
    });
}

function handleAnswer(btn, answer) {
    if (state.answered || state.isBusy) return;
    state.answered = true;

    const q = state.questions[state.index];
    const isCorrect = answer === q.correct;

    if (isCorrect) {
        state.correct++;
        btn.classList.add('correct');
        showFeedback(randomCorrectMessage(), 'good');
        triggerCorrectFlash();
        spawnStars();
        playTone(523, 0.1);
    } else {
        btn.classList.add('wrong');
        document.querySelectorAll('#options-area .option-btn').forEach(b => {
            if (b.dataset.answer === q.correct) b.classList.add('correct');
        });
        showFeedback(randomWrongMessage(), 'oops');
        triggerWrongFlash();
        playTone(200, 0.15, 'sawtooth');
    }

    document.querySelectorAll('#options-area .option-btn').forEach(b => {
        b.disabled = true;
        b.classList.add('is-locked');
    });

    const isLast = state.index >= state.questions.length - 1;
    const nextBtn = $('#next-btn');

    if (isLast) {
        nextBtn.textContent = 'See Results 🏆';
        nextBtn.classList.remove('hidden');
        clearAdvanceTimer();
    } else {
        clearAdvanceTimer();
        state.advanceTimer = setTimeout(() => {
            state.index++;
            renderQuestion();
        }, isCorrect ? 750 : 1200);
    }
}

function showFeedback(text, type) {
    const fb = $('#feedback');
    fb.textContent = text;
    fb.className = `feedback ${type}`;
    fb.classList.remove('hidden');
    clearTimeout(fb._hideTimer);
    fb._hideTimer = setTimeout(() => fb.classList.add('hidden'), 1100);
}

function showResults() {
    if (state.isBusy) return;
    state.isBusy = true;
    clearAdvanceTimer();

    const total = state.questions.length;
    const wrong = total - state.correct;
    const medal = getMedal(state.correct, total);

    state.gameResults[resultKey(state.currentGame.id)] = {
        correct: state.correct,
        total,
        medal: medal.class,
        level: state.level,
        at: Date.now(),
        roundId: state.roundId
    };
    saveResults();

    const L = LEVELS[state.level];
    $('#medal-display').innerHTML = `<span class="medal-emoji bounce-medal">${medal.emoji}</span>`;
    $('#medal-display').className = `medal-display ${medal.class}`;
    $('#results-title').textContent = medal.label;
    $('#results-message').textContent =
        state.correct === total
            ? `Perfect on ${L.label} level! You are a super star! 🌟`
            : `You got ${state.correct} out of ${total} on ${L.label}. Try Again for new questions!`;
    $('#correct-count').textContent = state.correct;
    $('#wrong-count').textContent = wrong;
    $('#progress-fill').style.width = '100%';

    showScreen('results');
    launchConfetti();
    if (state.correct === total) triggerCorrectFlash();
    state.isBusy = false;
}

function launchConfetti() {
    const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#FB923C', '#34D399'];
    for (let i = 0; i < 20; i++) {
        const el = document.createElement('span');
        el.className = 'confetti';
        el.style.left = `${Math.random() * 100}%`;
        el.style.background = colors[i % colors.length];
        el.style.animationDelay = `${Math.random() * 0.4}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }
}

function playTone(freq, duration, type = 'sine') {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + duration);
    } catch (_) { /* optional */ }
}

function goHome() {
    clearAdvanceTimer();
    state.isBusy = false;
    state.answered = true;
    showScreen('home');
    renderHome();
}

function initApp() {
    $('#level-buttons')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-level]');
        if (btn?.dataset.level) selectLevel(btn.dataset.level);
    });

    gameGrid?.addEventListener('click', (e) => {
        const card = e.target.closest('[data-game]');
        if (card?.dataset.game) startGame(card.dataset.game);
    });

    $('#back-btn')?.addEventListener('click', goHome);
    $('#home-btn')?.addEventListener('click', goHome);

    $('#play-again-btn')?.addEventListener('click', () => {
        if (state.currentGame) startGame(state.currentGame.id);
    });

    $('#next-btn')?.addEventListener('click', () => {
        if (!state.answered) return;
        showResults();
    });

    $('#logo-btn')?.addEventListener('click', () => {
        if (document.body.dataset.screen !== 'home') goHome();
    });

    setLevel(state.level);
    renderHome();
}

initApp();
