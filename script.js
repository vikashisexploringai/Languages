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
    // Get quiz parameters
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
    
    // Create score display
    const scoreElement = document.createElement('div');
    scoreElement.className = 'score-display';
    document.querySelector('.quiz-container').prepend(scoreElement);
    
    // Load and shuffle questions
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Shuffle the questions array
            questions = shuffleArray(data);
            updateScore();
            loadQuestion();
            
            // Set up event listeners after successful load
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            questionButton.textContent = '⚠️';
            feedbackElement.textContent = 'Error loading questions. Please try again.';
        });
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
function loadQuestion() {
    // Check if quiz is complete
    if (currentQuestionIndex >= questions.length) {
        showQuizComplete();
        return;
    }

    const question = questions[currentQuestionIndex];
    
    // Detect device type
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isTablet = window.matchMedia("(max-width: 1024px)").matches;
    
    // Responsive sizing
    const baseQuestionSize = isMobile ? 6 : isTablet ? 5.5 : 5;
    const baseChoiceSize = isMobile ? 7 : isTablet ? 6.5 : 6;
    
    // Apply responsive styles
    questionButton.style.cssText = `
        font-size: ${baseQuestionSize}rem;
        padding: ${isMobile ? '1.5rem' : '1.25rem'} ${isMobile ? '3rem' : '2.5rem'};
        margin: ${isMobile ? '0.5rem auto' : '1rem auto'};
        min-width: ${isMobile ? '90%' : '80%'};
        max-width: ${isMobile ? '95vw' : '600px'};
    `;
    
    // Apply to all choices
    choiceElements.forEach(choice => {
        choice.style.cssText = `
            font-size: ${baseChoiceSize}rem;
            padding: ${isMobile ? '1.5rem 0' : '1.25rem 0'};
            margin: ${isMobile ? '0.25rem' : '0.5rem'};
            min-width: ${isMobile ? '45%' : '40%'};
            flex: 1 1 auto;
        `;
    });
    
    // Set question content
    questionButton.textContent = question.question;
    
    // Shuffle and load choices
    const shuffledChoices = shuffleArray([...question.choices]);
    shuffledChoices.forEach((choice, index) => {
        choiceElements[index].textContent = choice;
        choiceElements[index].style.backgroundColor = '#2196F3';
        choiceElements[index].style.pointerEvents = 'auto';
        choiceElements[index].dataset.originalIndex = question.choices.indexOf(choice);
    });
    
    // Load and auto-play audio
    if (question.audio) {
        audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
        playAudio();
    }
    
    // Reset UI state
    feedbackElement.textContent = '';
    nextButton.style.display = 'none';
    
    // Ensure proper visibility
    setTimeout(() => {
        questionButton.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
    }, 50);
}
    
    function setupEventListeners() {
        // Question button plays audio
        questionButton.addEventListener('click', playAudio);
        
        // Choice buttons check answers
        choiceElements.forEach(el => {
            el.addEventListener('click', function() {
                const selectedOriginalIndex = parseInt(this.dataset.originalIndex);
                const correctOriginalIndex = questions[currentQuestionIndex].choices.indexOf(
                    questions[currentQuestionIndex].answer
                );
                
                // Visual feedback
                if (selectedOriginalIndex === correctOriginalIndex) {
                    this.style.backgroundColor = '#4CAF50';
                    feedbackElement.textContent = 'Correct! ' + questions[currentQuestionIndex].explanation;
                    score++;
                    updateScore();
                } else {
                    this.style.backgroundColor = '#f44336';
                    // Find and highlight correct choice
                    Array.from(choiceElements).find(choice => 
                        parseInt(choice.dataset.originalIndex) === correctOriginalIndex
                    ).style.backgroundColor = '#4CAF50';
                    feedbackElement.textContent = 'Incorrect. ' + questions[currentQuestionIndex].explanation;
                }
                
                // Disable further selections
                choiceElements.forEach(choice => {
                    choice.style.pointerEvents = 'none';
                });
                
                nextButton.style.display = 'block';
            });
        });
        
        // Next button loads next question
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }
    
    function playAudio() {
        audioElement.play().catch(e => console.log('Audio play failed:', e));
    }
    
    function updateScore() {
        scoreElement.textContent = `Score: ${score}/${currentQuestionIndex}`;
    }
    
    function showQuizComplete() {
        questionButton.textContent = '🎉';
        choiceElements.forEach(el => el.style.display = 'none');
        nextButton.style.display = 'none';
        feedbackElement.textContent = `Final Score: ${score}/${questions.length}`;
        scoreElement.textContent = '';
    }
}
