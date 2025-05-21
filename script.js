// script.js
// Language Quiz App - Logic Only, UI dynamically loaded, themes/questions auto-detected

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
const container = document.querySelector('.container');
const quizContainer = document.createElement('div');
quizContainer.className = 'quiz-container';
container.appendChild(quizContainer);

// Languages (should match your folder names under /data/)
const languages = {
    'Gujarati': 'Gujarati',
    'Punjabi': 'Punjabi',
    'Hindi': 'Hindi',
    'Spanish': 'Spanish'
};

// App entry
document.addEventListener('DOMContentLoaded', () => {
    loadLanguageSelection();
});

// ---- STEP 1: Language Selection ----
function loadLanguageSelection() {
    quizContainer.innerHTML = `
        <h1>Select Language</h1>
        <div class="language-options">
            ${Object.keys(languages).map(lang => `
                <button class="btn btn-primary language-btn" data-lang="${languages[lang]}">${lang}</button>
            `).join('')}
        </div>
    `;
    quizContainer.style.display = 'block';
    currentState.language = null;
    currentState.skill = null;
    currentState.theme = null;
    currentState.questions = [];
    currentState.currentQuestionIndex = 0;
    currentState.score = 0;

    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentState.language = e.target.dataset.lang;
            loadSkillSelection();
        });
    });
}

// ---- STEP 2: Skill Selection ----
function loadSkillSelection() {
    quizContainer.innerHTML = `
        <h1>Select Skill</h1>
        <div class="skill-options">
            <button class="btn btn-primary" id="reading-btn">Reading</button>
            <button class="btn btn-primary" id="speaking-btn">Speaking</button>
            <button class="btn btn-secondary" id="back-btn">Back</button>
        </div>
    `;
    document.getElementById('reading-btn').onclick = () => {
        currentState.skill = 'Reading';
        loadThemeSelection();
    };
    document.getElementById('speaking-btn').onclick = () => {
        currentState.skill = 'Speaking';
        loadThemeSelection();
    };
    document.getElementById('back-btn').onclick = loadLanguageSelection;
}

// ---- STEP 3: Theme Selection (Dynamic) ----
async function loadThemeSelection() {
    quizContainer.innerHTML = `<h1>Loading themes...</h1>`;
    // Attempt to fetch themes dynamically from your folder structure (data/{language}/{skill}/)
    try {
        const themeList = await fetchThemeFolders(currentState.language, currentState.skill);
        if (!themeList || themeList.length === 0) {
            quizContainer.innerHTML = `
                <h1>No Themes Found</h1>
                <button class="btn btn-secondary" id="back-btn">Back</button>
            `;
            document.getElementById('back-btn').onclick = loadSkillSelection;
            return;
        }
        quizContainer.innerHTML = `
            <h1>Select Theme</h1>
            <div class="theme-options">
                ${themeList.map(theme => `
                    <button class="btn btn-primary theme-btn" data-theme="${theme}">${theme.replace(/_/g, ' ')}</button>
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
        document.getElementById('back-btn').onclick = loadSkillSelection;
    } catch (e) {
        quizContainer.innerHTML = `
            <h1>Error loading themes.</h1>
            <button class="btn btn-secondary" id="back-btn">Back</button>
        `;
        document.getElementById('back-btn').onclick = loadSkillSelection;
    }
}

// Helper: Try to fetch list of theme folders using GitHub API or server-side support
async function fetchThemeFolders(language, skill) {
    // If hosted on a server, implement a backend endpoint to list folders under /data/{language}/{skill}/
    // For GitHub Pages: Cannot list directories directly. You must maintain a manifest file (e.g. themes.json)
    try {
        // Try to fetch a manifest file first
        const manifestUrl = `data/${language}/${skill}/themes.json`;
        const resp = await fetch(manifestUrl);
        if (resp.ok) {
            const json = await resp.json();
            return json.themes;
        }
    } catch (e) {
        // fallback below if no manifest
    }
    // Fallback (hardcoded themes, update as needed)
    const fallbackThemes = {
        'Reading': ['Word_Formation', 'Letter_Recognition'],
        'Speaking': ['Vocabulary', 'Pronunciation']
    };
    return fallbackThemes[skill] || [];
}

// ---- STEP 4: Load Quiz (Questions) ----
async function loadQuiz() {
    quizContainer.innerHTML = `<h1>Loading quiz...</h1>`;
    try {
        const qUrl = `data/${currentState.language}/${currentState.skill}/${currentState.theme}/questions.json`;
        const resp = await fetch(qUrl);
        if (!resp.ok) throw new Error('Questions not found');
        currentState.questions = await resp.json();
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        renderQuestion();
    } catch (error) {
        quizContainer.innerHTML = `
            <h1>Error loading questions.</h1>
            <button class="btn btn-secondary" id="back-btn">Back</button>
        `;
        document.getElementById('back-btn').onclick = loadThemeSelection;
    }
}

// ---- STEP 5: Render Question ----
function renderQuestion() {
    const question = currentState.questions[currentState.currentQuestionIndex];
    quizContainer.innerHTML = `
        <div class="question-container">
            <div class="question-header">
                <h2 id="question-text">${question.questionText}</h2>
                ${question.audio ? `
                    <button class="audio-btn" id="play-audio">
                        <img src="assets/icons/volume.svg" alt="Play audio">
                    </button>
                ` : ''}
            </div>
            <div class="options-container" id="options-container">
                ${question.options.map((option, idx) => `
                    <button class="option-btn" data-idx="${idx}">${option.text}</button>
                `).join('')}
            </div>
            <div class="feedback" id="feedback" style="display:none;"></div>
        </div>
        <div class="navigation">
            <button class="btn btn-secondary" id="back-btn">Back</button>
            <button class="btn btn-primary" id="next-btn" disabled>Next</button>
        </div>
    `;
    // Option listeners
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx, 10);
            checkAnswer(question.options[idx].correct, question.options[idx].explanation, e.target);
        });
    });
    // Audio
    if (question.audio) {
        const audioBtn = document.getElementById('play-audio');
        const audio = new Audio(question.audio);
        audioBtn.onclick = () => {
            audio.currentTime = 0;
            audio.play();
        };
        audio.play();
    }
    // Navigation
    document.getElementById('back-btn').onclick = loadThemeSelection;
    document.getElementById('next-btn').onclick = nextQuestion;
}

// ---- STEP 6: Check Answer ----
function checkAnswer(isCorrect, explanation, clickedBtn) {
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const optionBtns = document.querySelectorAll('.option-btn');
    // Disable all
    optionBtns.forEach(btn => btn.disabled = true);
    // Mark correct/incorrect
    optionBtns.forEach(btn => {
        if (btn.textContent === currentState.questions[currentState.currentQuestionIndex].options.find(opt => opt.correct).text) {
            btn.classList.add('correct');
        } else if (btn === clickedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    // Feedback
    feedback.textContent = explanation;
    feedback.classList.remove('correct', 'incorrect');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedback.style.display = 'block';
    // Score
    if (isCorrect) currentState.score++;
    // Enable next
    nextBtn.disabled = false;
}

// ---- STEP 7: Next Question or Results ----
function nextQuestion() {
    currentState.currentQuestionIndex++;
    if (currentState.currentQuestionIndex < currentState.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

// ---- STEP 8: Show Results ----
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
    document.getElementById('restart-btn').onclick = () => {
        currentState.currentQuestionIndex = 0;
        currentState.score = 0;
        renderQuestion();
    };
    document.getElementById('new-theme-btn').onclick = loadThemeSelection;
    document.getElementById('main-menu-btn').onclick = loadLanguageSelection;
}
