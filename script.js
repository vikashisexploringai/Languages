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

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    // Language selection page
    if (document.getElementById('language-container')) {
        initLanguagePage();
    }
    // Theme selection page
    else if (document.getElementById('theme-container')) {
        initThemePage();
    }
    // Quiz page
    else if (document.querySelector('.quiz-container')) {
        initQuizPage();
    }
});

function initLanguagePage() {
    const container = document.getElementById('language-container');
    
    // Clear container
    container.innerHTML = '';
    
    // Populate languages from languageData
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

function initThemePage() {
    const language = sessionStorage.getItem('currentLanguage');
    const themeContainer = document.getElementById('theme-container');
    
    if (language && languageData[language]) {
        const themes = languageData[language].themes;
        
        // Clear previous content
        themeContainer.innerHTML = '';
        
        for (const [themeKey, themeData] of Object.entries(themes)) {
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
    
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function initQuizPage() {
    // Get parameters from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get('language') || sessionStorage.getItem('currentLanguage');
    const theme = urlParams.get('theme') || sessionStorage.getItem('currentTheme');
    
    // Quiz state variables
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let audioElement = new Audio();
    
    // DOM elements
    const questionButton = document.getElementById('question-button');
    const choiceElements = document.querySelectorAll('.choice');
    const feedbackElement = document.querySelector('.feedback');
    const nextButton = document.getElementById('next-button');
    const scoreElement = document.createElement('div');
    scoreElement.className = 'score-display';
    document.querySelector('.quiz-container').prepend(scoreElement);
    
    // Load questions
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            questions = data;
            updateScore();
            loadQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            questionButton.textContent = 'Error loading questions';
            feedbackElement.textContent = 'Please check your data files and try again.';
        });
    
    function loadQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showQuizComplete();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        
        // Set question text (single letter)
        questionButton.textContent = question.question;
        
        // Load choices
        question.choices.forEach((choice, index) => {
            choiceElements[index].textContent = choice;
            choiceElements[index].style.backgroundColor = '#2196F3';
            choiceElements[index].style.pointerEvents = 'auto';
        });
        
        // Load audio and set up question button to play it
        if (question.audio) {
            audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
            playAudio(); // Auto-play when question loads
        }
        
        // Reset feedback
        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
    }
    
    function playAudio() {
        audioElement.play().catch(e => console.log('Audio play failed:', e));
    }
    
    function checkAnswer(selectedIndex) {
        const correctIndex = questions[currentQuestionIndex].choices.indexOf(
            questions[currentQuestionIndex].answer
        );
        
        if (selectedIndex === correctIndex) {
            choiceElements[selectedIndex].style.backgroundColor = '#4CAF50';
            feedbackElement.textContent = 'Correct! ' + questions[currentQuestionIndex].explanation;
            score++;
            updateScore();
        } else {
            choiceElements[selectedIndex].style.backgroundColor = '#f44336';
            choiceElements[correctIndex].style.backgroundColor = '#4CAF50';
            feedbackElement.textContent = 'Incorrect. ' + questions[currentQuestionIndex].explanation;
        }
        
        // Disable further selections
        choiceElements.forEach(choice => {
            choice.style.pointerEvents = 'none';
        });
        
        nextButton.style.display = 'block';
    }
    
    function updateScore() {
        scoreElement.textContent = `Score: ${score}/${currentQuestionIndex}`;
    }
    
    function showQuizComplete() {
        questionButton.textContent = 'Quiz Completed!';
        choiceElements.forEach(el => el.style.display = 'none');
        nextButton.style.display = 'none';
        feedbackElement.textContent = `Final Score: ${score}/${questions.length}`;
        scoreElement.textContent = '';
    }
    
    // Event listeners
    questionButton.addEventListener('click', playAudio);
    
    choiceElements.forEach(el => {
        el.addEventListener('click', function() {
            checkAnswer(parseInt(this.dataset.index));
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
