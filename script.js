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
const skillContainer = document.getElementById('skill-container');
const themeContainer = document.getElementById('theme-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');

// Available languages
const languages = ['Gujarati', 'Punjabi', 'Hindi', 'Spanish', 'French'];

// Initialize the app
function init() {
    // Set initial UI state
    showSection('language-container');
    loadLanguageSelection();
}

// Show specific section and hide others
function showSection(sectionId) {
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Load language selection screen
function loadLanguageSelection() {
    languageContainer.innerHTML = '<h1>Choose Your Language</h1>';
    
    languages.forEach(language => {
        const langBtn = document.createElement('button');
        langBtn.className = 'language-btn';
        langBtn.textContent = language;
        langBtn.addEventListener('click', () => {
            currentState.language = language;
            showSection('skill-container');
            loadSkillSelection();
        });
        languageContainer.appendChild(langBtn);
    });
}

// Load skill selection (Reading/Speaking)
function loadSkillSelection() {
    skillContainer.innerHTML = `
        <h1>Select Skill</h1>
        <div class="skill-options">
            <button class="btn" id="reading-btn">Reading</button>
            <button class="btn" id="speaking-btn">Speaking</button>
            <button class="btn back-btn" id="back-btn">Back</button>
        </div>
    `;
    
    document.getElementById('reading-btn').addEventListener('click', () => {
        currentState.skill = 'Reading';
        showSection('theme-container');
        loadThemeSelection();
    });
    
    document.getElementById('speaking-btn').addEventListener('click', () => {
        currentState.skill = 'Speaking';
        showSection('theme-container');
        loadThemeSelection();
    });
    
    document.getElementById('back-btn').addEventListener('click', () => {
        showSection('language-container');
    });
}

// Load theme selection (Word Formation, Letter Recognition, etc.)
function loadThemeSelection() {
    // Themes would vary by language and skill
    const themes = {
        'Reading': ['Word_Formation', 'Letter_Recognition'],
        'Speaking': ['Vocabulary', 'Pronunciation']
    };
    
    themeContainer.innerHTML = `
        <h1>Select Theme</h1>
        <div class="theme-options" id="theme-options-container">
            ${themes[currentState.skill].map(theme => `
                <button class="btn theme-btn" data-theme="${theme}">
                    ${theme.replace('_', ' ')}
                </button>
            `).join('')}
            <button class="btn back-btn" id="back-btn">Back</button>
        </div>
    `;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentState.theme = e.target.dataset.theme;
            loadQuiz();
        });
    });
    
    document.getElementById('back-btn').addEventListener('click', () => {
        showSection('skill-container');
    });
}

// Load the quiz
async function loadQuiz() {
    showSection('quiz-container');
    quizContainer.innerHTML = '<div class="loading-spinner"></div><p>Loading questions...</p>';
    
    try {
        const response = await fetch(`data/${currentState.language}/${currentState.skill}/${currentState.theme}/questions.json`);
        if (!response.ok) throw new Error('Failed to load questions');
        
        currentState.questions = await response.json();
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        renderQuestion();
    } catch (error) {
        console.error('Error loading quiz:', error);
        quizContainer.innerHTML = `
            <p>Error loading questions. Please try again.</p>
            <button class="btn back-btn" id="back-btn">Back</button>
        `;
        document.getElementById('back-btn').addEventListener('click', () => {
            showSection('theme-container');
        });
    }
}

// Render the current question
function renderQuestion() {
    const question = currentState.questions[currentState.currentQuestionIndex];
    const progress = ((currentState.currentQuestionIndex) / currentState.questions.length) * 100;
    
    quizContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="question-container">
            <h2 id="question-text">${question.question}</h2>
            <div class="options-container" id="options-container"></div>
            <div class="explanation-container hidden" id="explanation-container">
                <h3>Explanation</h3>
                <p id="explanation-text"></p>
                <button class="btn" id="next-btn">Next Question</button>
            </div>
        </div>
    `;
    
    // Add options
    const optionsContainer = document.getElementById('options-container');
    question.choices.forEach((choice, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = choice;
        optionBtn.addEventListener('click', () => checkAnswer(choice, question.answer, question.explanation));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Set up next button
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
}

// Check the selected answer
function checkAnswer(selectedAnswer, correctAnswer, explanation) {
    const options = document.querySelectorAll('.option-btn');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    
    // Disable all options
    options.forEach(btn => {
        btn.disabled = true;
        
        // Highlight correct and incorrect answers
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });
    
    // Update score if correct
    if (selectedAnswer === correctAnswer) {
        currentState.score++;
    }
    
    // Show explanation
    explanationText.textContent = explanation;
    explanationContainer.classList.remove('hidden');
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
    showSection('result-container');
    const percentage = (currentState.score / currentState.questions.length) * 100;
    let performanceText, performanceClass;
    
    if (percentage >= 80) {
        performanceText = "Excellent! You've mastered this topic!";
        performanceClass = "great";
    } else if (percentage >= 60) {
        performanceText = "Good job! You're making great progress!";
        performanceClass = "good";
    } else if (percentage >= 40) {
        performanceText = "Not bad! Keep practicing!";
        performanceClass = "average";
    } else {
        performanceText = "Keep trying! You'll improve with practice!";
        performanceClass = "poor";
    }
    
    resultContainer.innerHTML = `
        <h2>Quiz Completed!</h2>
        <div class="score-display">
            Your score: <span class="score">${currentState.score}</span>/<span class="total">${currentState.questions.length}</span>
        </div>
        <div class="performance-rating ${performanceClass}">
            ${performanceText}
        </div>
        <div class="action-buttons">
            <button class="btn btn-restart" id="restart-btn">Restart Quiz</button>
            <button class="btn btn-new-theme" id="new-theme-btn">Choose New Theme</button>
            <button class="btn btn-new-subject" id="main-menu-btn">Main Menu</button>
        </div>
    `;
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        loadQuiz();
    });
    
    document.getElementById('new-theme-btn').addEventListener('click', () => {
        showSection('theme-container');
    });
    
    document.getElementById('main-menu-btn').addEventListener('click', () => {
        showSection('language-container');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
