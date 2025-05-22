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

 j = Math.floor(Math.random() * (i + 1));
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
    
    // Responsive sizing configuration
    const sizeConfig = {
questionButton.style.padding = qConfig.padding;
    questionButton.style.width = qConfig.width;
    
    // Reset and style choice buttons
    
    
    // Load audio
    if (question.audio) {
        audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
        playAudio();
    }
    
    // Reset UI state
    feedbackElement.textContent = '';
    nextButton.style.display = 'none';
    
    setTimeout(() => {
        questionButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
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

/* function initQuizPage() {
    // Get quiz parameters
    const urlParams = new URLSearchParams(window.location.search);
    const language = urlParams.get('language') || sessionStorage.getItem('currentLanguage');
    const theme = urlParams.get('theme') || sessionStorage.getItem('currentTheme');
    
    // Quiz state variables
    let questions = [];
    let currentQuestionIndex = 0;
    let audioElement = new Audio();
    
    // DOM elements
    const quizContainer = document.querySelector('.quiz-container');
    const questionButton = document.getElementById('question-button');
    const choiceElements = document.querySelectorAll('.choice');
    const feedbackElement = document.querySelector('.feedback');
    const nextButton = document.getElementById('next-button');
    
    // Load questions
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => response.json())
        .then(data => {
            questions = shuffleArray(data);
            setupEventListeners();
            loadQuestion(true); // Initial load with scroll adjustment
        })
        .catch(handleLoadError);

    function loadQuestion(initialLoad = false) {
        if (currentQuestionIndex >= questions.length) {
            return showQuizComplete();
        }

        const question = questions[currentQuestionIndex];
        questionButton.textContent = question.question;
        
        // Reset UI state
        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
        choiceElements.forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '#2196F3';
        });

        // Shuffle and load choices
        shuffleArray([...question.choices]).forEach((choice, i) => {
            choiceElements[i].textContent = choice;
            choiceElements[i].dataset.originalIndex = question.choices.indexOf(choice);
        });

        // Load audio
        if (question.audio) {
            audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
            playAudio();
        }

        // Scroll handling
        if (initialLoad) {
            quizContainer.scrollTo(0, 0);
        } else {
            ensureQuestionVisible();
        }
    }

    function ensureQuestionVisible() {
        const questionPos = questionButton.getBoundingClientRect().top;
        const headerOffset = 20; // Space from top
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
                
                // Visual feedback
                this.style.backgroundColor = selectedIdx === correctIdx ? '#4CAF50' : '#f44336';
                choiceElements[correctIdx].style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = (selectedIdx === correctIdx ? 'Correct! ' : 'Incorrect. ') + question.explanation;
                
                // Disable further selections
                choiceElements.forEach(c => c.style.pointerEvents = 'none');
                nextButton.style.display = 'block';
                
                // Maintain visibility
                ensureQuestionVisible();
            });
        });

        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }

    // Helper functions
    function shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    function playAudio() {
        audioElement.play().catch(console.error);
    }

    function showQuizComplete() {
        questionButton.textContent = '🎉';
        choiceElements.forEach(el => el.style.display = 'none');
        nextButton.style.display = 'none';
        feedbackElement.textContent = 'Quiz completed!';
        quizContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleLoadError(error) {
        console.error('Error:', error);
        questionButton.textContent = '⚠️';
        feedbackElement.textContent = 'Failed to load questions. Please try again.';
    }
            }*/
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
    const quizContainer = document.querySelector('.quiz-container');
    const questionButton = document.getElementById('question-button');
    const choiceElements = document.querySelectorAll('.choice');
    const feedbackElement = document.querySelector('.feedback');
    const nextButton = document.getElementById('next-button');
    
    // Load questions
    fetch(`data/${language}/${theme}/questions.json`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(data => {
            questions = shuffleArray(data);
            setupEventListeners();
            loadQuestion(true);
        })
        .catch(error => {
            console.error('Error:', error);
            questionButton.textContent = '⚠️';
            feedbackElement.textContent = 'Failed to load questions. Please try again.';
        });

    function loadQuestion(initialLoad = false) {
        // Quiz completion check
        if (currentQuestionIndex >= questions.length) {
            return showQuizComplete();
        }

        const question = questions[currentQuestionIndex];
        
        // Update question display
        questionButton.textContent = question.question;
        
        // Reset UI state
        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
        choiceElements.forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.backgroundColor = '#2196F3';
            el.style.display = 'flex'; // Ensure choices are visible
        });

        // Shuffle and load choices
        shuffleArray([...question.choices]).forEach((choice, i) => {
            choiceElements[i].textContent = choice;
            choiceElements[i].dataset.originalIndex = question.choices.indexOf(choice);
        });

        // Load audio
        if (question.audio) {
            audioElement.src = `data/${language}/${theme}/audio/${question.audio}`;
            playAudio();
        }

        // Scroll management
        if (initialLoad) {
            quizContainer.scrollTo(0, 0);
        } else {
            ensureQuestionVisible();
        }
    }

    function ensureQuestionVisible() {
        const questionRect = questionButton.getBoundingClientRect();
        const containerRect = quizContainer.getBoundingClientRect();
        
        if (questionRect.top < containerRect.top + 20) {
            quizContainer.scrollBy({
                top: questionRect.top - containerRect.top - 20,
                behavior: 'smooth'
            });
        }
    }

    function setupEventListeners() {
        // Question audio
        questionButton.addEventListener('click', playAudio);
        
        // Choice selection
        choiceElements.forEach(choice => {
            choice.addEventListener('click', function() {
                const question = questions[currentQuestionIndex];
                const selectedIdx = parseInt(this.dataset.originalIndex);
                const correctIdx = question.choices.indexOf(question.answer);
                
                // Update score if correct
                if (selectedIdx === correctIdx) {
                    score++;
                }
                
                // Visual feedback
                this.style.backgroundColor = selectedIdx === correctIdx ? '#4CAF50' : '#f44336';
                choiceElements[correctIdx].style.backgroundColor = '#4CAF50';
                feedbackElement.textContent = (selectedIdx === correctIdx ? 'Correct! ' : 'Incorrect. ') + question.explanation;
                
                // Lock choices
                choiceElements.forEach(c => c.style.pointerEvents = 'none');
                nextButton.style.display = 'block';
                
                // Maintain visibility
                ensureQuestionVisible();
            });
        });

        // Next question
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            loadQuestion();
        });
    }

    function showQuizComplete() {
        // Update display
        questionButton.textContent = 'Quiz Completed!';
        questionButton.style.fontSize = '3rem';
        choiceElements.forEach(el => el.style.display = 'none');
        nextButton.style.display = 'none';
        
        // Show final score
        feedbackElement.innerHTML = `
            <div class="final-score">
                Your Score: <span>${score}/${questions.length}</span>
            </div>
            <div class="completion-message">
                ${getCompletionMessage(score/questions.length)}
            </div>
        `;
        
        // Scroll to top
        quizContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Helper functions
    function shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    function playAudio() {
        audioElement.play().catch(e => console.log('Audio error:', e));
    }

    function getCompletionMessage(percentage) {
        if (percentage >= 0.8) return 'Excellent work! 🎯';
        if (percentage >= 0.5) return 'Good job! Keep practicing! 👍';
        return 'Keep learning! You\'ll improve! 💪';
    }
    }
