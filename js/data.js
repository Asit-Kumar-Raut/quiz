// 3D GK & Abacus Adventure - Consolidated Game Database
// Integrates both Classic Games (for Small Children) and new GK/Abacus games (for Big Children)

// ============================================================================
// HANDWRITING DIGIT CLASSIFIER TEMPLATES & LOGIC
// ============================================================================
const DIGIT_TEMPLATES = {
    '0': '0111110011000110100000101000001010000010100000101100011001111100',
    '1': '0001100000111000000110000001100000011000000110000001100000111100',
    '2': '0111100011001100000011000001100000110000011000001100000011111110',
    '3': '0111110010000110000001100011110000000110100001101100011001111100',
    '4': '0001100000101000010010001100100011111110000010000000100000001000',
    '5': '0111111001000000011110000000110000000100000001100100011001111100',
    '6': '0011110001100000110000001111110011000110110001100110011000111100',
    '7': '1111111100000110000011000001100000110000011000000110000001100000',
    '8': '0111110011000110110001100111110011000110110001101100011001111100',
    '9': '0111110011000110110001100111111000000110000001100000110001111000'
};

function recognizeDigit(points, canvasWidth, canvasHeight) {
    if (!points || points.length < 4) return null;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });

    const w = maxX - minX;
    const h = maxY - minY;
    if (w < 5 && h < 5) return null;

    // Aspect ratio override for number '1'
    if (h > 12 && w > 0 && (h / w) > 2.5) {
        return 1;
    }

    const grid = new Array(64).fill(0);
    points.forEach(p => {
        const nx = w === 0 ? 0.5 : (p.x - minX) / w;
        const ny = h === 0 ? 0.5 : (p.y - minY) / h;
        const col = Math.min(7, Math.max(0, Math.floor(nx * 8)));
        const row = Math.min(7, Math.max(0, Math.floor(ny * 8)));
        grid[row * 8 + col] = 1;
    });

    const dilated = [...grid];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (grid[r * 8 + c] === 1) {
                if (r > 0) dilated[(r - 1) * 8 + c] = 1;
                if (r < 7) dilated[(r + 1) * 8 + c] = 1;
                if (c > 0) dilated[r * 8 + (c - 1)] = 1;
                if (c < 7) dilated[r * 8 + (c + 1)] = 1;
            }
        }
    }

    let bestDigit = null;
    let maxSimilarity = -1;

    for (const [digitStr, templateData] of Object.entries(DIGIT_TEMPLATES)) {
        let intersection = 0;
        let union = 0;

        for (let i = 0; i < 64; i++) {
            const userVal = dilated[i];
            const tempVal = templateData[i] === '1' ? 1 : 0;
            if (userVal === 1 && tempVal === 1) intersection++;
            if (userVal === 1 || tempVal === 1) union++;
        }

        const similarity = union === 0 ? 0 : intersection / union;
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestDigit = parseInt(digitStr, 10);
        }
    }

    if (maxSimilarity < 0.12) return null;
    return bestDigit;
}

// ============================================================================
// DYNAMIC ARITHMETIC GENERATOR
// ============================================================================
function generateAbacusQuestion(classDivision, difficulty) {
    let stepsCount = 4;
    let minNum = 1, maxNum = 9;
    
    if (difficulty === 'medium') {
        minNum = 10;
        maxNum = 50;
        stepsCount = 4;
    } else if (difficulty === 'hard') {
        minNum = 20;
        maxNum = 200;
        stepsCount = 5;
    }

    let sequence = [];
    let runningSum = 0;

    let first = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    sequence.push({ op: '+', val: first });
    runningSum = first;

    for (let i = 1; i < stepsCount; i++) {
        let op = Math.random() > 0.45 ? '+' : '-';
        let val;

        if (difficulty === 'easy') {
            val = Math.floor(Math.random() * 8) + 1;
        } else if (difficulty === 'medium') {
            val = Math.floor(Math.random() * 30) + 5;
        } else {
            val = Math.random() > 0.5 
                ? Math.floor(Math.random() * 120) + 15 
                : Math.floor(Math.random() * 40) + 5;
        }

        if (op === '-') {
            if (runningSum - val < 0) {
                op = '+';
                runningSum += val;
            } else {
                runningSum -= val;
            }
        } else {
            runningSum += val;
        }
        sequence.push({ op, val });
    }

    return {
        sequence,
        answer: runningSum,
        textRepresentation: sequence.map(s => `${s.op}${s.val}`).join(' ')
    };
}

// ============================================================================
// BIG CHILDREN GK QUESTIONS PORTAL (PLANETS & SPACE)
// ============================================================================
const GK_QUESTIONS = {
    '2': {
        'easy': [
            { question: "Which planet do we live on?", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop", options: ["Mars", "Earth", "Jupiter", "Venus"], correct: "Earth", explanation: "We live on Earth! It is the third planet from the Sun." },
            { question: "Which is the largest animal on land?", image: "https://images.unsplash.com/photo-1581850518616-bcb8077ab233?w=500&auto=format&fit=crop", options: ["Lion", "Elephant", "Giraffe", "Hippopotamus"], correct: "Elephant", explanation: "The African Elephant is the largest land animal on Earth!" },
            { question: "What is the color of a school bus?", image: "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=500&auto=format&fit=crop", options: ["Red", "Yellow", "Blue", "Green"], correct: "Yellow", explanation: "School buses are yellow so they are easy to spot!" },
            { question: "Which insect makes sweet honey?", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=500&auto=format&fit=crop", options: ["Butterfly", "Ant", "Honey Bee", "Ladybug"], correct: "Honey Bee", explanation: "Honey bees collect sweet nectar from flowers to make honey." },
            { question: "What shape is a round clock?", image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&auto=format&fit=crop", options: ["Square", "Circle", "Triangle", "Star"], correct: "Circle", explanation: "A circle is a round shape with no corners!" },
            { question: "How many days are in a week?", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop", options: ["5", "6", "7", "8"], correct: "7", explanation: "There are 7 days in a week, starting from Monday to Sunday." },
            { question: "Which is the tallest animal on Earth?", image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=500&auto=format&fit=crop", options: ["Giraffe", "Elephant", "Lion", "Zebra"], correct: "Giraffe", explanation: "The Giraffe is the tallest mammal on Earth, with a very long neck!" },
            { question: "What do we call a baby dog?", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop", options: ["Kitten", "Puppy", "Cub", "Calf"], correct: "Puppy", explanation: "A baby dog is called a puppy!" },
            { question: "Which color is at the top of a rainbow?", image: "https://images.unsplash.com/photo-1444080748617-fba6c764bab7?w=500&auto=format&fit=crop", options: ["Blue", "Red", "Green", "Yellow"], correct: "Red", explanation: "Red is the topmost color of a rainbow." },
            { question: "What fruit do monkeys love to eat?", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop", options: ["Apple", "Orange", "Banana", "Grapes"], correct: "Banana", explanation: "Monkeys love sweet yellow bananas!" }
        ],
        'medium': [
            { question: "Which planet is closest to the Sun?", image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=500&auto=format&fit=crop", options: ["Mercury", "Earth", "Saturn", "Neptune"], correct: "Mercury", explanation: "Mercury is the closest and smallest planet in our solar system." },
            { question: "Which bird is the national symbol of India?", image: "https://images.unsplash.com/photo-1534759847507-b441e57c51d0?w=500&auto=format&fit=crop", options: ["Parrot", "Peacock", "Eagle", "Sparrow"], correct: "Peacock", explanation: "The Peacock is the national bird of India, famous for its feathers." },
            { question: "How many days are in a leap year?", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop", options: ["365", "366", "360", "364"], correct: "366", explanation: "A leap year has 366 days, with an extra day in February!" },
            { question: "Which animal is called the 'Ship of the Desert'?", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=500&auto=format&fit=crop", options: ["Horse", "Camel", "Donkey", "Elephant"], correct: "Camel", explanation: "Camels can walk easily on soft sand and survive without water for days!" },
            { question: "What invisible gas do we breathe in to survive?", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop", options: ["Oxygen", "Carbon Dioxide", "Helium", "Nitrogen"], correct: "Oxygen", explanation: "We breathe in Oxygen! Plants make it for us." },
            { question: "How many legs does a spider have?", image: "https://images.unsplash.com/photo-1510008323631-0df8fa25c13b?w=500&auto=format&fit=crop", options: ["6", "8", "10", "12"], correct: "8", explanation: "Spiders are arachnids and always have 8 legs!" },
            { question: "Which season is the coldest?", image: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=500&auto=format&fit=crop", options: ["Summer", "Winter", "Spring", "Autumn"], correct: "Winter", explanation: "Winter is the coldest season, often bringing snow and ice!" },
            { question: "What is the name of the satellite that orbits Earth?", image: "https://images.unsplash.com/photo-1532598537651-789a71d8be8d?w=500&auto=format&fit=crop", options: ["The Moon", "The Sun", "Sputnik", "Apollo"], correct: "The Moon", explanation: "The Moon is Earth's only natural satellite." },
            { question: "Which shape has three sides?", image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500&auto=format&fit=crop", options: ["Square", "Circle", "Triangle", "Rectangle"], correct: "Triangle", explanation: "A triangle is a shape with exactly three straight sides and corners." },
            { question: "What do bees collect from flowers?", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop", options: ["Water", "Nectar", "Honey", "Leaves"], correct: "Nectar", explanation: "Bees collect sweet nectar from flowers to make honey inside their hives." }
        ],
        'hard': [
            { question: "Which planet has giant, beautiful rings?", image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop", options: ["Saturn", "Mars", "Mercury", "Venus"], correct: "Saturn", explanation: "Saturn's rings are made of ice and rock." },
            { question: "What is the freezing point of water?", image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=500&auto=format&fit=crop", options: ["0 degrees C", "100 degrees C", "10 degrees C", "-5 degrees C"], correct: "0 degrees C", explanation: "Water turns to ice at 0 degrees Celsius." },
            { question: "Which is the tallest grass in the world?", image: "https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=500&auto=format&fit=crop", options: ["Bamboo", "Wheat", "Sugarcane", "Rice"], correct: "Bamboo", explanation: "Bamboo is actually a giant grass, growing very tall and fast!" },
            { question: "Where can you find the Pyramids of Giza?", image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?w=500&auto=format&fit=crop", options: ["India", "Egypt", "China", "Mexico"], correct: "Egypt", explanation: "The pyramids are located in Egypt, built as tombs for ancient kings." },
            { question: "What force pulls objects to the ground?", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop", options: ["Magnetism", "Wind", "Gravity", "Friction"], correct: "Gravity", explanation: "Gravity is the force that pulls things down." },
            { question: "Which planet is known for having a Great Red Spot?", image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=500&auto=format&fit=crop", options: ["Jupiter", "Mars", "Saturn", "Neptune"], correct: "Jupiter", explanation: "Jupiter's Great Red Spot is a giant storm that has lasted for hundreds of years!" },
            { question: "Which is the fastest land animal?", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&auto=format&fit=crop", options: ["Lion", "Cheetah", "Horse", "Gazelle"], correct: "Cheetah", explanation: "The Cheetah can run up to 120 km/h, making it the fastest animal on land!" },
            { question: "Which organ helps us breathe air?", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop", options: ["Heart", "Lungs", "Stomach", "Brain"], correct: "Lungs", explanation: "Our lungs take in oxygen from the air when we breathe." },
            { question: "What is the boiling point of water?", image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=500&auto=format&fit=crop", options: ["50 degrees C", "100 degrees C", "200 degrees C", "0 degrees C"], correct: "100 degrees C", explanation: "Water boils and turns to steam at 100 degrees Celsius." },
            { question: "What gas do plants need to make food?", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: "Carbon Dioxide", explanation: "Plants absorb Carbon Dioxide from the air to perform photosynthesis." }
        ]
    },
    '3': {
        'easy': [
            { question: "Which planet is known as the 'Red Planet'?", image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop", options: ["Venus", "Jupiter", "Mars", "Mercury"], correct: "Mars", explanation: "Mars looks red because of rusty iron dust on its ground." },
            { question: "How many continents are there on Earth?", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop", options: ["5", "6", "7", "8"], correct: "7", explanation: "Earth has 7 continents, from Asia to Antarctica." },
            { question: "Which is the largest ocean on Earth?", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&auto=format&fit=crop", options: ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], correct: "Pacific Ocean", explanation: "The Pacific Ocean is the largest, covering over 30% of Earth." },
            { question: "Which mammal can fly?", image: "https://images.unsplash.com/photo-1594911774802-8822a707cbb3?w=500&auto=format&fit=crop", options: ["Owl", "Bat", "Eagle", "Flying Squirrel"], correct: "Bat", explanation: "Bats are the only mammals that can truly fly!" },
            { question: "What makes plant leaves green?", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop", options: ["Oxygen", "Water", "Chlorophyll", "Iron"], correct: "Chlorophyll", explanation: "Chlorophyll is a pigment that helps plants absorb sunlight." },
            { question: "Which planet has a name that starts with 'U'?", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop", options: ["Uranus", "Neptune", "Saturn", "Jupiter"], correct: "Uranus", explanation: "Uranus is the 7th planet from the Sun and starts with U." },
            { question: "Which animal can live both on land and in water?", image: "https://images.unsplash.com/photo-1579613832125-5d34a13ff2a8?w=500&auto=format&fit=crop", options: ["Fish", "Frog", "Lizard", "Rabbit"], correct: "Frog", explanation: "Frogs are amphibians and can breathe both in water and on land." },
            { question: "Which planet is famous for being very hot and bright?", image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=500&auto=format&fit=crop", options: ["Mercury", "Venus", "Mars", "Jupiter"], correct: "Venus", explanation: "Venus is the brightest and hottest planet in our solar system." },
            { question: "Which is the largest land mammal in Asia?", image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500&auto=format&fit=crop", options: ["Asian Elephant", "Tiger", "Rhino", "Bear"], correct: "Asian Elephant", explanation: "The Asian Elephant is the largest land animal in Asia, slightly smaller than the African Elephant." },
            { question: "What is the name of our solar system's star?", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop", options: ["The Moon", "Polaris", "The Sun", "Sirius"], correct: "The Sun", explanation: "The Sun is a giant, hot star at the center of our solar system." }
        ],
        'medium': [
            { question: "Which is the hottest planet in our solar system?", image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=500&auto=format&fit=crop", options: ["Mercury", "Venus", "Mars", "Jupiter"], correct: "Venus", explanation: "Venus is the hottest because thick clouds trap the Sun's heat." },
            { question: "Which is the largest island in the world?", image: "https://images.unsplash.com/photo-1520443240718-fce21901db79?w=500&auto=format&fit=crop", options: ["Australia", "Greenland", "Iceland", "Madagascar"], correct: "Greenland", explanation: "Greenland is the largest island. Australia is classified as a continent." },
            { question: "Who is known as the Father of Computers?", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop", options: ["Albert Einstein", "Charles Babbage", "Bill Gates", "Isaac Newton"], correct: "Charles Babbage", explanation: "Charles Babbage designed the first mechanical computer blueprint." },
            { question: "What organ pumps blood through your body?", image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500&auto=format&fit=crop", options: ["Lungs", "Brain", "Heart", "Stomach"], correct: "Heart", explanation: "The heart pumps oxygen-rich blood through your body." },
            { question: "Which is the longest river on Earth?", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop", options: ["Amazon River", "Nile River", "Ganga River", "Mississippi River"], correct: "Nile River", explanation: "The Nile River in Africa is the longest, over 6,650 km!" },
            { question: "Which planet is called the blue planet because of water?", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop", options: ["Earth", "Neptune", "Uranus", "Saturn"], correct: "Earth", explanation: "Earth looks beautiful blue from space because water covers 71% of its surface." },
            { question: "How many teeth does an adult human normally have?", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop", options: ["28", "30", "32", "36"], correct: "32", explanation: "An adult human has a complete set of 32 teeth." },
            { question: "Which layer of Earth do we live on?", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop", options: ["Crust", "Mantle", "Outer Core", "Inner Core"], correct: "Crust", explanation: "We live on the rocky outermost layer of Earth called the Crust." },
            { question: "What is the process of water turning into vapor called?", image: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop", options: ["Condensation", "Evaporation", "Freezing", "Precipitation"], correct: "Evaporation", explanation: "Evaporation is when liquid water turns into invisible vapor on heating." },
            { question: "Which country has the Taj Mahal?", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop", options: ["India", "Nepal", "Pakistan", "Bangladesh"], correct: "India", explanation: "The Taj Mahal is a beautiful marble monument located in Agra, India." }
        ],
        'hard': [
            { question: "How many planets have ring systems?", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop", options: ["1", "2", "4", "0"], correct: "4", explanation: "Saturn, Jupiter, Uranus, and Neptune all have rings!" },
            { question: "Which is the smallest state in India by area?", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop", options: ["Goa", "Sikkim", "Tripura", "Kerala"], correct: "Goa", explanation: "Goa is the smallest Indian state by area, famous for its beaches." },
            { question: "What is the primary source of energy for the Earth?", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop", options: ["The Moon", "Coal", "The Sun", "Wind"], correct: "The Sun", explanation: "The Sun provides the energy for almost all life on Earth." },
            { question: "Which gas makes up most of Earth's atmosphere?", image: "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=500&auto=format&fit=crop", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correct: "Nitrogen", explanation: "Nitrogen gas makes up about 78% of the air we breathe." },
            { question: "Who invented the telephone?", image: "https://images.unsplash.com/photo-1520923642038-b4a53cbd00ab?w=500&auto=format&fit=crop", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "James Watt"], correct: "Alexander Graham Bell", explanation: "Alexander Graham Bell invented the telephone in 1876." },
            { question: "Which planet was reclassified as a dwarf planet in 2006?", image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop", options: ["Pluto", "Mercury", "Ceres", "Eris"], correct: "Pluto", explanation: "The IAU defined a planet in 2006, reclassifying Pluto as a dwarf planet." },
            { question: "What is the center of an atom called?", image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop", options: ["Electron", "Neutron", "Nucleus", "Proton"], correct: "Nucleus", explanation: "The nucleus is the small, dense region at the center of an atom." },
            { question: "Which instrument is used to measure temperature?", image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format&fit=crop", options: ["Barometer", "Thermometer", "Speedometer", "Compass"], correct: "Thermometer", explanation: "A thermometer measures temperature in Celsius or Fahrenheit." },
            { question: "Which vitamin do we get from sunlight?", image: "https://images.unsplash.com/photo-1506252374453-ef5237291d9d?w=500&auto=format&fit=crop", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B"], correct: "Vitamin D", explanation: "Our skin synthesizes Vitamin D when exposed to UVB rays in sunlight." },
            { question: "How many bones are in an adult human body?", image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=500&auto=format&fit=crop", options: ["206", "300", "150", "250"], correct: "206", explanation: "An adult human body has exactly 206 bones." }
        ]
    },
    '4': {
        'easy': [
            { question: "Which is the largest planet in our solar system?", image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=500&auto=format&fit=crop", options: ["Saturn", "Jupiter", "Earth", "Neptune"], correct: "Jupiter", explanation: "Jupiter is the biggest planet. Over 1,300 Earths could fit inside!" },
            { question: "Which is the tallest mountain in the world?", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&auto=format&fit=crop", options: ["Mount K2", "Mount Kilimanjaro", "Mount Everest", "Mount Fuji"], correct: "Mount Everest", explanation: "Mount Everest rises 8,849 meters high in the Himalayas." },
            { question: "How many bones are in an adult human body?", image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=500&auto=format&fit=crop", options: ["300", "206", "150", "208"], correct: "206", explanation: "Adults have 206 bones. Babies have around 300 that fuse together." },
            { question: "Which country is home to the Kangaroo?", image: "https://images.unsplash.com/photo-1549137721-bf2b9fa4ff52?w=500&auto=format&fit=crop", options: ["Africa", "Australia", "South America", "Canada"], correct: "Australia", explanation: "Kangaroos are native to Australia and carry babies in pouches." },
            { question: "What state of matter is water vapor?", image: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: "Gas", explanation: "Water vapor is water in its gaseous form." },
            { question: "Which planet do we live on?", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop", options: ["Mars", "Earth", "Jupiter", "Venus"], correct: "Earth", explanation: "We live on Earth! It is the third planet from the Sun." },
            { question: "Which is the largest animal on land?", image: "https://images.unsplash.com/photo-1581850518616-bcb8077ab233?w=500&auto=format&fit=crop", options: ["Lion", "Elephant", "Giraffe", "Hippopotamus"], correct: "Elephant", explanation: "The African Elephant is the largest land animal on Earth!" },
            { question: "How many days are in a week?", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop", options: ["5", "6", "7", "8"], correct: "7", explanation: "There are 7 days in a week, starting from Monday to Sunday." },
            { question: "Which is the tallest animal on Earth?", image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=500&auto=format&fit=crop", options: ["Giraffe", "Elephant", "Lion", "Zebra"], correct: "Giraffe", explanation: "The Giraffe is the tallest mammal on Earth, with a very long neck!" },
            { question: "What fruit do monkeys love to eat?", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop", options: ["Apple", "Orange", "Banana", "Grapes"], correct: "Banana", explanation: "Monkeys love sweet yellow bananas!" }
        ],
        'medium': [
            { question: "How long does it take for Earth to spin once on its axis?", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop", options: ["365 days", "24 hours", "28 days", "12 hours"], correct: "24 hours", explanation: "Earth rotates once in 24 hours, giving us day and night." },
            { question: "Which famous landmark is in Paris, France?", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop", options: ["Big Ben", "Eiffel Tower", "Taj Mahal", "Colosseum"], correct: "Eiffel Tower", explanation: "The Eiffel Tower is a famous iron tower in Paris." },
            { question: "Which organ filters waste from your blood?", image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format&fit=crop", options: ["Kidneys", "Liver", "Lungs", "Heart"], correct: "Kidneys", explanation: "Your two kidneys filter waste and form urine." },
            { question: "Who wrote the national anthem of India?", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&auto=format&fit=crop", options: ["Rabindranath Tagore", "Mahatma Gandhi", "Bankim Chandra Chattopadhyay", "Subhas Chandra Bose"], correct: "Rabindranath Tagore", explanation: "Rabindranath Tagore composed the national anthem." },
            { question: "What is molten rock inside a volcano called?", image: "https://images.unsplash.com/photo-1504470695779-75300268aa0e?w=500&auto=format&fit=crop", options: ["Lava", "Magma", "Crust", "Ash"], correct: "Magma", explanation: "It is magma underground, and lava when it erupts." },
            { question: "Which bird is the national symbol of India?", image: "https://images.unsplash.com/photo-1534759847507-b441e57c51d0?w=500&auto=format&fit=crop", options: ["Parrot", "Peacock", "Eagle", "Sparrow"], correct: "Peacock", explanation: "The Peacock is the national bird of India, famous for its feathers." },
            { question: "How many days are in a leap year?", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&auto=format&fit=crop", options: ["365", "366", "360", "364"], correct: "366", explanation: "A leap year has 366 days, with an extra day in February!" },
            { question: "Which animal is called the 'Ship of the Desert'?", image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=500&auto=format&fit=crop", options: ["Horse", "Camel", "Donkey", "Elephant"], correct: "Camel", explanation: "Camels can walk easily on soft sand and survive without water for days!" },
            { question: "What invisible gas do we breathe in to survive?", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop", options: ["Oxygen", "Carbon Dioxide", "Helium", "Nitrogen"], correct: "Oxygen", explanation: "We breathe in Oxygen! Plants make it for us." },
            { question: "Which shape has three sides?", image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500&auto=format&fit=crop", options: ["Square", "Circle", "Triangle", "Rectangle"], correct: "Triangle", explanation: "A triangle is a shape with exactly three straight sides and corners." }
        ],
        'hard': [
            { question: "Which planet takes the longest to orbit the Sun?", image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop", options: ["Uranus", "Neptune", "Jupiter", "Saturn"], correct: "Neptune", explanation: "Neptune takes the longest: 165 Earth years to orbit once." },
            { question: "Which is the largest desert in the world?", image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500&auto=format&fit=crop", options: ["Sahara Desert", "Gobi Desert", "Antarctic Desert", "Thar Desert"], correct: "Antarctic Desert", explanation: "The cold Antarctic Desert is the largest desert on Earth." },
            { question: "What chemical element does 'O' stand for in H2O?", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&auto=format&fit=crop", options: ["Hydrogen", "Helium", "Oxygen", "Osmium"], correct: "Oxygen", explanation: "H2O stands for 2 Hydrogen atoms and 1 Oxygen atom." },
            { question: "Who was the first person to step on the Moon?", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Elon Musk"], correct: "Neil Armstrong", explanation: "Neil Armstrong walked on the moon during Apollo 11 in 1969." },
            { question: "Which vitamin does our skin make in sunlight?", image: "https://images.unsplash.com/photo-1506252374453-ef5237291d9d?w=500&auto=format&fit=crop", options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B12"], correct: "Vitamin D", explanation: "Skin exposure to sunlight triggers the synthesis of Vitamin D." },
            { question: "Which planet has giant, beautiful rings?", image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop", options: ["Saturn", "Mars", "Mercury", "Venus"], correct: "Saturn", explanation: "Saturn's rings are made of ice and rock." },
            { question: "What is the freezing point of water?", image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=500&auto=format&fit=crop", options: ["0 degrees C", "100 degrees C", "10 degrees C", "-5 degrees C"], correct: "0 degrees C", explanation: "Water turns to ice at 0 degrees Celsius." },
            { question: "Which is the tallest grass in the world?", image: "https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=500&auto=format&fit=crop", options: ["Bamboo", "Wheat", "Sugarcane", "Rice"], correct: "Bamboo", explanation: "Bamboo is actually a giant grass, growing very tall and fast!" },
            { question: "Where can you find the Pyramids of Giza?", image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?w=500&auto=format&fit=crop", options: ["India", "Egypt", "China", "Mexico"], correct: "Egypt", explanation: "The pyramids are located in Egypt, built as tombs for ancient kings." },
            { question: "What force pulls objects to the ground?", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop", options: ["Magnetism", "Wind", "Gravity", "Friction"], correct: "Gravity", explanation: "Gravity is the force that pulls things down." }
        ]
    },
    '5': {
        'easy': [
            { question: "Which is the smallest planet in our solar system?", image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=500&auto=format&fit=crop", options: ["Mars", "Mercury", "Venus", "Pluto"], correct: "Mercury", explanation: "Mercury is the smallest planet, only a bit larger than our Moon." },
            { question: "Which continent has the Amazon Rainforest?", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&auto=format&fit=crop", options: ["Africa", "Asia", "South America", "Europe"], correct: "South America", explanation: "The Amazon is located in South America." },
            { question: "Which is the largest structure built by living organisms?", image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=500&auto=format&fit=crop", options: ["Great Wall of China", "Great Barrier Reef", "Amazon Forest", "Grand Canyon"], correct: "Great Barrier Reef", explanation: "The Great Barrier Reef is built by tiny coral polyps." },
            { question: "What is the capital city of India?", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop", options: ["Mumbai", "Kolkata", "New Delhi", "Bengaluru"], correct: "New Delhi", explanation: "New Delhi is the official capital city of India." },
            { question: "What holds the solar system together?", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop", options: ["Magnetic fields", "Sun's gravity", "Solar winds", "Cosmic dust"], correct: "Sun's gravity", explanation: "The Sun's massive gravity keeps all the planets orbiting." },
            { question: "Which planet is known as the 'Red Planet'?", image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop", options: ["Venus", "Jupiter", "Mars", "Mercury"], correct: "Mars", explanation: "Mars looks red because of rusty iron dust on its ground." },
            { question: "How many continents are there on Earth?", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=500&auto=format&fit=crop", options: ["5", "6", "7", "8"], correct: "7", explanation: "Earth has 7 continents, from Asia to Antarctica." },
            { question: "Which is the largest ocean on Earth?", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&auto=format&fit=crop", options: ["Indian Ocean", "Atlantic Ocean", "Pacific Ocean", "Arctic Ocean"], correct: "Pacific Ocean", explanation: "The Pacific Ocean is the largest, covering over 30% of Earth." },
            { question: "Which mammal can fly?", image: "https://images.unsplash.com/photo-1594911774802-8822a707cbb3?w=500&auto=format&fit=crop", options: ["Owl", "Bat", "Eagle", "Flying Squirrel"], correct: "Bat", explanation: "Bats are the only mammals that can truly fly!" },
            { question: "What makes plant leaves green?", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop", options: ["Oxygen", "Water", "Chlorophyll", "Iron"], correct: "Chlorophyll", explanation: "Chlorophyll is a pigment that helps plants absorb sunlight." }
        ],
        'medium': [
            { question: "What causes ocean tides on Earth?", image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=500&auto=format&fit=crop", options: ["Wind currents", "Moon's gravity", "Earth's core heat", "Undersea volcanoes"], correct: "Moon's gravity", explanation: "The Moon's gravitational pull creates high and low tides." },
            { question: "What is the speed of light?", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&auto=format&fit=crop", options: ["150,000 km/s", "300,000 km/s", "1,000,000 km/s", "30,000 km/s"], correct: "300,000 km/s", explanation: "Light travels at 300,000 kilometers per second!" },
            { question: "Which organ controls all functions in the human body?", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop", options: ["Heart", "Lungs", "Brain", "Spinal Core"], correct: "Brain", explanation: "The brain controls all thoughts, movement, and organs." },
            { question: "Which is the largest hot desert in the world?", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop", options: ["Sahara Desert", "Thar Desert", "Kalahari Desert", "Arabian Desert"], correct: "Sahara Desert", explanation: "The Sahara in Africa is the largest hot desert." },
            { question: "What gas do plants release during photosynthesis?", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop", options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Methane"], correct: "Oxygen", explanation: "Plants take in carbon dioxide and release oxygen." },
            { question: "Which is the largest island in the world?", image: "https://images.unsplash.com/photo-1520443240718-fce21901db79?w=500&auto=format&fit=crop", options: ["Australia", "Greenland", "Iceland", "Madagascar"], correct: "Greenland", explanation: "Greenland is the largest island. Australia is classified as a continent." },
            { question: "Who is known as the Father of Computers?", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop", options: ["Albert Einstein", "Charles Babbage", "Bill Gates", "Isaac Newton"], correct: "Charles Babbage", explanation: "Charles Babbage designed the first mechanical computer blueprint." },
            { question: "What organ pumps blood through your body?", image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500&auto=format&fit=crop", options: ["Lungs", "Brain", "Heart", "Stomach"], correct: "Heart", explanation: "The heart pumps oxygen-rich blood through your body." },
            { question: "Which is the longest river on Earth?", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop", options: ["Amazon River", "Nile River", "Ganga River", "Mississippi River"], correct: "Nile River", explanation: "The Nile River in Africa is the longest, over 6,650 km!" },
            { question: "Which country has the Taj Mahal?", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop", options: ["India", "Nepal", "Pakistan", "Bangladesh"], correct: "India", explanation: "The Taj Mahal is a beautiful marble monument located in Agra, India." }
        ],
        'hard': [
            { question: "What is the name of our home galaxy?", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop", options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], correct: "Milky Way", explanation: "Our solar system resides inside the Milky Way galaxy." },
            { question: "Who discovered the law of gravity?", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop", options: ["Albert Einstein", "Sir Isaac Newton", "Galileo Galilei", "Marie Curie"], correct: "Sir Isaac Newton", explanation: "Sir Isaac Newton formulated gravity and the laws of motion." },
            { question: "Which atmospheric layer absorbs harmful UV rays?", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&auto=format&fit=crop", options: ["Ozone Layer", "Troposphere", "Ionosphere", "Mesosphere"], correct: "Ozone Layer", explanation: "The Ozone Layer in the stratosphere blocks dangerous UV rays." },
            { question: "Which country launched the first artificial satellite, Sputnik 1, into space?", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop", options: ["United States", "Soviet Union (USSR)", "Germany", "United Kingdom"], correct: "Soviet Union (USSR)", explanation: "Sputnik 1 was launched by the Soviet Union in 1957." },
            { question: "What particles form the nucleus of an atom?", image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop", options: ["Electrons and Protons", "Protons and Neutrons", "Electrons and Neutrons", "Protons only"], correct: "Protons and Neutrons", explanation: "The nucleus is made of protons and neutrons, circled by electrons." },
            { question: "How many planets have ring systems?", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop", options: ["1", "2", "4", "0"], correct: "4", explanation: "Saturn, Jupiter, Uranus, and Neptune all have rings!" },
            { question: "Which is the smallest state in India by area?", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop", options: ["Goa", "Sikkim", "Tripura", "Kerala"], correct: "Goa", explanation: "Goa is the smallest Indian state by area, famous for its beaches." },
            { question: "What is the primary source of energy for the Earth?", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop", options: ["The Moon", "Coal", "The Sun", "Wind"], correct: "The Sun", explanation: "The Sun provides the energy for almost all life on Earth." },
            { question: "Which gas makes up most of Earth's atmosphere?", image: "https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=500&auto=format&fit=crop", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correct: "Nitrogen", explanation: "Nitrogen gas makes up about 78% of the air we breathe." },
            { question: "Who invented the telephone?", image: "https://images.unsplash.com/photo-1520923642038-b4a53cbd00ab?w=500&auto=format&fit=crop", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "James Watt"], correct: "Alexander Graham Bell", explanation: "Alexander Graham Bell invented the telephone in 1876." }
        ]
    }
};

// ============================================================================
// SMALL CHILDREN CLASSIC GAMES DATABASES (RESTORED)
// ============================================================================
const NUMBER_IMAGES = {
    1: 'one.jpg', 2: 'two.jpg', 3: 'three.jpg', 4: 'four.jpg', 5: 'five.jpg',
    6: 'six.jpg', 7: 'seven.jpg', 8: 'eight.jpg', 9: '9.jpg', 10: '10.jpg',
    11: 'eleven.jpg', 15: 'fiveteen.jpg', 16: 'sixteen.jpg', 20: 'twenty.jpg'
};

const LEVELS = {
    easy: { id: 'easy', label: 'Easy', emoji: '🌱', color: '#00b894', hint: 'Numbers 0–20 · Short words · Simple colors & shapes', min: 0, max: 20, countMin: 1, countMax: 10, addMax: 10, questionsEasy: 8 },
    middle: { id: 'middle', label: 'Middle', emoji: '⭐', color: '#fdcb6e', hint: 'Numbers 21–50 · Medium words · Trickier odd-one-out', min: 21, max: 50, countMin: 11, countMax: 50, addMax: 50, questionsEasy: 9 },
    medium: { id: 'middle', label: 'Middle', emoji: '⭐', color: '#fdcb6e', hint: 'Numbers 21–50 · Medium words · Trickier odd-one-out', min: 21, max: 50, countMin: 11, countMax: 50, addMax: 50, questionsEasy: 9 },
    hard: { id: 'hard', label: 'Hard', emoji: '🔥', color: '#e17055', hint: 'Numbers 51–100 · Long words · Hard rhymes & colors', min: 51, max: 100, countMin: 51, countMax: 100, addMax: 100, questionsEasy: 10 }
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

const AVAILABLE_NUMBERS = Object.keys(NUMBER_IMAGES).map(Number);

const EMOJI_FOR_COUNT = [
    '🐶', '🐱', '🐻', '🦊', '🐸', '🐰', '🐝', '🦋', '🐞', '🐢',
    '🚗', '🚌', '🚲', '✈️', '🚀', '🛶', '🎈', '🎁', '🎨', '⚽',
    '🍎', '🍌', '🍇', '🥭', '🍕', '🍰', '🧁', '🍭', '🌸', '🌻',
    '⭐', '🌙', '☀️', '🌈', '❤️', '💎', '🎵', '📚', '✏️', '🧸'
];

const QUESTIONS_PER_ROUND = 20;

const GAMES = [
    { id: 'count-pick', title: 'Count & Pick', emoji: '🔢', color: '#FF6B9D', description: 'Count pictures, pick the number!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'count-images' },
    { id: 'number-words', title: 'Number Words', emoji: '📝', color: '#4ECDC4', description: 'Count and tap the right word!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'number-words' },
    { id: 'picture-spell', title: 'Picture Spelling', emoji: '🖼️', color: '#FFE66D', description: 'Pick the correct spelling!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'picture-spell' },
    { id: 'color-fun', title: 'Color Fun', emoji: '🎨', color: '#A78BFA', description: 'What color is it?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'color-fun' },
    { id: 'bigger-smaller', title: 'More or Less', emoji: '⚖️', color: '#FB923C', description: 'Which side has MORE?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'bigger-smaller' },
    { id: 'add-fun', title: 'Add It Up', emoji: '➕', color: '#F472B6', description: 'Add the numbers together!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'add-fun' },
    { id: 'before-after', title: 'Before & After', emoji: '🔜', color: '#34D399', description: 'What number comes next?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'before-after' },
    { id: 'odd-one-out', title: 'Odd One Out', emoji: '🔍', color: '#60A5FA', description: 'Find the one that is different!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'odd-one-out' },
    { id: 'shape-match', title: 'Shape Match', emoji: '⬛', color: '#FBBF24', description: 'Match the shape name!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'shape-match' },
    { id: 'rhyme-time', title: 'Rhyme Time', emoji: '🎵', color: '#C084FC', description: 'Which word rhymes?', questionsPerRound: QUESTIONS_PER_ROUND, type: 'rhyme-time' },
    { id: 'number-speak', title: 'Number Speak', emoji: '🔊', color: '#FFB400', description: 'Listen to the number and choose the correct one!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'number-speak' },
    { id: 'speak-spell', title: 'Speak & Spell', emoji: '🗣️', color: '#10B981', description: 'See the picture, say the spelling out loud!', questionsPerRound: QUESTIONS_PER_ROUND, type: 'speak-spell' }
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
    { levels: ['hard'], shape: '⯃', name: 'octagon', wrong: ['hexagon', 'pentagon', 'circle'] }
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
    { levels: ['hard'], word: 'rain', picture: '🌧️', rhyme: 'train', wrong: ['pain', 'main', 'brain'] },
    { levels: ['hard'], word: 'light', picture: '💡', rhyme: 'night', wrong: ['bright', 'fight', 'kite'] },
    { levels: ['hard'], word: 'bear', picture: '🐻', rhyme: 'chair', wrong: ['hair', 'fair', 'stair'] }
];

const ODD_ONE_SETS = [
    { levels: ['easy'], items: ['🐶', '🐱', '🐻', '🚗'], odd: '🚗' },
    { levels: ['easy'], items: ['🍎', '🍌', '🍇', '⚽'], odd: '⚽' },
    { levels: ['easy'], items: ['🚗', '🚌', '🚲', '🐸'], odd: '🐸' },
    { levels: ['easy'], items: ['⭐', '🌙', '☀️', '🐶'], odd: '🐶' },
    { levels: ['middle'], items: ['📚', '✏️', '📐', '🍕'], odd: '🍕' },
    { levels: ['middle'], items: ['🐝', '🦋', '🐞', '🚗'], odd: '🚗' },
    { levels: ['middle'], items: ['❤️', '💙', '💚', '🎈'], odd: '🎈' },
    { levels: ['hard'], items: ['🥕', '🥦', '🌽', '✈️'], odd: '✈️' },
    { levels: ['hard'], items: ['🐧', '🐧', '🐧', '🌈'], odd: '🌈' },
    { levels: ['hard'], items: ['🍰', '🧁', '🍭', '🚌'], odd: '🚌' }
];

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
    'number-speak': { easy: 'Listen 0–20', middle: 'Listen 21–50', hard: 'Listen 51–100' },
    'speak-spell': { easy: '3–4 letter spellings', middle: '5–7 letter spellings', hard: 'Long spellings' }
};

function poolForLevel(pool, lvl) {
    const key = lvl === 'medium' ? 'middle' : lvl;
    const tagged = pool.filter(q => q.levels && q.levels.includes(key));
    if (tagged.length >= QUESTIONS_PER_ROUND) return tagged;
    if (key === 'middle') {
        const mid = pool.filter(q => q.levels && (q.levels.includes('middle') || q.levels.includes('easy')));
        if (mid.length >= QUESTIONS_PER_ROUND) return mid;
    }
    return tagged.length ? tagged : pool.filter(q => q.levels && q.levels.includes('easy'));
}

function newRoundSeed() {}
function rand() {
    return Math.random();
}
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function randInt(min, max) { return min + Math.floor(rand() * (max - min + 1)); }
function randFrom(arr) { return arr[Math.floor(rand() * arr.length)]; }

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
        picked.push(randFrom(picked));
    }
    return picked;
}

function numbersInLevel(levelId) {
    const key = levelId === 'medium' ? 'middle' : levelId;
    const L = LEVELS[key];
    const arr = [];
    if (!L) return arr;
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
    return shuffle([...opts]);
}

function makeNumberOption(n) {
    if (NUMBER_IMAGES[n]) {
        return { type: 'image', value: NUMBER_IMAGES[n], answer: String(n) };
    }
    return { type: 'number-badge', value: String(n), answer: String(n) };
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

function repeatEmoji(emoji, n, maxShow = 12) {
    const show = Math.min(n, maxShow);
    const row = Array(show).fill(emoji).join(' ');
    return n > show ? row + ` <span class="many-badge">+${n - show} more!</span>` : row;
}

function formatCountVisual(emoji, count, levelId) {
    if (levelId === 'hard' || count > 20) {
        const tens = Math.floor(count / 10);
        const ones = count % 10;
        let blocks = '';
        for (let t = 0; t < tens; t++) {
            blocks += `<span class="ten-group">${Array(10).fill(emoji).join(' ')}</span>`;
        }
        if (ones) blocks += `<span class="ones-group">${Array(ones).fill(emoji).join(' ')}</span>`;
        return `<div class="group-count">${blocks}</div>`;
    }
    return repeatEmoji(emoji, count);
}

function randNumberInLevel(lvl) {
    const L = LEVELS[lvl];
    return randInt(L.min, L.max);
}
function randCountInLevel(lvl) {
    const L = LEVELS[lvl];
    return randInt(L.countMin, L.countMax);
}

// CLASSIC GAME ROUND BUILDERS
function buildCountRound(lvl) {
    newRoundSeed();
    const items = [];
    const used = new Set();
    while (items.length < QUESTIONS_PER_ROUND) {
        const emoji = randFrom(EMOJI_FOR_COUNT);
        const count = randCountInLevel(lvl);
        const key = `${emoji}-${count}`;
        if (used.has(key)) continue;
        used.add(key);
        items.push({ emoji, count });
    }
    return items.map(q => {
        const opts = pickOptions(q.count, numberPoolAround(q.count, lvl), 4, lvl);
        return {
            prompt: formatCountVisual(q.emoji, q.count, lvl),
            promptType: 'emoji-row',
            options: opts.map(n => makeNumberOption(n)),
            correct: String(q.count)
        };
    });
}

function buildNumberWordsRound(lvl) {
    newRoundSeed();
    const items = [];
    const used = new Set();
    while (items.length < QUESTIONS_PER_ROUND) {
        const emoji = randFrom(EMOJI_FOR_COUNT);
        const count = randCountInLevel(lvl);
        const key = `${emoji}-${count}`;
        if (used.has(key)) continue;
        used.add(key);
        items.push({ emoji, count });
    }
    return items.map(q => {
        const correctWord = numberToWord(q.count);
        const wrongWords = numberPoolAround(q.count, lvl).map(n => numberToWord(n));
        const opts = pickTextOptions(correctWord, wrongWords, 4);
        return {
            prompt: formatCountVisual(q.emoji, q.count, lvl),
            promptType: 'emoji-row',
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: correctWord
        };
    });
}

function buildSpellRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(SPELL_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.word);
    return picked.map(q => {
        const opts = pickTextOptions(q.word, q.wrong, 4);
        return {
            prompt: q.picture,
            promptType: 'big-emoji',
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.word
        };
    });
}

function buildColorRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(COLOR_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.item + q.color);
    return picked.map(q => {
        const opts = shuffle(q.options);
        return {
            prompt: q.item,
            promptType: 'big-emoji',
            options: opts.map(c => ({ type: 'color-chip', value: c, answer: c, colorName: c })),
            correct: q.color
        };
    });
}

function buildCompareRound(lvl) {
    newRoundSeed();
    const items = [];
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const emoji = randFrom(EMOJI_FOR_COUNT);
        const a = randCountInLevel(lvl);
        let b = randCountInLevel(lvl);
        if (b === a) b = a + 1;
        items.push({ emoji, a, b });
    }
    return items.map(q => {
        let correct = q.a > q.b ? 'left' : 'right';
        return {
            promptType: 'compare',
            left: { text: repeatEmoji(q.emoji, q.a, 10), count: q.a },
            right: { text: repeatEmoji(q.emoji, q.b, 10), count: q.b },
            options: [
                { type: 'compare-btn', value: 'left', label: '← Left', answer: 'left' },
                { type: 'compare-btn', value: 'right', label: 'Right →', answer: 'right' }
            ],
            correct
        };
    });
}

function buildAddRound(lvl) {
    newRoundSeed();
    const items = [];
    const maxVal = LEVELS[lvl].addMax;
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const sum = randInt(2, maxVal);
        const a = randInt(1, sum - 1);
        const b = sum - a;
        items.push({ a, b, sum });
    }
    return items.map(q => {
        const opts = pickOptions(q.sum, numberPoolAround(q.sum, lvl), 4, lvl);
        return {
            prompt: `<span class="math-line">${q.a} + ${q.b} = ?</span>`,
            promptType: 'math-big',
            options: opts.map(n => makeNumberOption(n)),
            correct: String(q.sum)
        };
    });
}

function buildBeforeAfterRound(lvl) {
    newRoundSeed();
    const items = [];
    const minVal = LEVELS[lvl].min;
    const maxVal = LEVELS[lvl].max;
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const n = randInt(minVal + 1, maxVal - 1);
        const mode = Math.random() > 0.5 ? 'after' : 'before';
        const answer = mode === 'after' ? n + 1 : n - 1;
        items.push({ n, mode, answer });
    }
    return items.map(q => {
        const label = q.mode === 'after' ? `What comes AFTER ${q.n}?` : `What comes BEFORE ${q.n}?`;
        const opts = pickOptions(q.answer, numberPoolAround(q.answer, lvl), 4, lvl);
        return {
            prompt: `<span class="number-huge">${q.n}</span>`,
            promptType: 'math-big',
            sublabel: label,
            options: opts.map(n => makeNumberOption(n)),
            correct: String(q.answer)
        };
    });
}

function buildOddOneRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(ODD_ONE_SETS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.odd);
    return picked.map(q => {
        const shuffled = shuffle(q.items);
        return {
            promptType: 'odd-grid',
            items: shuffled,
            sublabel: 'Which one is different?',
            options: shuffled.map(emoji => ({ type: 'emoji-btn', value: emoji, answer: emoji })),
            correct: q.odd
        };
    });
}

function buildShapeRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(SHAPE_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.name);
    return picked.map(q => {
        const wrongList = pool.filter(s => s.name !== q.name).map(s => s.name);
        const opts = pickTextOptions(q.name, wrongList, 4);
        return {
            prompt: q.shape,
            promptType: 'shape-big',
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.name
        };
    });
}

function buildRhymeRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(RHYME_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.word);
    return picked.map(q => {
        const opts = pickTextOptions(q.rhyme, q.wrong, 4);
        return {
            prompt: q.picture,
            promptType: 'big-emoji',
            sublabel: `What rhymes with "${q.word}"?`,
            options: opts.map(w => ({ type: 'text', value: w, answer: w })),
            correct: q.rhyme
        };
    });
}

function buildNumberSpeakRound(lvl) {
    newRoundSeed();
    const used = new Set();
    const items = [];
    const minVal = LEVELS[lvl].min;
    const maxVal = LEVELS[lvl].max;
    const rangeSize = maxVal - minVal + 1;
    while (items.length < QUESTIONS_PER_ROUND) {
        const n = randNumberInLevel(lvl);
        if (rangeSize >= QUESTIONS_PER_ROUND) {
            const key = `ns-${n}`;
            if (used.has(key)) continue;
            used.add(key);
        }
        items.push({ count: n });
    }
    return items.map(q => {
        const opts = pickOptions(q.count, numberPoolAround(q.count, lvl), 4, lvl);
        return {
            prompt: '',
            promptType: 'math-big',
            audioText: String(q.count),
            options: opts.map(n => makeNumberOption(n)),
            correct: String(q.count),
            sublabel: 'Click Aiko to hear the number! 🔊'
        };
    });
}

function buildSpeakSpellRound(lvl) {
    newRoundSeed();
    const pool = poolForLevel(SPELL_QUESTIONS, lvl);
    const picked = pickUniqueFromPool(pool, QUESTIONS_PER_ROUND, q => q.word);
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

// BIG CHILDREN ROUND BUILDER FOR ABACUS VISUALIZATION
function buildAbacusVisRound(classDivision, difficulty) {
    newRoundSeed();
    const items = [];
    const used = new Set();
    
    // Ranges: Easy (1-9), Medium (10-99), Hard (100-999)
    const minVal = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 10 : 100;
    const maxVal = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 99 : 999;
    const rangeSize = maxVal - minVal + 1;

    while (items.length < QUESTIONS_PER_ROUND) {
        const val = randInt(minVal, maxVal);
        if (rangeSize >= QUESTIONS_PER_ROUND) {
            if (used.has(val)) continue;
            used.add(val);
        }
        items.push(val);
    }

    return items.map(n => {
        const pool = [];
        const spread = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 10 : 20;
        for (let i = Math.max(minVal, n - spread); i <= Math.min(maxVal, n + spread); i++) {
            if (i !== n) pool.push(i);
        }
        if (pool.length < 3) {
            for (let i = minVal; i <= maxVal; i++) {
                if (i !== n && !pool.includes(i)) pool.push(i);
            }
        }
        
        const shuffledPool = shuffle(pool);
        const selectedDecoys = shuffledPool.slice(0, 3);
        const opts = shuffle([n, ...selectedDecoys]);
        
        return {
            promptType: 'abacus-vis',
            correct: String(n),
            options: opts.map(val => ({ type: 'number-badge', value: String(val), answer: String(val) })),
            sublabel: "Look at the abacus beads inside the box. What number is represented?"
        };
    });
}

const CLASSIC_BUILDERS = {
    'count-images': buildCountRound,
    'number-words': buildNumberWordsRound,
    'picture-spell': buildSpellRound,
    'color-fun': buildColorRound,
    'bigger-smaller': buildCompareRound,
    'add-fun': buildAddRound,
    'before-after': buildBeforeAfterRound,
    'odd-one-out': buildOddOneRound,
    'shape-match': buildShapeRound,
    'rhyme-time': buildRhymeRound,
    'number-speak': buildNumberSpeakRound,
    'speak-spell': buildSpeakSpellRound
};

// ============================================================================
// EXPORTS TO WINDOW GLOBAL CONTEXT
// ============================================================================
window.DIGIT_TEMPLATES = DIGIT_TEMPLATES;
window.recognizeDigit = recognizeDigit;
window.generateAbacusQuestion = generateAbacusQuestion;
window.GK_QUESTIONS = GK_QUESTIONS;

window.LEVELS = LEVELS;
window.LEVEL_ORDER = LEVEL_ORDER;
window.GAMES = GAMES;
window.CLASSIC_BUILDERS = CLASSIC_BUILDERS;
window.GAME_LEVEL_LABELS = GAME_LEVEL_LABELS;
window.NUMBER_WORDS_STATIC = NUMBER_WORDS_STATIC;
window.numberToWord = numberToWord;
window.buildAbacusVisRound = buildAbacusVisRound;
window.buildNumberSpeakRound = buildNumberSpeakRound;
window.buildSpeakSpellRound = buildSpeakSpellRound;
window.QUESTIONS_PER_ROUND = QUESTIONS_PER_ROUND;
window.numberPoolAround = numberPoolAround;
window.pickOptions = pickOptions;
window.makeNumberOption = makeNumberOption;
window.pickTextOptions = pickTextOptions;
window.randInt = randInt;
