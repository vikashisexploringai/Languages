// App state
let currentState = {
    language: null,
    skill: null,
    theme: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0
};

// DOM elements
const languageContainer = document.getElementById('language-container');
const quizContainer = document.createElement('div');
quizContainer.className = 'quiz-container';
document.querySelector('.container').appendChild(quizContainer);

// Available languages and their paths
const languages = {
    'Gujarati': 'Gujarati',
    'Punjabi': 'Punjabi',
    'Hindi': 'Hindi',
    'Spanish': 'Spanish'
};

// Initialize the app
function init() {
    loadLanguageSelection();
}

// Load language selection screen
function loadLanguageSelection() {
    languageContainer.innerHTML = '';
    quizContainer.style.display = 'none';
    
    Object.entries(languages).forEach(([langName, langPath]) => {
        const langCard = document.createElement('div');
        langCard.className = 'language-card';
        langCard.textContent = langName;
        langCard.addEventListener('click', () => {
            currentState.language = langPath;
            loadSkillSelection();
        });
        languageContainer.appendChild(langCard);
    });
}

// Load skill selection (Reading/Speaking)
function loadSkillSelection() {
    quizContainer.innerHTML = `
        <h1>Select Skill</h1>
        <div class="skill-options">
            <button class="btn btn-primary" id="reading-btn">Reading</button>
            <button class="btn btn-primary" id="speaking-btn">Speaking</button>
            <button class="btn btn-secondary" id="back-btn">Back</button>
        </div>
    `;
    quizContainer.style.display = 'block';
    
    document.getElementById('reading-btn').addEventListener('click', () => {
        currentState.skill = 'Reading';
        loadThemeSelection();
    });
    
    document.getElementById('speaking-btn').addEventListener('click', () => {
        currentState.skill = 'Speaking';
        loadThemeSelection();
    });
    
    document.getElementById('back-btn').addEventListener('click', loadLanguageSelection);
}

// Load theme selection (Word Formation, Letter Recognition, etc.)
function loadThemeSelection() {
    // Themes would vary by language and skill
    const themes = {
        'Reading': ['Word_Formation', 'Letter_Recognition'],
        'Speaking': ['Vocabulary', 'Pronunciation']
    };
    
    quizContainer.innerHTML = `
        <h1>Select Theme</h1>
        <div class="theme-options" id="theme-container">
            ${themes[currentState.skill].map(theme => `
                <button class="btn btn-primary theme-btn" data-theme="${theme}">
                    ${theme.replace('_', ' ')}
                </button>
            `).join('')}
            <button class="btn btn-secondary" id="back-btn">Back</button>
        </div>
    `;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentState.theme = e.target.dataset.theme;
            loadQuiz();
        });
    });
    
    document.getElementById('back-btn').addEventListener('click', loadSkillSelection);
}

// Load the quiz
async function loadQuiz() {
    try {
        const response = await fetch(`data/${currentState.language}/${currentState.skill}/${currentState.theme}/questions.json`);
        currentState.questions = await response.json();
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        renderQuestion();
    } catch (error) {
        console.error('Error loading quiz:', error);
        quizContainer.innerHTML = `
            <p>Error loading questions. Please try again.</p>
            <button class="btn btn-secondary" id="back-btn">Back</button>
        `;
        document.getElementById('back-btn').addEventListener('click', loadThemeSelection);
    }
}

// Render the current question
function renderQuestion() {
    const question = currentState.questions[currentState.currentQuestionIndex];
    
    quizContainer.innerHTML = `
        <div class="question-container">
            <div class="question-header">
                <h2 id="question-text">${question.questionText}</h2>
                <button class="audio-btn" id="play-audio">
                    <img src="assets/icons/volume.svg" alt="Play audio">
                </button>
            </div>
            <div class="options-container" id="options-container"></div>
            <div class="feedback" id="feedback"></div>
        </div>
        <div class="navigation">
            <button class="btn btn-secondary" id="back-btn">Back</button>
            <button class="btn btn-primary" id="next-btn" disabled>Next</button>
        </div>
    `;
    
    // Add options
    const optionsContainer = document.getElementById('options-container');
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option.text;
        optionBtn.addEventListener('click', () => checkAnswer(option.correct, option.explanation));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Set up audio
    const audioBtn = document.getElementById('play-audio');
    const audio = new Audio(`data/${currentState.language}/${currentState.skill}/${currentState.theme}/audio/q${currentQuestionIndex + 1}.mp3`);
    
    audioBtn.addEventListener('click', () => {
        audio.currentTime = 0;
        audio.play();
    });
    
    // Auto-play question audio
    audio.play();
    
    // Navigation
    document.getElementById('back-btn').addEventListener('click', loadThemeSelection);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
}

// Check the selected answer
function checkAnswer(isCorrect, explanation) {
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const optionBtns = document.querySelectorAll('.option-btn');
    
    // Disable all options
    optionBtns.forEach(btn => {
        btn.disabled = true;
    });
    
    // Mark correct/incorrect
    optionBtns.forEach(btn => {
        if (btn.textContent === currentState.questions[currentState.currentQuestionIndex].options.find(opt => opt.correct).text) {
            btn.classList.add('correct');
        } else if (btn.classList.contains('selected')) {
            btn.classList.add('incorrect');
        }
    });
    
    // Show feedback
    feedback.textContent = explanation;
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedback.style.display = 'block';
    
    // Enable next button
    nextBtn.disabled = false;
    
    // Update score
    if (isCorrect) {
        currentState.score++;
    }
}

// Move to next question or show results
function nextQuestion() {
    currentState.currentQuestionIndex++;
    
    if (currentState.currentQuestionIndex < currentState.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

// Show quiz results
function showResults() {
    quizContainer.innerHTML = `
        <div class="results-container">
            <h2>Quiz Completed!</h2>
            <p>Your score: ${currentState.score}/${currentState.questions.length}</p>
            <button class="btn btn-primary" id="restart-btn">Restart Quiz</button>
            <button class="btn btn-secondary" id="new-theme-btn">Choose New Theme</button>
            <button class="btn btn-secondary" id="main-menu-btn">Main Menu</button>
        </div>
    `;
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        renderQuestion();
    });
    
    document.getElementById('new-theme-btn').addEventListener('click', loadThemeSelection);
    document.getElementById('main-menu-btn').addEventListener('click', loadLanguageSelection);
}

// Initialize the app
init();
