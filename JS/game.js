let bancoActual = [];
let preguntasRestantes = [];
let preguntaActual = null;

let score = 0;
let contador = 100;
let questionsAnswered = 0;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const campana = document.getElementById("campana");

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const loading = document.getElementById("loading");

const preguntaTxt = document.getElementById("pregunta");
const oracionTxt = document.getElementById("oracion");
const respuestasDiv = document.getElementById("respuestas");
const scoreTxt = document.getElementById("score");
const contadorTxt = document.getElementById("contador");
const questionCounterTxt = document.getElementById("question-counter");
const highScoresList = document.getElementById("highScoresList");

/* ===============================
   EVENT LISTENERS
================================ */

function setupEventListeners() {
    const buttons = {
        'start-facil': () => startGame('facil'),
        'start-medio': () => startGame('medio'),
        'start-dificil': () => startGame('dificil'),
        'start-bloque_a': () => startGame('bloque_a'),
        'start-bloque_b': () => startGame('bloque_b'),
        'start-bloque_c': () => startGame('bloque_c'),
        'skipBtn': skipQuestion,
        'lobbyBtn': returnToLobby
    };

    for (const id in buttons) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', buttons[id]);
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                buttons[id]();
            });
        }
    }
}

/* ===============================
   LOBBY & HIGH SCORES
================================ */

function initLobby() {
    updateHighScoresDisplay();
    setupEventListeners();
}

function updateHighScoresDisplay() {
    highScoresList.innerHTML = highScores
        .map(score => `<li>${score}</li>`)
        .join('');
}

function saveHighScore() {
    if (score > 0) {
        highScores.push(Math.round(score));
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 3);
        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateHighScoresDisplay();
    }
}

function returnToLobby() {
    saveHighScore();
    game.style.display = 'none';
    menu.style.display = 'block';
}

/* ===============================
   HELPER
================================ */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/* ===============================
   INICIAR JUEGO
================================ */

function startGame(modo) {
    menu.style.display = "none";
    loading.style.display = "flex";

    // Simulate loading time
    setTimeout(() => {
        switch (modo) {
            case 'facil':
                bancoActual = BANCO_FACIL;
                break;
            case 'medio':
                bancoActual = BANCO_MEDIO;
                break;
            case 'dificil':
                bancoActual = BANCO_DIFICIL;
                break;
            case 'bloque_a':
                bancoActual = BANCO_DE_ORACIONES_A;
                break;
            case 'bloque_b':
                bancoActual = BANCO_DE_ORACIONES_B;
                break;
            case 'bloque_c':
                bancoActual = BANCO_DE_ORACIONES_C;
                break;
            default:
                console.error('Modo de juego no reconocido:', modo);
                loading.style.display = "none";
                menu.style.display = "block";
                return;
        }

        preguntasRestantes = [...bancoActual];
        score = 0;
        contador = 100;
        questionsAnswered = 0;

        loading.style.display = "none";
        game.style.display = "block";

        actualizarUI();
        siguientePregunta();
    }, 1000); // 1 second delay to simulate loading
}

/* ===============================
   MOSTRAR PREGUNTA
================================ */

function siguientePregunta() {
    const oldNextBtn = document.querySelector(".siguiente-btn");
    if (oldNextBtn) {
        oldNextBtn.remove();
    }

    if (contador <= 0 || preguntasRestantes.length === 0) {
        saveHighScore();
        alert("Juego terminado 🎓\nPuntaje: " + score.toFixed(2));
        location.reload();
        return;
    }

    const index = Math.floor(Math.random() * preguntasRestantes.length);
    preguntaActual = preguntasRestantes.splice(index, 1)[0];

    if (preguntaActual.oracion) {
        oracionTxt.innerText = preguntaActual.oracion;
        oracionTxt.style.display = 'block';
    } else {
        oracionTxt.style.display = 'none';
    }

    preguntaTxt.innerText = preguntaActual.q;
    respuestasDiv.innerHTML = "";

    let respuestas = preguntaActual.a.map((texto, index) => ({ texto, index }));
    shuffleArray(respuestas);

    respuestas.forEach(respuesta => {
        const btn = document.createElement("button");
        btn.innerText = respuesta.texto;
        btn.onclick = () => responder(respuesta.index, btn);
        respuestasDiv.appendChild(btn);
    });

    actualizarUI();
}

/* ===============================
   RESPONDER
================================ */

function responder(selectedIndex, selectedButton) {
    const botones = respuestasDiv.querySelectorAll("button");
    botones.forEach(b => {
        b.disabled = true;
    });

    document.getElementById('skipBtn').style.display = 'none';

    const correctIndex = preguntaActual.c;

    if (selectedIndex === correctIndex) {
        selectedButton.classList.add("correct");
        score += 5;
    } else {
        selectedButton.classList.add("incorrect");
        const correctText = preguntaActual.a[correctIndex];
        botones.forEach(b => {
            if (b.innerText === correctText) {
                b.classList.add("correct");
            }
        });
        score -= 0.25;
    }

    if (score > 0 && score % 100 === 0) {
        campana.play();
    }

    contador--;
    questionsAnswered++;
    actualizarUI();

    setTimeout(() => {
        const nextBtn = document.createElement("button");
        nextBtn.innerText = "Siguiente →";
        nextBtn.className = "siguiente-btn";
        nextBtn.addEventListener('click', siguientePregunta);
        nextBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            siguientePregunta();
        });
        const gameFooter = document.querySelector(".game-footer");
        game.insertBefore(nextBtn, gameFooter);
    }, 800);
}


/* ===============================
   PASAR
================================ */

function skipQuestion() {
    contador--;
    actualizarUI();
    siguientePregunta();
}

/* ===============================
   UI
================================ */

function actualizarUI() {
    scoreTxt.innerText = "Puntaje: " + score.toFixed(2);
    contadorTxt.innerText = contador;
    questionCounterTxt.innerText = "Preguntas: " + questionsAnswered;
}

// INICIALIZACIÓN
initLobby();
