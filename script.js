const subjects = {
    'bengali': {
        displayName: 'Bengali',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' }
        }
    },
    'gujarati': {
        displayName: 'Gujarati',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' }
        }
    }
};

// Store selected language and theme
let currentLanguage = '';
let currentTheme = '';

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Language selection page
    if (document.querySelector('.language-choice')) {
        initLanguageSelection();
    }
    // Theme selection page
    else if (document.getElementById('theme-container')) {
        initThemeSelection();
    }
    // Quiz page
    else if (document.querySelector('.quiz-container')) {
        initQuizPage();
    }
});

function initLanguageSelection() {
    const languageChoices = document.querySelectorAll('.language-choice');
    languageChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            currentLanguage = choice.dataset.language;
            window.location.href = 'theme.html';
        });
    });
}

function initThemeSelection() {
    const themeContainer = document.getElementById('theme-container');
    const language = currentLanguage;
    
    if (language && subjects[language]) {
        const themes = subjects[language].themes;
        
        for (const [themeKey, themeData] of Object.entries(themes)) {
            const themeElement = document.createElement('div');
            themeElement.className = 'theme-choice';
            themeElement.dataset.theme = themeKey;
            
            themeElement.innerHTML = `
                <div class="theme-letter">${themeKey.charAt(0).toUpperCase()}</div>
                <div class="theme-name">${themeData.displayName}</div>
            `;
            
            themeElement.addEventListener('click', () => {
                currentTheme = themeKey;
                window.location.href = `quiz.html?language=${language}&theme=${themeKey}`;
            });
            
            themeContainer.appendChild(themeElement);
        }
    }
    
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function initQuizPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get('language');
    const theme = urlParams.get('theme');
    
    let questions = [];
    let currentQuestionIndex = 0;
    let audioElement = new Audio();
    
    // DOM elements
    const questionElement = document.querySelector('.question');
    const choiceElements = document.querySelectorAll('.choice');
    const audioButton = document.querySelector('.audio-button');
    const feedbackElement = document.querySelector('.feedback');
    const nextButton = document.getElementById('next-button');
    
    // Load questions
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            feedbackElement.textContent = 'Error loading questions. Please try again.';
        });
    
    function loadQuestion() {
        if (currentQuestionIndex >= questions.length) {
            questionElement.textContent = 'Quiz Completed!';
            choiceElements.forEach(el => el.style.display = 'none');
            nextButton.style.display = 'none';
            feedbackElement.textContent = `You've completed all ${questions.length} questions!`;
            return;
        }
        
        const question = questions[currentQuestionIndex];
        questionElement.textContent = question.question;
        
        // Load choices
        question.choices.forEach((choice, index) => {
            choiceElements[index].textContent = choice;
        });
        
        // Load audio
        audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
        playAudio();
        
        // Reset feedback and choices
        feedbackElement.textContent = '';
        choiceElements.forEach(el => {
            el.style.backgroundColor = '#2196F3';
            el.style.pointerEvents = 'auto';
        });
    }
    
    function playAudio() {
        audioElement.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Event listeners
    audioButton.addEventListener('click', playAudio);
    
    choiceElements.forEach(el => {
        el.addEventListener('click', () => {
            const selectedIndex = parseInt(el.dataset.index);
            const correctIndex = questions[currentQuestionIndex].choices.indexOf(
                questions[currentQuestionIndex].answer
            );
            
            if (selectedIndex === correctIndex) {
                el.style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = 'Correct! ' + questions[currentQuestionIndex].explanation;
            } else {
                el.style.backgroundColor = '#f44336';
                choiceElements[correctIndex].style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = 'Incorrect. ' + questions[currentQuestionIndex].explanation;
            }
            
            // Disable further selections
            choiceElements.forEach(choice => {
                choice.style.pointerEvents = 'none';
            });
        });
    });
    
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });
    
    document.getElementById('theme-button').addEventListener('click', () => {
        window.location.href = 'theme.html';
    });
}
