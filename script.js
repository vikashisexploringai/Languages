const languageData = {
    'bengali': {
        displayName: 'Bengali',
        sampleChar: 'ব',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' },
            'wordFormation': { displayName: 'Word Formation' }
        }
    },
    'gujarati': {
        displayName: 'Gujarati',
        sampleChar: 'ગ',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' },
            'wordFormation': { displayName: 'Word Formation' }
        }
    },
    'hindi': {
        displayName: 'Hindi',
        sampleChar: 'ह',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' },
            'wordFormation': { displayName: 'Word Formation' }
        }
    },
    'tamil': {
        displayName: 'Tamil',
        sampleChar: 'த',
        themes: {
            'letterRecognition': { displayName: 'Letter Recognition' },
            'wordFormation': { displayName: 'Word Formation' }
        }
    }
    // Add more languages here following the same pattern
};

// Initialization (keep this simple)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('language-container')) initLanguagePage();
    else if (document.getElementById('theme-container')) initThemePage();
    else if (document.querySelector('.quiz-container')) initQuizPage();
});

// Language page initialization
function initLanguagePage() {
    const container = document.getElementById('language-container');
    container.innerHTML = '';
    
    for (const [langCode, langInfo] of Object.entries(languageData)) {
        const langElement = document.createElement('div');
        langElement.className = 'language-choice';
        langElement.dataset.language = langCode;
        langElement.innerHTML = `
            <div class="language-letter">${langInfo.sampleChar}</div>
            <div class="language-name">${langInfo.displayName}</div>
        `;
        langElement.addEventListener('click', () => {
            sessionStorage.setItem('currentLanguage', langCode);
            window.location.href = 'theme.html';
        });
        container.appendChild(langElement);
    }
}

// Theme page initialization
function initThemePage() {
    const language = sessionStorage.getItem('currentLanguage');
    const themeContainer = document.getElementById('theme-container');
    
    if (language && languageData[language]) {
        themeContainer.innerHTML = '';
        for (const [themeKey, themeData] of Object.entries(languageData[language].themes)) {
            const themeElement = document.createElement('div');
            themeElement.className = 'theme-choice';
            themeElement.dataset.theme = themeKey;
            themeElement.innerHTML = `
                <div class="theme-letter">${themeKey.charAt(0).toUpperCase()}</div>
                <div class="theme-name">${themeData.displayName}</div>
            `;
            themeElement.addEventListener('click', () => {
                sessionStorage.setItem('currentTheme', themeKey);
                window.location.href = `quiz.html?language=${language}&theme=${themeKey}`;
            });
            themeContainer.appendChild(themeElement);
        }
    }
    
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Quiz page initialization (single complete implementation)
function initQuizPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get('language') || sessionStorage.getItem('currentLanguage');
    const theme = urlParams.get('theme') || sessionStorage.getItem('currentTheme');
    
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let audioElement = new Audio();
    
    const quizContainer = document.querySelector('.quiz-container');
    const questionButton = document.getElementById('question-button');
    const choiceElements = document.querySelectorAll('.choice');
    const feedbackElement = document.querySelector('.feedback');
    const nextButton = document.getElementById('next-button');
    
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => response.json())
        .then(data => {
            questions = shuffleArray(data);
            loadQuestion(true);
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error:', error);
            questionButton.textContent = '⚠️';
            feedbackElement.textContent = 'Failed to load questions. Please try again.';
        });

    function loadQuestion(initialLoad = false) {
        if (currentQuestionIndex >= questions.length) return showQuizComplete();
        
        const question = questions[currentQuestionIndex];
        questionButton.textContent = question.question;
        
        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
        choiceElements.forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '#2196F3';
        });

        shuffleArray([...question.choices]).forEach((choice, i) => {
            choiceElements[i].textContent = choice;
            choiceElements[i].dataset.originalIndex = question.choices.indexOf(choice);
        });

        if (question.audio) {
            audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
            playAudio();
        }

        if (initialLoad) quizContainer.scrollTo(0, 0);
        else ensureQuestionVisible();
    }

    function ensureQuestionVisible() {
        const questionPos = questionButton.getBoundingClientRect().top;
        const headerOffset = 20;
        const currentScroll = quizContainer.scrollTop;
        if (questionPos < headerOffset) {
            quizContainer.scrollTo({
                top: currentScroll + questionPos - headerOffset,
                behavior: 'smooth'
            });
        }
    }

    function setupEventListeners() {
        questionButton.addEventListener('click', playAudio);
        
        choiceElements.forEach(choice => {
            choice.addEventListener('click', function() {
                const question = questions[currentQuestionIndex];
                const selectedIdx = parseInt(this.dataset.originalIndex);
                const correctIdx = question.choices.indexOf(question.answer);
                
                if (selectedIdx === correctIdx) score++;
                
                this.style.backgroundColor = selectedIdx === correctIdx ? '#4CAF50' : '#f44336';
                choiceElements[correctIdx].style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = (selectedIdx === correctIdx ? 'Correct! ' : 'Incorrect. ') + question.explanation;
                
                choiceElements.forEach(c => c.style.pointerEvents = 'none');
                nextButton.style.display = 'block';
                ensureQuestionVisible();
            });
        });

        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }

    function showQuizComplete() {
        questionButton.textContent = '🎉 Quiz Completed!';
        questionButton.style.fontSize = '3rem';
        choiceElements.forEach(el => el.style.display = 'none');
        nextButton.style.display = 'none';
        feedbackElement.innerHTML = `
            <div class="final-score">Score: ${score}/${questions.length}</div>
            <div class="completion-message">
                ${score/questions.length >= 0.7 ? 'Excellent!' : 'Keep practicing!'}
            </div>
        `;
        quizContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function playAudio() {
        audioElement.play().catch(e => console.log('Audio error:', e));
    }
}
