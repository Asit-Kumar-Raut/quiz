const questions = [
    {
        question: "🐶 🐶 🐶 🐶 🐶 🐶 🐶",
        options: ["six.jpg", "seven.jpg"],
        correctAnswer: "seven.jpg"
    },
    {
        question: "🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗",
        options: ["10.jpg", "9.jpg"],
        correctAnswer: "10.jpg"
    },
    {
        question: "🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭 🥭",
        options: ["twenty.jpg", "sixteen.jpg"],
        correctAnswer: "twenty.jpg"
    },
    {
        question: "👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰",
        options: ["10.jpg", "eleven.jpg"],
        correctAnswer: "eleven.jpg"
    },
    {
        question: "🎨🎨🎨🎨🎨🎨🎨🎨🎨",
        options: ["six.jpg", "9.jpg"],
        correctAnswer: "9.jpg"
    },
    {
        question: "😺😺😺😺",
        options: ["four.jpg", "five.jpg"],
        correctAnswer: "four.jpg"
    },
    {
        question: "👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫👩🏼‍🏫",
        options: ["fiveteen.jpg", "sixteen.jpg"],
        correctAnswer: "fiveteen.jpg"
    },
    {
        question: "🐘🐘🐘🐘🐘🐘🐘",
        options: ["six.jpg", "seven.jpg"],
        correctAnswer: "seven.jpg"
    },
    {
        question: "👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰👩🏻‍🦰",
        options: ["10.jpg", "eleven.jpg"],
        correctAnswer: "eleven.jpg"
    },
    {
        question: "🚗 🚗 🚗",
        options: ["four.jpg", "three.jpg"],
        correctAnswer: "three.jpg"
    }
];

let currentQuestionIndex = 0;
let correctAnswers = 0;

const questionElement = document.getElementById('question');
const option1Img = document.getElementById('option1-img');
const option2Img = document.getElementById('option2-img');
const submitButton = document.getElementById('submit-btn');
const resultsDiv = document.getElementById('results');
const correctCountSpan = document.getElementById('correct-count');
const wrongCountSpan = document.getElementById('wrong-count');
const quizContainer = document.querySelector('.quiz-container');
const restartButton = document.getElementById('restart-btn'); 

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    option1Img.src = currentQuestion.options[0];
    option2Img.src = currentQuestion.options[1];
}

function checkAnswer(selectedOption) {
    const selectedAnswerFullSrc = selectedOption.querySelector('img').src;
    const selectedAnswer = selectedAnswerFullSrc.substring(selectedAnswerFullSrc.lastIndexOf('/') + 1);
    const currentQuestion = questions[currentQuestionIndex];

    if (selectedAnswer === currentQuestion.correctAnswer) {
        correctAnswers++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        submitButton.style.display = 'block'; 
    }
}

function showResults() {
    const wrongAnswers = questions.length - correctAnswers;
    correctCountSpan.textContent = correctAnswers;
    wrongCountSpan.textContent = wrongAnswers;
    quizContainer.style.display = 'none';
    resultsDiv.style.display = 'block';
}

function restartQuiz() {
   
    currentQuestionIndex = 0;
    correctAnswers = 0;

    resultsDiv.style.display = 'none';
    quizContainer.style.display = 'block';
    submitButton.style.display = 'none';

    loadQuestion();
}

loadQuestion();


submitButton.addEventListener('click', showResults);
restartButton.addEventListener('click', restartQuiz);
