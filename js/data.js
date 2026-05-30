const NUMBER_IMAGES = {
    1: 'one.jpg', 2: 'two.jpg', 3: 'three.jpg', 4: 'four.jpg', 5: 'five.jpg',
    6: 'six.jpg', 7: 'seven.jpg', 8: 'eight.jpg', 9: '9.jpg', 10: '10.jpg',
    11: 'eleven.jpg', 15: 'fiveteen.jpg', 16: 'sixteen.jpg', 20: 'twenty.jpg'
};

const LEVELS = {
    easy: {
        id: 'easy',
        label: 'Easy',
        emoji: '🌱',
        color: '#00b894',
        hint: 'Numbers 0–20 · Short words · Simple colors & shapes',
        min: 0,
        max: 20,
        countMin: 1,
        countMax: 10,
        addMax: 10,
        questionsEasy: 8
    },
    middle: {
        id: 'middle',
        label: 'Middle',
        emoji: '⭐',
        color: '#fdcb6e',
        hint: 'Numbers 21–50 · Medium words · Trickier odd-one-out',
        min: 21,
        max: 50,
        countMin: 11,
        countMax: 50,
        addMax: 50,
        questionsEasy: 9
    },
    hard: {
        id: 'hard',
        label: 'Hard',
        emoji: '🔥',
        color: '#e17055',
        hint: 'Numbers 51–100 · Long words · Hard rhymes & colors',
        min: 51,
        max: 100,
        countMin: 51,
        countMax: 100,
        addMax: 100,
        questionsEasy: 10
    }
};

const LEVEL_ORDER = ['easy', 'middle', 'hard'];

const NUMBER_WORDS_STATIC = {
    0: 'ZERO', 1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
    6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN',
    11: 'ELEVEN', 12: 'TWELVE', 13: 'THIRTEEN', 14: 'FOURTEEN', 15: 'FIFTEEN',
    16: 'SIXTEEN', 17: 'SEVENTEEN', 18: 'EIGHTEEN', 19: 'NINETEEN', 20: 'TWENTY'
};

function numberToWord(n) {
    if (NUMBER_WORDS_STATIC[n]) return NUMBER_WORDS_STATIC[n];
    if (n < 100) {
        const tens = Math.floor(n / 10) * 10;
        const ones = n % 10;
        const tensWord = { 20: 'TWENTY', 30: 'THIRTY', 40: 'FORTY', 50: 'FIFTY',
            60: 'SIXTY', 70: 'SEVENTY', 80: 'EIGHTY', 90: 'NINETY' }[tens];
        if (!ones) return tensWord;
        return `${tensWord}-${numberToWord(ones)}`;
    }
    return 'ONE HUNDRED';
}

function getNumberWord(n) {
    return numberToWord(n);
}

const AVAILABLE_NUMBERS = Object.keys(NUMBER_IMAGES).map(Number);

const EMOJI_FOR_COUNT = [
    '🐶', '🐱', '🐻', '🦊', '🐸', '🐰', '🐝', '🦋', '🐞', '🐢',
    '🚗', '🚌', '🚲', '✈️', '🚀', '🛶', '🎈', '🎁', '🎨', '⚽',
    '🍎', '🍌', '🍇', '🥭', '🍕', '🍰', '🧁', '🍭', '🌸', '🌻',
    '⭐', '🌙', '☀️', '🌈', '❤️', '💎', '🎵', '📚', '✏️', '🧸'
];

const QUESTIONS_PER_ROUND = 10;

const GAMES = [
    { id: 'count-pick', title: 'Count & Pick', emoji: '🔢', color: '#FF6B9D',
      description: 'Count pictures, pick the number!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'count-images' },
    { id: 'number-words', title: 'Number Words', emoji: '📝', color: '#4ECDC4',
      description: 'Count and tap the right word!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'number-words' },
    { id: 'picture-spell', title: 'Picture Spelling', emoji: '🖼️', color: '#FFE66D',
      description: 'Pick the correct spelling!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'picture-spell' },
    { id: 'color-fun', title: 'Color Fun', emoji: '🎨', color: '#A78BFA',
      description: 'What color is it?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'color-fun' },
    { id: 'bigger-smaller', title: 'More or Less', emoji: '⚖️', color: '#FB923C',
      description: 'Which side has MORE?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'bigger-smaller' },
    { id: 'add-fun', title: 'Add It Up', emoji: '➕', color: '#F472B6',
      description: 'Add the numbers together!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'add-fun' },
    { id: 'before-after', title: 'Before & After', emoji: '🔜', color: '#34D399',
      description: 'What number comes next?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'before-after' },
    { id: 'odd-one-out', title: 'Odd One Out', emoji: '🔍', color: '#60A5FA',
      description: 'Find the one that is different!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'odd-one-out' },
    { id: 'shape-match', title: 'Shape Match', emoji: '⬛', color: '#FBBF24',
      description: 'Match the shape name!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'shape-match' },
    { id: 'rhyme-time', title: 'Rhyme Time', emoji: '🎵', color: '#C084FC',
      description: 'Which word rhymes?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'rhyme-time' },
    { id: 'number-speak', title: 'Number Speak', emoji: '🔊', color: '#FFB400',
      description: 'Listen to the number and choose the correct one!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'number-speak' },
    { id: 'speak-spell', title: 'Speak & Spell', emoji: '🗣️', color: '#10B981',
      description: 'See the picture, say the spelling out loud!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'speak-spell' }
];

const SPELL_QUESTIONS = [
    { levels: ['easy'], picture: '🐱', word: 'cat', wrong: ['kat', 'cot', 'cut', 'car'] },
    { levels: ['easy'], picture: '🐕', word: 'dog', wrong: ['dig', 'dag', 'dug', 'dot'] },
    { levels: ['easy'], picture: '🌞', word: 'sun', wrong: ['son', 'san', 'sin', 'fun'] },
    { levels: ['easy'], picture: '🐝', word: 'bee', wrong: ['bea', 'be', 'bie', 'see'] },
    { levels: ['easy'], picture: '🚗', word: 'car', wrong: ['kar', 'carr', 'cor', 'bar'] },
    { levels: ['easy'], picture: '🧊', word: 'ice', wrong: ['ise', 'ace', 'nice', 'rice'] },
    { levels: ['easy'], picture: '🐟', word: 'fish', wrong: ['fesh', 'fsh', 'dish', 'wish'] },
    { levels: ['easy'], picture: '📚', word: 'book', wrong: ['bok', 'boock', 'buk', 'look'] },
    { levels: ['middle'], picture: '🍎', word: 'apple', wrong: ['aple', 'appel', 'aplle', 'ample'] },
    { levels: ['middle'], picture: '🏠', word: 'house', wrong: ['hous', 'hoose', 'hause', 'horse'] },
    { levels: ['middle'], picture: '🌳', word: 'tree', wrong: ['trea', 'tre', 'trie', 'free'] },
    { levels: ['middle'], picture: '🎂', word: 'cake', wrong: ['cak', 'caek', 'kake', 'take'] },
    { levels: ['middle'], picture: '🌙', word: 'moon', wrong: ['mune', 'mon', 'mooon', 'noon'] },
    { levels: ['middle'], picture: '🦁', word: 'lion', wrong: ['lien', 'loin', 'line', 'lean'] },
    { levels: ['middle'], picture: '🦆', word: 'duck', wrong: ['duk', 'dock', 'deck', 'luck'] },
    { levels: ['middle'], picture: '👑', word: 'king', wrong: ['kingg', 'keng', 'ring', 'sing'] },
    { levels: ['middle'], picture: '🌈', word: 'rainbow', wrong: ['rainbo', 'rainboww', 'ranbow', 'rain'] },
    { levels: ['hard'], picture: '🦋', word: 'butterfly', wrong: ['butterflys', 'buterfly', 'butterfli', 'dragonfly'] },
    { levels: ['hard'], picture: '🐘', word: 'elephant', wrong: ['elefant', 'elephent', 'elphant', 'elegant'] },
    { levels: ['hard'], picture: '🍌', word: 'banana', wrong: ['bananna', 'bannana', 'banan', 'bandana'] },
    { levels: ['hard'], picture: '🎈', word: 'balloon', wrong: ['baloon', 'ballon', 'baboon', 'bloom'] },
    { levels: ['hard'], picture: '🎃', word: 'pumpkin', wrong: ['pumpken', 'pumkin', 'bumpkin', 'pumping'] },
    { levels: ['hard'], picture: '🦒', word: 'giraffe', wrong: ['giraf', 'girafe', 'giraff', 'girafee'] },
    { levels: ['hard'], picture: '🐙', word: 'octopus', wrong: ['octupus', 'octopuss', 'octopas', 'octopos'] }
];

const COLOR_QUESTIONS = [
    { levels: ['easy'], item: '🍎', color: 'red', options: ['red', 'blue', 'green', 'yellow'] },
    { levels: ['easy'], item: '🌊', color: 'blue', options: ['blue', 'red', 'green', 'yellow'] },
    { levels: ['easy'], item: '🌿', color: 'green', options: ['green', 'red', 'blue', 'yellow'] },
    { levels: ['easy'], item: '🌞', color: 'yellow', options: ['yellow', 'blue', 'red', 'green'] },
    { levels: ['easy'], item: '⚽', color: 'white', options: ['white', 'black', 'red', 'blue'] },
    { levels: ['easy'], item: '🍌', color: 'yellow', options: ['yellow', 'green', 'red', 'blue'] },
    { levels: ['middle'], item: '🍇', color: 'purple', options: ['purple', 'green', 'red', 'blue'] },
    { levels: ['middle'], item: '🥕', color: 'orange', options: ['orange', 'pink', 'blue', 'green'] },
    { levels: ['middle'], item: '☁️', color: 'white', options: ['white', 'black', 'gray', 'blue'] },
    { levels: ['middle'], item: '🌸', color: 'pink', options: ['pink', 'red', 'blue', 'green'] },
    { levels: ['middle'], item: '🍫', color: 'brown', options: ['brown', 'white', 'black', 'yellow'] },
    { levels: ['middle'], item: '🍊', color: 'orange', options: ['orange', 'red', 'yellow', 'green'] },
    { levels: ['middle'], item: '🥦', color: 'green', options: ['green', 'brown', 'yellow', 'blue'] },
    { levels: ['hard'], item: '🌹', color: 'red', options: ['red', 'pink', 'purple', 'orange'] },
    { levels: ['hard'], item: '🐧', color: 'black', options: ['black', 'white', 'gray', 'blue'] },
    { levels: ['hard'], item: '🦆', color: 'yellow', options: ['yellow', 'orange', 'green', 'brown'] },
    { levels: ['hard'], item: '🫐', color: 'blue', options: ['blue', 'purple', 'black', 'green'] },
    { levels: ['hard'], item: '🖤', color: 'black', options: ['black', 'gray', 'brown', 'purple'] },
    { levels: ['hard'], item: '💜', color: 'purple', options: ['purple', 'pink', 'blue', 'red'] },
    { levels: ['hard'], item: '🩶', color: 'gray', options: ['gray', 'white', 'black', 'silver'] },
    { levels: ['hard'], item: '🧡', color: 'orange', options: ['orange', 'red', 'yellow', 'brown'] }
];

const SHAPE_QUESTIONS = [
    { levels: ['easy'], shape: '■', name: 'square', wrong: ['circle', 'triangle', 'star'] },
    { levels: ['easy'], shape: '●', name: 'circle', wrong: ['square', 'triangle', 'star'] },
    { levels: ['easy'], shape: '▲', name: 'triangle', wrong: ['square', 'circle', 'star'] },
    { levels: ['easy'], shape: '★', name: 'star', wrong: ['heart', 'circle', 'square'] },
    { levels: ['middle'], shape: '♥', name: 'heart', wrong: ['star', 'circle', 'square'] },
    { levels: ['middle'], shape: '▭', name: 'rectangle', wrong: ['square', 'triangle', 'oval'] },
    { levels: ['middle'], shape: '⬭', name: 'oval', wrong: ['circle', 'square', 'egg'] },
    { levels: ['middle'], shape: '◆', name: 'diamond', wrong: ['square', 'circle', 'triangle'] },
    { levels: ['hard'], shape: '⬟', name: 'pentagon', wrong: ['hexagon', 'octagon', 'square'] },
    { levels: ['hard'], shape: '⬡', name: 'hexagon', wrong: ['pentagon', 'octagon', 'circle'] },
    { levels: ['hard'], shape: '⯃', name: 'octagon', wrong: ['hexagon', 'pentagon', 'circle'] },
    { levels: ['hard'], shape: '⬢', name: 'heptagon', wrong: ['hexagon', 'pentagon', 'octagon'] }
];

const RHYME_QUESTIONS = [
    { levels: ['easy'], word: 'cat', picture: '🐱', rhyme: 'hat', wrong: ['dog', 'sun', 'cup'] },
    { levels: ['easy'], word: 'dog', picture: '🐕', rhyme: 'log', wrong: ['cat', 'bee', 'red'] },
    { levels: ['easy'], word: 'sun', picture: '🌞', rhyme: 'fun', wrong: ['moon', 'tree', 'car'] },
    { levels: ['easy'], word: 'bee', picture: '🐝', rhyme: 'see', wrong: ['tree', 'sea', 'tea'] },
    { levels: ['easy'], word: 'ball', picture: '⚽', rhyme: 'tall', wrong: ['small', 'wall', 'call'] },
    { levels: ['middle'], word: 'star', picture: '⭐', rhyme: 'car', wrong: ['moon', 'hat', 'far'] },
    { levels: ['middle'], word: 'cake', picture: '🎂', rhyme: 'lake', wrong: ['bake', 'take', 'make'] },
    { levels: ['middle'], word: 'fish', picture: '🐟', rhyme: 'dish', wrong: ['wish', 'swish', 'wash'] },
    { levels: ['middle'], word: 'book', picture: '📚', rhyme: 'look', wrong: ['cook', 'hook', 'took'] },
    { levels: ['middle'], word: 'moon', picture: '🌙', rhyme: 'spoon', wrong: ['soon', 'noon', 'tune'] },
    { levels: ['middle'], word: 'king', picture: '👑', rhyme: 'ring', wrong: ['sing', 'wing', 'bring'] },
    { levels: ['middle'], word: 'tree', picture: '🌳', rhyme: 'free', wrong: ['three', 'bee', 'sea'] },
    { levels: ['hard'], word: 'rain', picture: '🌧️', rhyme: 'train', wrong: ['pain', 'main', 'brain'] },
    { levels: ['hard'], word: 'light', picture: '💡', rhyme: 'night', wrong: ['bright', 'fight', 'kite'] },
    { levels: ['hard'], word: 'bear', picture: '🐻', rhyme: 'chair', wrong: ['hair', 'fair', 'stair'] },
    { levels: ['hard'], word: 'snow', picture: '❄️', rhyme: 'grow', wrong: ['flow', 'glow', 'slow'] },
    { levels: ['hard'], word: 'shop', picture: '🏪', rhyme: 'stop', wrong: ['hop', 'top', 'drop'] },
    { levels: ['hard'], word: 'think', picture: '🤔', rhyme: 'pink', wrong: ['link', 'sink', 'wink'] }
];

const ODD_ONE_SETS = [
    { levels: ['easy'], items: ['🐶', '🐱', '🐻', '🚗'], odd: '🚗' },
    { levels: ['easy'], items: ['🍎', '🍌', '🍇', '⚽'], odd: '⚽' },
    { levels: ['easy'], items: ['🚗', '🚌', '🚲', '🐸'], odd: '🐸' },
    { levels: ['easy'], items: ['⭐', '🌙', '☀️', '🐶'], odd: '🐶' },
    { levels: ['easy'], items: ['🔴', '🔵', '🟢', '🐱'], odd: '🐱' },
    { levels: ['easy'], items: ['1️⃣', '2️⃣', '3️⃣', '🐱'], odd: '🐱' },
    { levels: ['middle'], items: ['📚', '✏️', '📐', '🍕'], odd: '🍕' },
    { levels: ['middle'], items: ['🐝', '🦋', '🐞', '🚗'], odd: '🚗' },
    { levels: ['middle'], items: ['❤️', '💙', '💚', '🎈'], odd: '🎈' },
    { levels: ['middle'], items: ['🎈', '🎁', '🎨', '🐘'], odd: '🐘' },
    { levels: ['middle'], items: ['🐘', '🦁', '🐯', '🍎'], odd: '🍎' },
    { levels: ['middle'], items: ['🏠', '🏫', '🏥', '🦋'], odd: '🦋' },
    { levels: ['middle'], items: ['🌸', '🌻', '🌳', '🚗'], odd: '🚗' },
    { levels: ['middle'], items: ['🎵', '🎸', '🎹', '🍌'], odd: '🍌' },
    { levels: ['middle'], items: ['👕', '👖', '🧦', '🌞'], odd: '🌞' },
    { levels: ['hard'], items: ['🥕', '🥦', '🌽', '✈️'], odd: '✈️' },
    { levels: ['hard'], items: ['🐧', '🐧', '🐧', '🌈'], odd: '🌈' },
    { levels: ['hard'], items: ['🍰', '🧁', '🍭', '🚌'], odd: '🚌' },
    { levels: ['hard'], items: ['🐶', '🐶', '🐱', '🐶'], odd: '🐱' },
    { levels: ['hard'], items: ['🔺', '🔷', '🔶', '🐟'], odd: '🐟' },
    { levels: ['hard'], items: ['🌧️', '⛈️', '🌩️', '🏠'], odd: '🏠' },
    { levels: ['hard'], items: ['🎃', '🎄', '🎁', '🍉'], odd: '🍉' }
];

/** Per-game short label shown on home cards for current level */
const GAME_LEVEL_LABELS = {
    'count-pick': { easy: 'Count 1–10', middle: 'Count 11–50', hard: 'Count 51–100' },
    'number-words': { easy: 'Words 0–20', middle: 'Words 21–50', hard: 'Words 51–100' },
    'picture-spell': { easy: '3–4 letter words', middle: '5–7 letter words', hard: 'Long words' },
    'color-fun': { easy: 'Main colors', middle: 'More colors', hard: 'Tricky shades' },
    'bigger-smaller': { easy: 'Compare 0–20', middle: 'Compare 21–50', hard: 'Compare 51–100' },
    'add-fun': { easy: 'Add up to 10', middle: 'Add to 50', hard: 'Add to 100' },
    'before-after': { easy: '0–20 order', middle: '21–50 order', hard: '51–100 order' },
    'odd-one-out': { easy: 'Easy spot', middle: 'Look closer', hard: 'Super tricky' },
    'shape-match': { easy: '4 basic shapes', middle: 'More shapes', hard: 'Hard shapes' },
    'rhyme-time': { easy: 'Short rhymes', middle: 'Word rhymes', hard: 'Hard rhymes' },
    'speak-spell': { easy: '3–4 letter words', middle: '5–7 letter words', hard: 'Long words' }
};

function getGameLevelLabel(gameId, lvl) {
    return GAME_LEVEL_LABELS[gameId]?.[lvl] || LEVELS[lvl].label;
}

// Expose constants and helper to global scope for app.js
window.GAMES = GAMES;
window.LEVELS = LEVELS;
window.LEVEL_ORDER = LEVEL_ORDER;
window.GAME_LEVEL_LABELS = GAME_LEVEL_LABELS;
window.getGameLevelLabel = getGameLevelLabel;
window.NUMBER_WORDS_STATIC = NUMBER_WORDS_STATIC;
window.numberToWord = numberToWord;
window.getNumberWord = getNumberWord;
window.AVAILABLE_NUMBERS = AVAILABLE_NUMBERS;
window.EMOJI_FOR_COUNT = EMOJI_FOR_COUNT;
window.QUESTIONS_PER_ROUND = QUESTIONS_PER_ROUND;
window.SPELL_QUESTIONS = SPELL_QUESTIONS;
window.COLOR_QUESTIONS = COLOR_QUESTIONS;
window.SHAPE_QUESTIONS = SHAPE_QUESTIONS;
window.RHYME_QUESTIONS = RHYME_QUESTIONS;
window.ODD_ONE_SETS = ODD_ONE_SETS;
window.poolForLevel = poolForLevel;
window.levelSublabel = levelSublabel;
window.newRoundSeed = newRoundSeed;
window.shuffle = shuffle;
window.randInt = randInt;
window.randFrom = randFrom;
window.pickUniqueFromPool = pickUniqueFromPool;
window.numbersInLevel = numbersInLevel;
window.numberPoolAround = numberPoolAround;
window.pickOptions = pickOptions;
window.makeNumberOption = makeNumberOption;
window.mapNumberOptions = mapNumberOptions;
window.pickTextOptions = pickTextOptions;
window.repeatEmoji = repeatEmoji;
window.formatCountVisual = formatCountVisual;
window.setLevel = setLevel;
window.getLevel = getLevel;
window.randNumberInLevel = randNumberInLevel;
window.randCountInLevel = randCountInLevel;
window.generateCountItem = generateCountItem;
window.generateCompareItem = generateCompareItem;

function poolForLevel(pool, lvl) {
    const tagged = pool.filter(q => q.levels && q.levels.includes(lvl));
    if (tagged.length >= QUESTIONS_PER_ROUND) return tagged;
    if (lvl === 'middle') {
        const mid = pool.filter(q => q.levels && (q.levels.includes('middle') || q.levels.includes('easy')));
        if (mid.length >= QUESTIONS_PER_ROUND) return mid;
    }
    if (lvl === 'hard') {
        const hard = pool.filter(q => q.levels && (q.levels.includes('hard') || q.levels.includes('middle')));
        if (hard.length >= QUESTIONS_PER_ROUND) return hard;
    }
    return tagged.length ? tagged : pool.filter(q => q.levels && q.levels.includes('easy'));
}

function levelSublabel(gameType, lvl) {
    const labels = {
        'picture-spell': { easy: 'Easy spelling — short words!', middle: 'Medium spelling!', hard: 'Hard spelling — long words!' },
        'color-fun': { easy: 'Easy — pick the main color!', middle: 'Middle — more color names!', hard: 'Hard — similar colors!' },
        'odd-one-out': { easy: 'Easy — find the different one!', middle: 'Middle — look carefully!', hard: 'Hard — super tricky set!' },
        'shape-match': { easy: 'Easy shapes!', middle: 'Know these shapes?', hard: 'Hard shape names!' },
        'rhyme-time': { easy: 'Easy rhymes!', middle: 'Find the rhyme!', hard: 'Hard rhymes!' }
    };
    return labels[gameType]?.[lvl] || '';
}

let roundNonce = Date.now();

function newRoundSeed() {
    roundNonce = Date.now() + Math.floor(Math.random() * 1e9);
    return roundNonce;
}

function rand() {
    roundNonce = (roundNonce * 1103515245 + 12345) & 0x7fffffff;
    return roundNonce / 0x7fffffff;
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randInt(min, max) {
    return min + Math.floor(rand() * (max - min + 1));
}

function randFrom(arr) {
    return arr[Math.floor(rand() * arr.length)];
}

function pickUniqueFromPool(pool, n, keyFn) {
    const shuffled = shuffle(pool);
    const picked = [];
    const keys = new Set();
    for (const item of shuffled) {
        const key = keyFn ? keyFn(item) : JSON.stringify(item);
        if (keys.has(key)) continue;
        keys.add(key);
        picked.push(item);
        if (picked.length >= n) break;
    }
    while (picked.length < n && picked.length > 0) {
        const extra = randFrom(picked.slice(0, keys.size));
        picked.push(extra);
    }
    return picked;
}

function numbersInLevel(levelId) {
    const L = LEVELS[levelId];
    const arr = [];
    for (let i = L.min; i <= L.max; i++) arr.push(i);
    return arr;
}

function numberPoolAround(n, levelId) {
    const range = numbersInLevel(levelId);
    const spread = levelId === 'hard' ? 8 : levelId === 'middle' ? 5 : 3;
    const nearby = range.filter(x => x !== n && Math.abs(x - n) <= spread);
    return nearby.length >= 3 ? nearby : range.filter(x => x !== n);
}

function pickOptions(correct, pool, count = 4, levelId = 'easy') {
    const opts = new Set([correct]);
    const validPool = shuffle(pool.filter(x => x !== correct));
    for (const x of validPool) {
        if (opts.size >= count) break;
        opts.add(x);
    }
    const fallback = shuffle(numberPoolAround(correct, levelId));
    for (const x of fallback) {
        if (opts.size >= count) break;
        opts.add(x);
    }
    const range = numbersInLevel(levelId);
    let guard = 0;
    while (opts.size < count && guard++ < 30) {
        const candidates = range.filter(x => x !== correct && !opts.has(x));
        if (!candidates.length) break;
        opts.add(randFrom(candidates));
    }
    return shuffle([...opts]);
}

function makeNumberOption(n) {
    if (NUMBER_IMAGES[n]) {
        return { type: 'image', value: NUMBER_IMAGES[n], answer: String(n) };
    }
    return { type: 'number-badge', value: String(n), answer: String(n) };
}

function mapNumberOptions(nums) {
    return nums.map(n => makeNumberOption(n));
}

function pickTextOptions(correct, wrongPool, count = 4) {
    const opts = new Set([correct]);
    const pool = shuffle(wrongPool.filter(w => w !== correct));
    for (const w of pool) {
        if (opts.size >= count) break;
        opts.add(w);
    }
    return shuffle([...opts]);
}

function repeatEmoji(emoji, n, maxShow = 18) {
    const show = Math.min(n, maxShow);
    const row = Array(show).fill(emoji).join(' ');
    return n > show ? row + ` <span class="many-badge">+${n - show} more!</span>` : row;
}

function formatCountVisual(emoji, count, levelId) {
    if (levelId === 'hard' || count > 25) {
        const tens = Math.floor(count / 10);
        const ones = count % 10;
        let blocks = '';
        for (let t = 0; t < tens; t++) {
            blocks += `<span class="ten-group">${Array(10).fill(emoji).join(' ')}</span>`;
        }
        if (ones) blocks += `<span class="ones-group">${Array(ones).fill(emoji).join(' ')}</span>`;
        return `<div class="group-count">${blocks}<p class="count-total-hint">${tens} tens${ones ? ` + ${ones}` : ''}</p></div>`;
    }
    return repeatEmoji(emoji, count);
}

let levelId = 'easy';

function setLevel(id) {
    if (LEVELS[id]) levelId = id;
}

function getLevel() {
    return LEVELS[levelId];
}

function randNumberInLevel(lvl = levelId) {
    const L = LEVELS[lvl];
    return randInt(L.min, L.max);
}

function randCountInLevel(lvl = levelId) {
    const L = LEVELS[lvl];
    return randInt(L.countMin, L.countMax);
}

function generateCountItem(used, lvl) {
    const L = LEVELS[lvl];
    for (let t = 0; t < 50; t++) {
        const emoji = randFrom(EMOJI_FOR_COUNT);
        const count = randCountInLevel(lvl);
        const key = `c-${lvl}-${emoji}-${count}`;
        if (used.has(key)) continue;
        used.add(key);
        const useGroups = (lvl === 'middle' && count > 15) || lvl === 'hard';
        return { emoji, count, pool: numberPoolAround(count, lvl), levelId: lvl, useGroups };
    }
    const count = randInt(L.countMin, L.countMax);
    const useGroups = (lvl === 'middle' && count > 15) || lvl === 'hard';
    return { emoji: randFrom(EMOJI_FOR_COUNT), count, pool: numberPoolAround(count, lvl), levelId: lvl, useGroups };
}

function generateCompareItem(used, lvl) {
    const range = numbersInLevel(lvl);
    for (let t = 0; t < 50; t++) {
        const emoji = randFrom(EMOJI_FOR_COUNT);
        const a = randFrom(range);
        let b = randFrom(range);
        if (b === a && rand() > 0.12) b = randFrom(range.filter(x => x !== a));
        const tie = a === b;
        const key = `cmp-${lvl}-${emoji}-${a}-${b}`;
        if (used.has(key)) continue;
        used.add(key);
        return {
            left: { emoji, count: a },
            right: { emoji: rand() > 0.5 ? emoji : randFrom(EMOJI_FOR_COUNT), count: b },
            tie
        };
    }
    const a = range[0];
    const b = range[Math.min(1, range.length - 1)];
    return { left: { emoji: '🐶', count: a }, right: { emoji: '🐱', count: b }, tie: false };
}

function generateAddItem(used, lvl) {
    const L = LEVELS[lvl];
    for (let t = 0; t < 50; t++) {
        let sum, a, b;
        if (lvl === 'easy') {
            sum = randInt(2, L.addMax);
            a = randInt(1, sum - 1);
            b = sum - a;
        } else if (lvl === 'middle') {
            sum = randInt(21, 50);
            a = randInt(10, sum - 10);
            b = sum - a;
            if (a < 1 || b < 1) continue;
        } else {
            sum = randInt(51, 100);
            a = randInt(25, sum - 20);
            b = sum - a;
            if (a < 1 || b < 1) continue;
        }
        const key = `add-${lvl}-${a}-${b}`;
        if (used.has(key)) continue;
        used.add(key);
        return { a, b, sum };
    }
    return { a: 3, b: 4, sum: 7 };
}

function generateBeforeAfter(used, lvl) {
    const range = numbersInLevel(lvl);
    for (let t = 0; t < 50; t++) {
        const idx = randInt(1, range.length - 2);
        const n = range[idx];
        const mode = rand() > 0.5 ? 'after' : 'before';
        const answer = mode === 'after' ? range[idx + 1] : range[idx - 1];
        if (answer === undefined || answer === null) continue;
        const key = `ba-${lvl}-${n}-${mode}`;
        if (used.has(key)) continue;
        used.add(key);
        return { n, mode, answer };
    }
    return { n: range[1], mode: 'after', answer: range[2] };
}

/** Hard-only: show big number, pick matching digit */
function generateNumberMatchItem(used, lvl) {
    for (let t = 0; t < 50; t++) {
        const count = randNumberInLevel(lvl);
        const key = `nm-${count}`;
        if (used.has(key)) continue;
        used.add(key);
        return { count, pool: numberPoolAround(count, lvl), promptType: 'number-big' };
    }
    return { count: 75, pool: numberPoolAround(75, lvl), promptType: 'number-big' };
}

function buildCountRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const used = new Set();
    const items = [];

    if (lvl === 'hard') {
        while (items.length < game.questionsPerRound) {
            items.push(generateNumberMatchItem(used, lvl));
        }
        return items.map(q => {
            const opts = pickOptions(q.count, q.pool, 4, lvl);
            return {
                prompt: formatCountVisual(randFrom(EMOJI_FOR_COUNT), q.count, lvl),
                promptType: 'emoji-row',
                sublabel: 'Count carefully — then pick the number!',
                options: mapNumberOptions(opts),
                correct: String(q.count)
            };
        });
    }

    while (items.length < game.questionsPerRound) {
        items.push(generateCountItem(used, lvl));
    }
    return items.map(q => {
        const opts = pickOptions(q.count, q.pool, 4, lvl);
        const maxShow = lvl === 'easy' ? 12 : 18;
        const prompt = q.useGroups
            ? formatCountVisual(q.emoji, q.count, lvl)
            : repeatEmoji(q.emoji, q.count, maxShow);
        return {
            prompt,
            promptType: 'emoji-row',
            options: mapNumberOptions(opts),
            correct: String(q.count)
        };
    });
}

function buildNumberWordsRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const used = new Set();
    const items = [];

    if (lvl === 'hard') {
        while (items.length < game.questionsPerRound) {
            const n = randNumberInLevel(lvl);
            const key = `nw-${n}`;
            if (used.has(key)) continue;
            used.add(key);
            items.push({ count: n, pool: numberPoolAround(n, lvl), wordMode: true });
        }
        return items.map(q => {
            const correctWord = getNumberWord(q.count);
            const pool = pickOptions(q.count, q.pool, 4, lvl).map(n => getNumberWord(n));
            const wordOptions = pickTextOptions(correctWord, pool, 4);
            return {
                prompt: `<span class="number-huge">${q.count}</span>`,
                promptType: 'math-big',
                sublabel: 'Which WORD is this number?',
                options: wordOptions.map(w => ({ type: 'text', value: w, answer: w })),
                correct: correctWord
            };
        });
    }

    while (items.length < game.questionsPerRound) {
        items.push(generateCountItem(used, lvl));
    }
    return items.map(q => {
        const pool = numberPoolAround(q.count, lvl).map(n => getNumberWord(n));
        const correctWord = getNumberWord(q.count);
        const wordOptions = pickTextOptions(correctWord, pool, 4);
        const maxShow = lvl === 'easy' ? 12 : 18;
        const prompt = q.useGroups
            ? formatCountVisual(q.emoji, q.count, lvl)
            : repeatEmoji(q.emoji, q.count, maxShow);
        return {
            prompt,
            promptType: 'emoji-row',
            sublabel: 'Which word matches the count?',
            options: wordOptions.map(w => ({ type: 'text', value: w, answer: w })),
            correct: correctWord
        };
    });
}

function buildSpellRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(SPELL_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.word);
    const wrongBank = pool.flatMap(q => [...q.wrong, q.word]);
    return picked.map(q => {
        const all = pickTextOptions(q.word, [...q.wrong, ...wrongBank], 4);
        return {
            prompt: q.picture,
            promptType: 'big-emoji',
            sublabel: levelSublabel('picture-spell', lvl),
            options: all.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.word
        };
    });
}

function buildColorRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(COLOR_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.item + q.color);
    return picked.map(q => {
        let opts = shuffle(q.options);
        if (lvl === 'hard') {
            const similar = { red: ['pink', 'orange'], pink: ['red', 'purple'], blue: ['purple', 'gray'],
                yellow: ['orange', 'brown'], black: ['gray', 'white'], purple: ['pink', 'blue'] };
            const merged = shuffle([...new Set([q.color, ...(similar[q.color] || []), ...q.options])]);
            opts = merged.length >= 4 ? merged.slice(0, 4) : shuffle(q.options);
            if (!opts.includes(q.color)) opts[0] = q.color;
        }
        return {
            prompt: q.item,
            promptType: 'big-emoji',
            sublabel: levelSublabel('color-fun', lvl),
            options: opts.map(c => ({ type: 'color-chip', value: c, answer: c, colorName: c })),
            correct: q.color
        };
    });
}

function buildCompareRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const used = new Set();
    const items = [];
    while (items.length < game.questionsPerRound) {
        items.push(generateCompareItem(used, lvl));
    }
    return items.map(q => {
        const maxShow = lvl === 'easy' ? 10 : 14;
        const leftStr = q.left.count > 25
            ? formatCountVisual(q.left.emoji, q.left.count, lvl)
            : repeatEmoji(q.left.emoji, q.left.count, maxShow);
        const rightStr = q.right.count > 25
            ? formatCountVisual(q.right.emoji, q.right.count, lvl)
            : repeatEmoji(q.right.emoji, q.right.count, maxShow);
        let correct = 'right';
        if (q.left.count > q.right.count) correct = 'left';
        else if (q.tie || q.left.count === q.right.count) correct = 'equal';
        const isEqual = q.tie || q.left.count === q.right.count;
        return {
            promptType: 'compare',
            left: { text: leftStr, count: q.left.count },
            right: { text: rightStr, count: q.right.count },
            sublabel: isEqual ? 'Are they equal?' : 'Which side has MORE?',
            options: [
                { type: 'compare-btn', value: 'left', label: '← Left', answer: 'left' },
                { type: 'compare-btn', value: 'right', label: 'Right →', answer: 'right' },
                ...(isEqual ? [{ type: 'compare-btn', value: 'equal', label: 'Same! =', answer: 'equal' }] : [])
            ],
            correct
        };
    });
}

function buildAddRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const used = new Set();
    const items = [];
    while (items.length < game.questionsPerRound) {
        items.push(generateAddItem(used, lvl));
    }
    return items.map(q => {
        const opts = pickOptions(q.sum, numberPoolAround(q.sum, lvl), 4, lvl);
        return {
            prompt: `<span class="math-line">${q.a} + ${q.b} = ?</span>`,
            promptType: 'math-big',
            sublabel: 'Add them up!',
            options: mapNumberOptions(opts),
            correct: String(q.sum)
        };
    });
}

function buildBeforeAfterRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const used = new Set();
    const items = [];
    while (items.length < game.questionsPerRound) {
        items.push(generateBeforeAfter(used, lvl));
    }
    return items.map(q => {
        const label = q.mode === 'after' ? 'What comes AFTER?' : 'What comes BEFORE?';
        const opts = pickOptions(q.answer, numberPoolAround(q.answer, lvl), 4, lvl);
        return {
            prompt: `<span class="number-huge">${q.n}</span>`,
            promptType: 'math-big',
            sublabel: label,
            options: mapNumberOptions(opts),
            correct: String(q.answer)
        };
    });
}

function buildOddOneRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(ODD_ONE_SETS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.odd);
    return picked.map(q => {
        const shuffled = shuffle(q.items);
        return {
            promptType: 'odd-grid',
            items: shuffled,
            sublabel: levelSublabel('odd-one-out', lvl),
            options: shuffled.map(emoji => ({
                type: 'emoji-btn', value: emoji, answer: emoji
            })),
            correct: q.odd
        };
    });
}

function buildShapeRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(SHAPE_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.name);
    const nameBank = pool.map(s => s.name);
    return picked.map(q => {
        const opts = pickTextOptions(q.name, [...q.wrong, ...nameBank], 4);
        return {
            prompt: q.shape,
            promptType: 'shape-big',
            sublabel: levelSublabel('shape-match', lvl),
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.name
        };
    });
}

function buildRhymeRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(RHYME_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.word);
    const rhymeBank = pool.flatMap(r => [r.rhyme, ...r.wrong]);
    return picked.map(q => {
        const opts = pickTextOptions(q.rhyme, [...q.wrong, q.word, ...rhymeBank], 4);
        return {
            prompt: q.picture,
            promptType: 'big-emoji',
            sublabel: levelSublabel('rhyme-time', lvl) || `What rhymes with "${q.word}"?`,
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.rhyme
        };
    });
}



function getMedal(correct, total) {
    const pct = correct / total;
    if (pct === 1) return { emoji: '🥇', label: 'Gold Star!', class: 'gold' };
    if (pct >= 0.8) return { emoji: '🥈', label: 'Silver Star!', class: 'silver' };
    if (pct >= 0.6) return { emoji: '🥉', label: 'Bronze Star!', class: 'bronze' };
    return { emoji: '⭐', label: 'Keep Going!', class: 'star' };
}

const WRONG_MESSAGES = [
    'Oops! Try the next one! 💪',
    'Not quite — you can do it! 🌟',
    'Almost! Keep going! 😊',
    'Nice try! Next question! 🎯'
];

const CORRECT_MESSAGES = [
    '🎉 Yes! Super star!',
    '🌟 Wow! Correct!',
    '💫 Amazing! You got it!',
    '🏆 Brilliant answer!'
];

function randomWrongMessage() {
    return WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
}

function randomCorrectMessage() {
    return CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
}

function buildSpeakSpellRound(game) {
    newRoundSeed();
    const lvl = levelId;
    const pool = poolForLevel(SPELL_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, game.questionsPerRound, q => q.word);
    return picked.map(q => {
        return {
            prompt: q.picture,
            promptType: 'big-emoji',
            sublabel: `Who is in the picture? Spell it!`,
            correct: q.word.toUpperCase(),
            audioText: `Who is this in the picture? Speak the spelling!`
        };
    });
}

// Expose all functions and variables to the global window object to ensure compatibility
// in all browser sandboxes and script isolation environments.
const globalsToExpose = {
    GAMES, LEVELS, LEVEL_ORDER, GAME_LEVEL_LABELS, getGameLevelLabel,
    setLevel, getLevel, randNumberInLevel, randCountInLevel, generateCountItem,
    generateCompareItem, generateAddItem, generateBeforeAfter, generateNumberMatchItem,
    buildCountRound, buildNumberWordsRound, buildSpellRound, buildColorRound,
    buildCompareRound, buildAddRound, buildBeforeAfterRound, buildOddOneRound,
    buildShapeRound, buildRhymeRound, buildSpeakSpellRound, getMedal, randomWrongMessage, randomCorrectMessage,
    newRoundSeed, rand, shuffle, randInt, randFrom, pickUniqueFromPool,
    numbersInLevel, numberPoolAround, pickOptions, makeNumberOption, mapNumberOptions,
    pickTextOptions, repeatEmoji, formatCountVisual, getNumberWord, numberToWord,
    NUMBER_IMAGES, SPELL_QUESTIONS, COLOR_QUESTIONS, SHAPE_QUESTIONS, RHYME_QUESTIONS,
    ODD_ONE_SETS, EMOJI_FOR_COUNT, NUMBER_WORDS_STATIC, QUESTIONS_PER_ROUND,
    AVAILABLE_NUMBERS
};

for (const [key, value] of Object.entries(globalsToExpose)) {
    window[key] = value;
}
