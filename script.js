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
            
            // Set up event listeners after successful load
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            questionButton.textContent = '⚠️';
            feedbackElement.textContent = 'Error loading questions. Please try again.';
        });
    
    function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showQuizComplete();
        return;
    }

    const question = questions[currentQuestionIndex];
    questionButton.textContent = question.question;

    // Reset UI
    questionButton.style.visibility = 'hidden'; // Hide temporarily
    feedbackElement.textContent = '';
    nextButton.style.display = 'none';

    // Load choices
    question.choices.forEach((choice, index) => {
        choiceElements[index].textContent = choice;
        choiceElements[index].style.backgroundColor = '#2196F3';
        choiceElements[index].style.pointerEvents = 'auto';
    });

    // Load audio
    if (question.audio) {
        audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
        playAudio();
    }

    // Ensure proper positioning
    setTimeout(() => {
        questionButton.style.visibility = 'visible';
        questionButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
        
        // Extra insurance for mobile browsers
        window.scrollTo({
            top: questionButton.offsetTop - 100,
            behavior: 'smooth'
        });
    }, 50);
}
    
    function setupEventListeners() {
    // Configure the next button appearance
    nextButton.innerHTML = '➔'; // Arrow symbol
    nextButton.style.cssText = `
        background-color: #2196F3; /* Blue instead of green */
        color: white;
        border: none;
        border-radius: 50%;
        width: 80px;
        height: 80px;
        font-size: 2.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: none;
        margin: 20px auto;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        position: relative;
        overflow: hidden;
    `;

    // Add hover effect
    nextButton.addEventListener('mouseenter', () => {
        nextButton.style.transform = 'scale(1.1)';
        nextButton.style.backgroundColor = '#1976D2';
        nextButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    });

    nextButton.addEventListener('mouseleave', () => {
        nextButton.style.transform = 'scale(1)';
        nextButton.style.backgroundColor = '#2196F3';
        nextButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    });

    // Add click effect
    nextButton.addEventListener('mousedown', () => {
        nextButton.style.transform = 'scale(0.95)';
    });

    nextButton.addEventListener('mouseup', () => {
        nextButton.style.transform = 'scale(1.1)';
    });

    // Next question functionality
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });

    // Question button audio playback
    questionButton.addEventListener('click', playAudio);

    // Choice selection handlers
    choiceElements.forEach((choice, index) => {
        choice.addEventListener('click', function() {
            // Disable all choices first
            choiceElements.forEach(c => {
                c.style.pointerEvents = 'none';
            });

            const correctIndex = questions[currentQuestionIndex].choices.indexOf(
                questions[currentQuestionIndex].answer
            );

            // Visual feedback
            if (index === correctIndex) {
                this.style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = 'Correct! ' + questions[currentQuestionIndex].explanation;
                score++;
                updateScore();
            } else {
                this.style.backgroundColor = '#f44336';
                choiceElements[correctIndex].style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = 'Incorrect. ' + questions[currentQuestionIndex].explanation;
            }

            // Show next button
            nextButton.style.display = 'block';
            nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // Add hover effects to choices
        choice.addEventListener('mouseenter', () => {
            if (choice.style.pointerEvents !== 'none') {
                choice.style.transform = 'scale(1.05)';
                choice.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
        });

        choice.addEventListener('mouseleave', () => {
            choice.style.transform = 'scale(1)';
            choice.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
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
