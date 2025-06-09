

        // --- ELEMENTOS DO DOM ---
        const introModal = document.getElementById('intro-modal');
        const startGameBtn = document.getElementById('start-game-btn');
        const gameContainer = document.getElementById('game-container');
        const questionArea = document.getElementById('question-area');
        const questionTitleEl = document.getElementById('question-title');
        const questionTextEl = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const scoreEl = document.getElementById('score');
        const feedbackPanel = document.getElementById('feedback-panel');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackText = document.getElementById('feedback-text');
        const feedbackActionContainer = document.getElementById('feedback-action-container');
        const endGamePanel = document.getElementById('end-game-panel');
        const endGameTitle = document.getElementById('end-game-title');
        const endGameMessage = document.getElementById('end-game-message');
        const restartGameBtn = document.getElementById('restart-game-btn');
        const reviewMistakesBtn = document.getElementById('review-mistakes-btn');

        // Review Modal Elements
        const reviewModal = document.getElementById('review-modal');
        const reviewCounterEl = document.getElementById('review-counter');
        const reviewQuestionEl = document.getElementById('review-question');
        const reviewCommentEl = document.getElementById('review-comment');
        const prevReviewBtn = document.getElementById('prev-review-btn');
        const nextReviewBtn = document.getElementById('next-review-btn');
        const closeReviewBtn = document.getElementById('close-review-btn');
        const reviewUserAnswerEl = document.getElementById('review-user-answer');
        const reviewCorrectAnswerEl = document.getElementById('review-correct-answer');
        const rankImageEl = document.getElementById('rank-image');


        // --- ESTADO DO JOGO ---
        let questions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        const maxQuestions = 10;
        let incorrectAnswers = [];
        let currentReviewIndex = 0;

        // --- SINTETIZADOR DE SOM ---
        let synth;
        try {
            synth = new Tone.Synth().toDestination();
        } catch (e) {
            console.warn("Tone.js não pôde ser inicializado. O jogo continuará sem som.");
            synth = null;
        }

        // --- FUNÇÕES DO JOGO ---
        
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        async function startGame() {
            introModal.style.display = 'none';
            gameContainer.classList.remove('hidden');
            
            try {
                // 1. Busca o arquivo JSON
                const response = await fetch('questoes.json');
                if (!response.ok) {
                    throw new Error('Não foi possível carregar o banco de questões.');
                }
                // 2. Transforma a resposta em um objeto JavaScript
                const allQuestions = await response.json();

                // 3. O resto do código continua como antes, usando as questões carregadas
                shuffleArray(allQuestions);
                questions = allQuestions.slice(0, maxQuestions);
                
                currentQuestionIndex = 0;
                score = 0;
                incorrectAnswers = [];
                
                endGamePanel.classList.add('hidden');
                feedbackPanel.classList.add('hidden');
                reviewMistakesBtn.classList.add('hidden');
                questionArea.classList.remove('hidden');

                updateScore();
                updateProgress();
                displayQuestion();

            } catch (error) {
                // Em caso de erro ao carregar o arquivo, mostra uma mensagem
                console.error('Erro ao iniciar o jogo:', error);
                questionArea.innerHTML = `<p class="text-red-500">Falha ao carregar os desafios. Por favor, tente recarregar a página.</p>`;
            }
        }

        function displayQuestion() {
            feedbackPanel.classList.add('hidden');
            questionArea.classList.remove('hidden');
            const question = questions[currentQuestionIndex];
            questionTitleEl.textContent = `DESAFIO DE SEGURANÇA #${currentQuestionIndex + 1}`;
            questionTextEl.innerHTML = question.question;

            optionsContainer.innerHTML = '';
            for (const key in question.options) {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'nes-btn w-full text-left p-4';
                optionBtn.innerHTML = `<span class="uppercase">${key})</span> ${question.options[key]}`;
                optionBtn.dataset.answer = key;
                optionBtn.addEventListener('click', checkAnswer);
                optionsContainer.appendChild(optionBtn);
            }
        }

        function checkAnswer(event) {
            questionArea.classList.add('hidden');
            const selectedAnswer = event.currentTarget.dataset.answer;
            const correctAnswer = questions[currentQuestionIndex].correctAnswer;
            
            if (selectedAnswer === correctAnswer) {
                handleCorrectAnswer();
            } else {
                handleIncorrectAnswer(selectedAnswer);
            }
        }

        function handleCorrectAnswer() {
            score++;
            playSound('C5', '8n');
            feedbackTitle.textContent = 'ACESSO CONCEDIDO! VULNERABILIDADE CORRIGIDA.';
            feedbackText.innerHTML = 'Excelente trabalho, agente! A rede está mais segura.';
            feedbackPanel.style.borderColor = '#00ff41';
            feedbackPanel.style.boxShadow = '0 0 15px #00ff41';
            feedbackPanel.style.color = '#7CFC00';
            feedbackPanel.style.textShadow = '0 0 5px #00ff41';
            
            feedbackActionContainer.innerHTML = '';
            
            feedbackPanel.classList.remove('hidden');
            updateScore();
            setTimeout(nextQuestion, 2000);
        }

function handleIncorrectAnswer(userAnswer) { // Recebe a resposta do usuário
    playSound('C3', '8n');
    
    // Agora salvamos um objeto com a pergunta E a resposta do usuário
    incorrectAnswers.push({ 
        question: questions[currentQuestionIndex], 
        userAnswer: userAnswer 
    });

    feedbackTitle.textContent = 'ACESSO NEGADO! FALHA NA DEFESA.';
    // ... resto da função continua igual ...
    feedbackText.innerHTML = `<strong>Análise da Ameaça:</strong><br>${questions[currentQuestionIndex].comment}`;
    feedbackPanel.style.borderColor = '#ff073a';
    feedbackPanel.style.boxShadow = '0 0 15px #ff073a';
    feedbackPanel.style.color = '#ff9d9d';
    feedbackPanel.style.textShadow = '0 0 5px #ff073a';
    
    feedbackActionContainer.innerHTML = '';
    const entendidoBtn = document.createElement('button');
    entendidoBtn.className = 'nes-btn mt-4';
    entendidoBtn.textContent = 'Entendido';
    entendidoBtn.addEventListener('click', nextQuestion);
    feedbackActionContainer.appendChild(entendidoBtn);

    feedbackPanel.classList.remove('hidden');
}

        function nextQuestion() {
            currentQuestionIndex++;
            updateProgress();
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                endGame();
            }
        }

        function updateScore() {
            scoreEl.textContent = score;
        }

        function updateProgress() {
            const progress = (currentQuestionIndex / questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${currentQuestionIndex}/${questions.length}`;
        }
        
        function getRank(finalScore) {
            const percentage = (finalScore / questions.length) * 100;
            if (percentage <= 25) return { 
                title: 'RECRUTA DIGITAL', 
                color: '#ff073a', 
                image: 'images/recruta.png' 
            };
            if (percentage <= 50) return { 
                title: 'AGENTE DE CAMPO', 
                color: '#ff9d9d', 
                image: 'images/agente.png' 
            };
            if (percentage <= 75) return { 
                title: 'ESPECIALISTA EM DEFESA', 
                color: '#00fff9', 
                image: 'images/espec.png' 
            };
            return { 
                title: 'GUARDIÃO(Ã) DA REDE', 
                color: '#00ff41',
                image: 'images/guard.png'
            };
        }

        function endGame() {
            const rank = getRank(score);
            rankImageEl.src = rank.image; // <<< ADICIONE ESTA LINHA

            progressBar.style.width = '100%';
            progressText.textContent = `${questions.length}/${questions.length}`;

            questionArea.classList.add('hidden');
            feedbackPanel.classList.add('hidden');
            endGamePanel.classList.remove('hidden');
            
            endGameTitle.textContent = 'MISSÃO CONCLUÍDA!';
            endGameTitle.style.color = rank.color;
            endGameTitle.style.textShadow = `0 0 10px ${rank.color}`;
            
            endGameMessage.innerHTML = `Você neutralizou ${score} de ${questions.length} ameaças.<br>Sua patente na APD é: <span style="color:${rank.color}; text-shadow: 0 0 5px ${rank.color};">${rank.title}</span>`;

            if (incorrectAnswers.length > 0) {
                reviewMistakesBtn.classList.remove('hidden');
            }

            playSound('C6', '4n');
        }

        function showReviewModal() {
            currentReviewIndex = 0;
            displayReviewQuestion();
            reviewModal.style.display = 'flex';
        }

        function displayReviewQuestion() {
            if (incorrectAnswers.length === 0) return;
            
            // Pega o objeto completo do erro, que agora contém a pergunta e a resposta do usuário
            const errorData = incorrectAnswers[currentReviewIndex];
            const question = errorData.question;
            const userAnswerKey = errorData.userAnswer;

            // Pega a chave da resposta correta
            const correctAnswerKey = question.correctAnswer;
            
            // Pega o texto completo da resposta do usuário e da resposta correta
            const userAnswerText = question.options[userAnswerKey];
            const correctAnswerText = question.options[correctAnswerKey];
            
            // Popula todos os campos do modal de revisão
            reviewCounterEl.textContent = `${currentReviewIndex + 1}/${incorrectAnswers.length}`;
            reviewQuestionEl.innerHTML = question.question;
            
            // Popula os novos elementos HTML
            reviewUserAnswerEl.innerHTML = `<span class="uppercase">${userAnswerKey})</span> ${userAnswerText}`;
            reviewCorrectAnswerEl.innerHTML = `<span class="uppercase">${correctAnswerKey})</span> ${correctAnswerText}`;
            
            reviewCommentEl.innerHTML = question.comment;

            // Lógica para desabilitar/habilitar botões de navegação
            prevReviewBtn.classList.toggle('is-disabled', currentReviewIndex === 0);
            prevReviewBtn.disabled = currentReviewIndex === 0;

            nextReviewBtn.classList.toggle('is-disabled', currentReviewIndex === incorrectAnswers.length - 1);
            nextReviewBtn.disabled = currentReviewIndex === incorrectAnswers.length - 1;
        }

        function playSound(note, duration) {
            if (synth && Tone.context.state !== 'running') {
                Tone.start();
            }
            if(synth) {
                synth.triggerAttackRelease(note, duration);
            }
        }

        // --- EVENT LISTENERS ---
        startGameBtn.addEventListener('click', () => {
             introModal.style.display = 'none';
             startGame();
        });
        restartGameBtn.addEventListener('click', startGame);
        reviewMistakesBtn.addEventListener('click', showReviewModal);
        closeReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'none';
        });
        prevReviewBtn.addEventListener('click', () => {
            if (currentReviewIndex > 0) {
                currentReviewIndex--;
                displayReviewQuestion();
                playSound('E4', '8n');
            }
        });
        nextReviewBtn.addEventListener('click', () => {
            if (currentReviewIndex < incorrectAnswers.length - 1) {
                currentReviewIndex++;
                displayReviewQuestion();
                playSound('G4', '8n');
            }
        });

        // Initialize intro modal display
        introModal.style.display = 'flex';

