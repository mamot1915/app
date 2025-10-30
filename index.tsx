// @ts-nocheck
// Since we are loading Three.js from a CDN, we declare it to TypeScript.
declare const THREE: any;

// --- APP STATE ---
let currentView = 'shell-game';

// === SHELL GAME =============================================================
// --- SCENE & CORE ---
let scene, camera, renderer, clock;
let raycaster, mouse;

// --- GAME OBJECTS ---
const cups = [];
const numberSprites = [];
let ball;
const cupGroup = new THREE.Group();
const numberGroup = new THREE.Group();
let confettiParticles;

// --- GAME STATE ---
let gameState = 'idle'; // idle, showing, shuffling, guessing, revealing_wrong, revealing_correct
let correctCupIndex = -1;
let currentNumCups = 3;
let currentDifficulty = 'medium';
let currentCupColor = 0xf44336; // Default to red

// --- ANIMATION STATE ---
let animationQueue = [];

// --- CONSTANTS ---
const CUP_RADIUS = 0.5;
const CUP_HEIGHT = 1;
const CUP_Y = CUP_HEIGHT / 2;
const BALL_RADIUS = 0.2;
const BALL_Y = BALL_RADIUS;
const TABLE_WIDTH = 8;
const TABLE_HEIGHT = 0.2;
const TABLE_DEPTH = 4.0;

// --- DIFFICULTY SETTINGS ---
const DIFFICULTY_LEVELS = {
    medium: { swapsPerCup: 6, speed: 4.5 },
    hard: { swapsPerCup: 8, speed: 5.5 },
    veryHard: { swapsPerCup: 10, speed: 6.5 }
};
// === END SHELL GAME ========================================================


// === YES/NO GAME ===========================================================
let yesNoQuestions = [];
let yesNoGame = {
    timer: 30,
    timerId: null,
    currentQuestion: null,
    gameActive: false,
    score: 0,
    allShuffledQuestions: [],
    currentRoundQuestions: [],
    questionsAnsweredInRound: 0,
    totalQuestionsInRound: 0,
    timerDuration: 30,
    questionsPerRound: 15,
    isPaused: false,
};
// === END YES/NO GAME =======================================================


// === PANTOMIME GAME ========================================================
let drawingCanvas, drawingContext, colorPalette, eraserBtn, clearBtn, undoBtn, redoBtn;
let isDrawing = false;
let penColor = '#000000';
let penWidth = 5;
let lastX = 0;
let lastY = 0;
// Undo/Redo state
let drawingHistory = [];
let redoHistory = [];
let currentPath = null;

let pantomimeGame = {
    timer: 60,
    timerId: null,
    gameActive: false,
    timerDuration: 60,
    isPaused: false,
};
// === END PANTOMIME GAME ====================================================


// === WHEEL OF PRIZES GAME ==================================================
let wheelCanvas, wheelContext;
let wheelGame = {
    prizes: [
        { name: 'جایزه ۱', weight: 1 }, { name: 'جایزه ۲', weight: 1 },
        { name: 'جایزه ۳', weight: 1 }, { name: 'جایزه ۴', weight: 1 },
        { name: 'جایزه ۵', weight: 1 }, { name: 'جایزه ۶', weight: 1 },
        { name: 'جایزه ۷', weight: 1 }, { name: 'جایزه ۸', weight: 1 }
    ],
    prizeCount: 8,
    colors: ['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63', '#00BCD4', '#795548'],
    isSpinning: false,
    spinStartTime: 0,
    spinDuration: 10000, // 10 seconds for a faster, more exciting spin
    startAngle: 0,
    spinAngle: 0,
    spinAngleTotal: 0,
    winnerIndex: null, // To store the pre-determined winner
};
// === END WHEEL OF PRIZES GAME ==============================================


// --- UI ELEMENTS ---
let messageElement, startContainer, restartContainer, menuToggle, mainMenu, cupCountInput, difficultySelector, applySettingsButton, colorSelector, shellGameBackgroundColorSelector;
let shellGameWrapper, yesNoSectionWrapper, yesNoGameContent, createQuestionContent, pantomimeGameContent, wheelGameWrapper;
let ynTimerEl, ynTimerContainer, ynQuestionEl, ynFeedbackEl, ynAnswersEl, ynStartBtn, ynYesBtn, ynNoBtn, ynTimerDurationInput, ynImageContainer, ynQuestionImage, ynPauseToggle, ynColorSelector, ynQuestionsPerRoundInput, ynBackgroundColorSelector, ynNextQuestionBtn;
let createQuestionForm, questionTextEl, questionImageInput, questionListEl;
let ynMenuToggle, ynMainMenu;
let ynRoundSummaryEl, ynRoundScoreTextEl, ynNextRoundBtn;
let pantomimeMenuToggle, pantomimeMainMenu, pantomimeTimerEl, pantomimeTimerContainer, pantomimeStartBtn, pantomimeEndBtn, pantomimeBackgroundColorSelector, pantomimePauseToggle, pantomimeTimerDurationInput;
let wheelMenuToggle, wheelMainMenu, wheelGameContent, wheelSpinBtn, wheelResultEl, wheelResultTextEl, wheelResultCloseBtn, wheelPrizesContainer, wheelAddPrizeBtn, wheelApplySettingsBtn, wheelBackgroundColorSelector, wheelSpinSound;


// --- INITIALIZATION ---
function init() {
    // Shell Game UI
    messageElement = document.getElementById('message');
    startContainer = document.getElementById('start-container');
    restartContainer = document.getElementById('restart-container');
    cupCountInput = document.getElementById('cup-count') as HTMLInputElement;
    difficultySelector = document.getElementById('difficulty-selector');
    colorSelector = document.getElementById('color-selector');
    shellGameBackgroundColorSelector = document.getElementById('shell-game-background-color-selector');
    applySettingsButton = document.getElementById('apply-settings-button');
    
    // Main App UI
    menuToggle = document.getElementById('menu-toggle');
    mainMenu = document.getElementById('main-menu');
    shellGameWrapper = document.getElementById('shell-game-wrapper');
    
    // Yes/No Section UI
    yesNoSectionWrapper = document.getElementById('yes-no-section-wrapper');
    yesNoGameContent = document.getElementById('yes-no-game-content');
    createQuestionContent = document.getElementById('create-question-content');
    pantomimeGameContent = document.getElementById('pantomime-game-content');
    ynMenuToggle = document.getElementById('yn-menu-toggle');
    ynMainMenu = document.getElementById('yn-main-menu');

    // Yes/No Game UI
    ynTimerEl = document.getElementById('yn-timer');
    ynTimerContainer = document.getElementById('yn-timer-container');
    ynQuestionEl = document.getElementById('yn-question');
    ynFeedbackEl = document.getElementById('yn-feedback');
    ynAnswersEl = document.getElementById('yn-answers');
    ynStartBtn = document.getElementById('yn-start-btn');
    ynYesBtn = document.getElementById('yn-yes-btn');
    ynNoBtn = document.getElementById('yn-no-btn');
    ynNextQuestionBtn = document.getElementById('yn-next-question-btn');
    ynTimerDurationInput = document.getElementById('yn-timer-duration');
    ynQuestionsPerRoundInput = document.getElementById('yn-questions-per-round');
    ynImageContainer = document.getElementById('yn-image-container');
    ynQuestionImage = document.getElementById('yn-question-image');
    ynPauseToggle = document.getElementById('yn-pause-toggle');
    ynRoundSummaryEl = document.getElementById('yn-round-summary');
    ynRoundScoreTextEl = document.getElementById('yn-round-score-text');
    ynNextRoundBtn = document.getElementById('yn-next-round-btn');
    ynColorSelector = document.getElementById('yn-color-selector');
    ynBackgroundColorSelector = document.getElementById('yn-background-color-selector');

    // Create Question UI
    createQuestionForm = document.getElementById('create-question-form');
    questionTextEl = document.getElementById('question-text');
    questionImageInput = document.getElementById('question-image');
    questionListEl = document.getElementById('question-list');

    // Pantomime Game UI
    pantomimeMenuToggle = document.getElementById('pantomime-menu-toggle');
    pantomimeMainMenu = document.getElementById('pantomime-main-menu');
    drawingCanvas = document.getElementById('drawing-canvas');
    colorPalette = document.getElementById('color-palette');
    eraserBtn = document.getElementById('eraser-btn');
    clearBtn = document.getElementById('clear-btn');
    undoBtn = document.getElementById('undo-btn');
    redoBtn = document.getElementById('redo-btn');
    pantomimeTimerContainer = document.getElementById('pantomime-timer-container');
    pantomimeTimerEl = document.getElementById('pantomime-timer');
    pantomimeStartBtn = document.getElementById('pantomime-start-btn');
    pantomimeEndBtn = document.getElementById('pantomime-end-btn');
    pantomimeBackgroundColorSelector = document.getElementById('pantomime-background-color-selector');
    pantomimePauseToggle = document.getElementById('pantomime-pause-toggle');
    pantomimeTimerDurationInput = document.getElementById('pantomime-timer-duration');

    // Wheel of Prizes UI
    wheelGameWrapper = document.getElementById('wheel-game-wrapper');
    wheelGameContent = document.getElementById('wheel-game-content');
    wheelCanvas = document.getElementById('wheel-canvas');
    wheelSpinBtn = document.getElementById('wheel-spin-btn');
    wheelResultEl = document.getElementById('wheel-result');
    wheelResultTextEl = document.getElementById('wheel-result-text');
    wheelResultCloseBtn = document.getElementById('wheel-result-close-btn');
    wheelMenuToggle = document.getElementById('wheel-menu-toggle');
    wheelMainMenu = document.getElementById('wheel-main-menu');
    wheelPrizesContainer = document.getElementById('wheel-prizes-container');
    wheelAddPrizeBtn = document.getElementById('wheel-add-prize-btn');
    wheelApplySettingsBtn = document.getElementById('wheel-apply-settings-btn');
    wheelBackgroundColorSelector = document.getElementById('wheel-background-color-selector');
    wheelSpinSound = document.getElementById('wheel-spin-sound');


    // UI Event Listeners
    document.getElementById('start-button').addEventListener('click', () => startGame());
    document.getElementById('restart-button').addEventListener('click', () => startGame());
    applySettingsButton.addEventListener('click', applySettingsAndStart);
    
    // Background Color Listeners
    shellGameBackgroundColorSelector.addEventListener('click', (e) => handleBackgroundColorChange(e, 'shell'));
    ynBackgroundColorSelector.addEventListener('click', (e) => handleBackgroundColorChange(e, 'yes-no'));
    pantomimeBackgroundColorSelector.addEventListener('click', (e) => handleBackgroundColorChange(e, 'pantomime'));
    wheelBackgroundColorSelector.addEventListener('click', (e) => handleBackgroundColorChange(e, 'wheel'));


    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        mainMenu.classList.toggle('open');
    });

    document.querySelectorAll('#main-menu .nav-button').forEach(button => {
        button.addEventListener('click', () => {
            switchView(button.dataset.view);
        });
    });

    difficultySelector.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            difficultySelector.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
        }
    });

    colorSelector.addEventListener('click', (event) => {
        const target = event.target.closest('.color-swatch');
        if (target) {
            colorSelector.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('selected'));
            target.classList.add('selected');
        }
    });
    
    // Set default selected color swatch
    colorSelector.querySelector(`[data-color="0x${currentCupColor.toString(16)}"]`).classList.add('selected');

    // Yes/No Section Listeners
    ynMenuToggle.addEventListener('click', () => {
        ynMenuToggle.classList.toggle('open');
        ynMainMenu.classList.toggle('open');
    });
    document.querySelectorAll('#yn-main-menu .nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.ynView;
            if (view === 'shell-game' || view === 'wheel-game') {
                ynMenuToggle.classList.remove('open');
                ynMainMenu.classList.remove('open');
                switchView(view);
            } else {
                switchYesNoView(view);
            }
        });
    });

    // Yes/No Game Listeners
    ynStartBtn.addEventListener('click', startYesNoGame);
    ynNextRoundBtn.addEventListener('click', startNextRound);
    ynNextQuestionBtn.addEventListener('click', displayNextYesNoQuestion);
    ynYesBtn.addEventListener('click', () => checkYesNoAnswer(true));
    ynNoBtn.addEventListener('click', () => checkYesNoAnswer(false));
    ynPauseToggle.addEventListener('click', toggleYesNoPause);
    ynColorSelector.addEventListener('click', handleThemeColorChange);

    // Load and apply Yes/No game settings
    const savedTimer = localStorage.getItem('yesNoTimerDuration');
    if (savedTimer) {
        yesNoGame.timerDuration = parseInt(savedTimer, 10);
        ynTimerDurationInput.value = savedTimer;
    }
    ynTimerDurationInput.addEventListener('change', () => {
        const newDuration = parseInt(ynTimerDurationInput.value, 10);
        if (newDuration >= 5 && newDuration <= 60) {
            yesNoGame.timerDuration = newDuration;
            localStorage.setItem('yesNoTimerDuration', newDuration.toString());
        } else {
            ynTimerDurationInput.value = yesNoGame.timerDuration.toString();
        }
    });
    
    const savedQuestionsPerRound = localStorage.getItem('yesNoQuestionsPerRound');
    if (savedQuestionsPerRound) {
        yesNoGame.questionsPerRound = parseInt(savedQuestionsPerRound, 10);
        ynQuestionsPerRoundInput.value = savedQuestionsPerRound;
    }
    ynQuestionsPerRoundInput.addEventListener('change', () => {
        const newCount = parseInt(ynQuestionsPerRoundInput.value, 10);
        if (newCount >= 5 && newCount <= 50) {
            yesNoGame.questionsPerRound = newCount;
            localStorage.setItem('yesNoQuestionsPerRound', newCount.toString());
        } else {
            ynQuestionsPerRoundInput.value = yesNoGame.questionsPerRound.toString();
        }
    });


    // Create Question Listeners
    createQuestionForm.addEventListener('submit', handleQuestionSubmit);
    questionListEl.addEventListener('click', handleDeleteQuestionClick);

    // Pantomime Game Listeners
    pantomimeMenuToggle.addEventListener('click', () => {
        pantomimeMenuToggle.classList.toggle('open');
        pantomimeMainMenu.classList.toggle('open');
    });
     document.querySelectorAll('#pantomime-main-menu .nav-button').forEach(button => {
        button.addEventListener('click', () => {
            pantomimeMenuToggle.classList.remove('open');
            pantomimeMainMenu.classList.remove('open');
            switchView(button.dataset.view);
        });
    });
    pantomimeStartBtn.addEventListener('click', startPantomimeGame);
    pantomimeEndBtn.addEventListener('click', () => endAndResetPantomimeRound(false));
    pantomimePauseToggle.addEventListener('click', togglePantomimePause);

    pantomimeTimerDurationInput.addEventListener('change', () => {
        const newDuration = parseInt(pantomimeTimerDurationInput.value, 10);
        if (newDuration >= 30 && newDuration <= 180) {
            pantomimeGame.timerDuration = newDuration;
            localStorage.setItem('pantomimeTimerDuration', newDuration.toString());
            pantomimeTimerEl.textContent = pantomimeGame.timerDuration.toString();
        } else {
            pantomimeTimerDurationInput.value = pantomimeGame.timerDuration.toString();
        }
    });

    const savedPantomimeTimer = localStorage.getItem('pantomimeTimerDuration');
    if (savedPantomimeTimer) {
        pantomimeGame.timerDuration = parseInt(savedPantomimeTimer, 10);
        pantomimeTimerDurationInput.value = savedPantomimeTimer;
    }
    pantomimeTimerEl.textContent = pantomimeGame.timerDuration.toString();
    
    // Wheel of Prizes Listeners
    wheelMenuToggle.addEventListener('click', () => {
        wheelMenuToggle.classList.toggle('open');
        wheelMainMenu.classList.toggle('open');
    });
    document.querySelectorAll('#wheel-main-menu .nav-button').forEach(button => {
        button.addEventListener('click', () => {
            wheelMenuToggle.classList.remove('open');
            wheelMainMenu.classList.remove('open');
            switchView(button.dataset.view);
        });
    });
    wheelSpinBtn.addEventListener('click', handleSpinClick);
    wheelApplySettingsBtn.addEventListener('click', applyWheelSettings);
    wheelResultCloseBtn.addEventListener('click', () => wheelResultEl.classList.remove('show'));
    wheelAddPrizeBtn.addEventListener('click', () => addPrizeInput());
    wheelPrizesContainer.addEventListener('click', handlePrizeRemove);


    initDrawingBoard();
    initWheel();


    // --- SHELL GAME SETUP ---
    // Core components
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 25);
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 9);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    shellGameWrapper.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.3, 30, Math.PI * 0.2, 0.5);
    spotLight.position.set(0, 10, 5);
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Game Objects
    createTable();
    createBall();
    scene.add(cupGroup);
    scene.add(numberGroup);

    // Raycasting for user input
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousedown', onMouseDown);

    // Load Yes/No questions and theme
    loadQuestionsFromLocalStorage();
    loadTheme();
    loadAndApplyInitialBackground();
    setupBackgroundSelectors();


    animate();
}

// --- VIEW SWITCHING ---
function switchView(viewId) {
    currentView = viewId;
    
    shellGameWrapper.style.display = 'none';
    yesNoSectionWrapper.style.display = 'none';
    wheelGameWrapper.style.display = 'none';
    menuToggle.classList.add('hidden');

    if (viewId === 'shell-game') {
        const color = localStorage.getItem('shellBackgroundColor') || '#4a148c';
        applyBackgroundColor(color, 'shell');
        shellGameWrapper.style.display = 'block';
        menuToggle.classList.remove('hidden');
    } else if (viewId === 'yes-no-game') {
        yesNoSectionWrapper.style.display = 'flex';
        switchYesNoView('play');
    } else if (viewId === 'pantomime') {
        yesNoSectionWrapper.style.display = 'flex';
        switchYesNoView('pantomime');
    } else if (viewId === 'wheel-game') {
        const color = localStorage.getItem('wheelBackgroundColor') || '#212121';
        applyBackgroundColor(color, 'wheel');
        wheelGameWrapper.style.display = 'flex';
        resizeWheelCanvas();
        drawWheel();
    }


    menuToggle.classList.remove('open');
    mainMenu.classList.remove('open');
}

function switchYesNoView(ynViewId) {
    yesNoGameContent.style.display = 'none';
    createQuestionContent.style.display = 'none';
    pantomimeGameContent.style.display = 'none';
    ynMenuToggle.style.display = 'none';
    pantomimeMenuToggle.style.display = 'none';
    ynPauseToggle.style.display = 'none';
    pantomimePauseToggle.style.display = 'none';

    if (ynViewId === 'play') {
        const color = localStorage.getItem('yesNoBackgroundColor') || '#004d40';
        applyBackgroundColor(color, 'yes-no');
        yesNoGameContent.style.display = 'block';
        ynMenuToggle.style.display = 'flex';
        resetYesNoGameUI();
    } else if (ynViewId === 'create') {
        const color = localStorage.getItem('yesNoBackgroundColor') || '#004d40';
        applyBackgroundColor(color, 'yes-no');
        createQuestionContent.style.display = 'block';
        ynMenuToggle.style.display = 'flex';
    } else if (ynViewId === 'pantomime') {
        const color = localStorage.getItem('pantomimeBackgroundColor') || '#f1c40f';
        applyBackgroundColor(color, 'pantomime');
        pantomimeGameContent.style.display = 'flex';
        pantomimeMenuToggle.style.display = 'flex';
        resizeCanvas();
        resetPantomimeUI();
    }
    
    ynMenuToggle.classList.remove('open');
    ynMainMenu.classList.remove('open');
    pantomimeMenuToggle.classList.remove('open');
    pantomimeMainMenu.classList.remove('open');
}


// --- SHELL GAME: OBJECT CREATION ---
function createTable() {
    const textureLoader = new THREE.TextureLoader();
    const woodColorMap = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    const woodRoughnessMap = textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg');
    const woodNormalMap = textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg');
    
    [woodColorMap, woodRoughnessMap, woodNormalMap].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(TABLE_WIDTH / 4, TABLE_DEPTH / 4);
    });

    const tableGeometry = new THREE.BoxGeometry(TABLE_WIDTH, TABLE_HEIGHT, TABLE_DEPTH);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
        map: woodColorMap,
        roughnessMap: woodRoughnessMap,
        normalMap: woodNormalMap,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8 // Made more transparent
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -TABLE_HEIGHT / 2;
    table.receiveShadow = true;
    scene.add(table);
}

function createCups(count) {
    while (cupGroup.children.length > 0) {
        cupGroup.remove(cupGroup.children[0]);
    }
    cups.length = 0;

    const cupGeometry = new THREE.CylinderGeometry(CUP_RADIUS, CUP_RADIUS * 0.8, CUP_HEIGHT, 32);
    
    const cupAreaWidth = TABLE_WIDTH * 0.8;
    const cupSpacing = count > 1 ? cupAreaWidth / (count - 1) : 0;

    for (let i = 0; i < count; i++) {
        const cupMaterial = new THREE.MeshStandardMaterial({ color: currentCupColor, metalness: 0.3, roughness: 0.4 });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.set((i - (count - 1) / 2) * cupSpacing, CUP_Y, 0);
        cup.rotation.x = Math.PI;
        cup.castShadow = true;
        cup.userData.index = i;
        cup.userData.isGuessed = false;
        cups.push(cup);
        cupGroup.add(cup);
    }
}

function createBall() {
    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xccb400, emissiveIntensity: 0.3 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.y = -10;
    ball.castShadow = true;
    ball.visible = false; // Hide ball initially
    scene.add(ball);
}

function createNumberSprites(count) {
    while (numberGroup.children.length > 0) {
        numberGroup.remove(numberGroup.children[0]);
    }
    numberSprites.length = 0;

    for (let i = 0; i < count; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        
        context.fillStyle = 'rgba(0,0,0,0.6)';
        context.beginPath();
        context.arc(64, 64, 55, 0, Math.PI * 2);
        context.fill();

        context.font = 'bold 70px Vazirmatn, sans-serif';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText((i + 1).toString(), 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.7, 0.7, 1);
        sprite.visible = false;
        
        numberSprites.push(sprite);
        numberGroup.add(sprite);
    }
}

function createConfetti() {
    if (confettiParticles) scene.remove(confettiParticles);
    
    confettiParticles = new THREE.Group();
    const particleCount = 200;
    const particleGeometry = new THREE.PlaneGeometry(0.05, 0.05);
    const colors = [0xf44336, 0x2196f3, 0x4caf50, 0xffeb3b, 0x9c27b0];

    for (let i = 0; i < particleCount; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            side: THREE.DoubleSide
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        particle.position.copy(ball.position);
        
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 5 + 3,
            (Math.random() - 0.5) * 5
        );
        particle.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        particle.userData.lifetime = 0;
        particle.userData.maxLifetime = 2 + Math.random() * 2;
        
        confettiParticles.add(particle);
    }
    scene.add(confettiParticles);
}

// --- SHELL GAME: LOGIC ---
function applySettingsAndStart() {
    const requestedCups = parseInt(cupCountInput.value, 10);
    if (isNaN(requestedCups) || requestedCups < 2 || requestedCups > 6) {
        alert('لطفا عددی بین 2 تا 6 برای لیوان ها وارد کنید.');
        return;
    }
    currentNumCups = requestedCups;
    const selectedDifficultyButton = difficultySelector.querySelector('button.selected');
    currentDifficulty = selectedDifficultyButton.dataset.difficulty;

    const selectedColorButton = colorSelector.querySelector('.color-swatch.selected');
    currentCupColor = parseInt(selectedColorButton.dataset.color, 16);
    
    menuToggle.classList.remove('open');
    mainMenu.classList.remove('open');
    
    startGame();
}

function startGame() {
    resetGame();
    
    const settings = DIFFICULTY_LEVELS[currentDifficulty];
    const SHUFFLE_SWAPS = Math.ceil(settings.swapsPerCup * (currentNumCups / 2));
    const SHUFFLE_SPEED = settings.speed;

    gameState = 'showing';
    startContainer.style.display = 'none';
    
    createCups(currentNumCups);
    createNumberSprites(currentNumCups);
    
    correctCupIndex = Math.floor(Math.random() * currentNumCups);
    const correctCup = cups[correctCupIndex];
    ball.position.set(correctCup.position.x, BALL_Y, correctCup.position.z);
    ball.visible = true;

    addAnimation('lift', { cup: correctCup, y: CUP_Y + 1.5, duration: 0.5 });
    addAnimation('wait', { duration: 1.0 });
    addAnimation('lower', { cup: correctCup, y: CUP_Y, duration: 0.5, onComplete: () => {
        ball.visible = false;
        gameState = 'shuffling';
        shuffleCups(SHUFFLE_SWAPS, SHUFFLE_SPEED);
    }});
}

function shuffleCups(swaps, speed) {
    let lastSwap = [-1, -1];
    for (let i = 0; i < swaps; i++) {
        let i1, i2;
        do {
            i1 = Math.floor(Math.random() * currentNumCups);
            i2 = Math.floor(Math.random() * currentNumCups);
        } while (i1 === i2 || (i1 === lastSwap[0] && i2 === lastSwap[1]) || (i1 === lastSwap[1] && i2 === lastSwap[0]));
        lastSwap = [i1, i2];

        addAnimation('swap', { 
            cupA: cups[i1], 
            cupB: cups[i2], 
            duration: 1.0 / speed 
        });
    }
    addAnimation('wait', { duration: 0.2, onComplete: () => {
        gameState = 'guessing';
        restartContainer.style.display = 'block';
        displayCupNumbers();
    }});
}

function displayCupNumbers() {
    const sortedCups = [...cups].sort((a, b) => a.position.x - b.position.x);

    sortedCups.forEach((cup, index) => {
        const numberSprite = numberSprites[index];
        numberSprite.position.set(cup.position.x, CUP_HEIGHT + 0.5, cup.position.z);
        numberSprite.visible = true;
    });
}

function handleGuess(guessedCup) {
    if (gameState !== 'guessing' || guessedCup.userData.isGuessed) return;

    const isCorrect = guessedCup === cups[correctCupIndex];
    numberGroup.children.forEach(sprite => sprite.visible = false);

    if (isCorrect) {
        gameState = 'revealing_correct';
        const correctCup = cups[correctCupIndex];
        ball.position.set(correctCup.position.x, BALL_Y, correctCup.position.z);
        ball.visible = true;
        
        createConfetti();

        addAnimation('lift', { cup: guessedCup, y: CUP_Y + 1.5, duration: 0.5, onComplete: () => {
            restartContainer.style.display = 'block';
        }});
    } else {
        gameState = 'revealing_wrong';
        guessedCup.userData.isGuessed = true;
        
        addAnimation('lift', { cup: guessedCup, y: CUP_Y + 1.5, duration: 0.5 });
        addAnimation('wait', { duration: 0.8 });
        addAnimation('lower', { cup: guessedCup, y: CUP_Y, duration: 0.5, onComplete: () => {
            const darkerColor = new THREE.Color(currentCupColor);
            darkerColor.multiplyScalar(0.4);
            guessedCup.material.color.set(darkerColor);
            gameState = 'guessing';
            displayCupNumbers();
        }});
    }
}


function resetGame() {
    animationQueue = [];
    gameState = 'idle';
    startContainer.style.display = 'block';
    restartContainer.style.display = 'none';
    
    while (cupGroup.children.length > 0) {
        cupGroup.remove(cupGroup.children[0]);
    }
    cups.length = 0;
    
    numberGroup.children.forEach(sprite => sprite.visible = false);
    
    if (confettiParticles) scene.remove(confettiParticles);
    confettiParticles = null;
    
    ball.visible = false;
    ball.position.y = -10;
}

// --- SHELL GAME: ANIMATION HANDLING ---
function addAnimation(type, config) {
    animationQueue.push({ type, ...config, progress: 0 });
}

function updateAnimations(deltaTime) {
    if (animationQueue.length > 0) {
        const anim = animationQueue[0];
        anim.progress += deltaTime / anim.duration;
        const p = Math.min(anim.progress, 1);

        if (anim.type === 'lift' || anim.type === 'lower') {
            if (anim.startY === undefined) anim.startY = anim.cup.position.y;
            const endY = anim.y;
            anim.cup.position.y = THREE.MathUtils.lerp(anim.startY, endY, easeOutCubic(p));
        } else if (anim.type === 'swap') {
            const { cupA, cupB } = anim;
            if (anim.startPosA === undefined) {
                anim.startPosA = cupA.position.clone();
                anim.startPosB = cupB.position.clone();
                anim.center = new THREE.Vector3().addVectors(anim.startPosA, anim.startPosB).multiplyScalar(0.5);
                anim.radius = anim.startPosA.distanceTo(anim.center);
                anim.startAngleA = Math.atan2(anim.startPosA.z - anim.center.z, anim.startPosA.x - anim.center.x);
            }
            const angle = anim.startAngleA + Math.PI * easeInOutCubic(p);
            const zRadius = Math.min(anim.radius * 0.6, (TABLE_DEPTH/2) - CUP_RADIUS);
            cupA.position.x = anim.center.x + anim.radius * Math.cos(angle);
            cupA.position.z = anim.center.z + zRadius * Math.sin(angle);
            cupB.position.x = anim.center.x - anim.radius * Math.cos(angle);
            cupB.position.z = anim.center.z - zRadius * Math.sin(angle);
            
            if(cupA === cups[correctCupIndex] || cupB === cups[correctCupIndex]){
                 ball.position.x = cups[correctCupIndex].position.x;
                 ball.position.z = cups[correctCupIndex].position.z;
            }
        }

        if (p >= 1) {
            if (anim.onComplete) anim.onComplete();
            animationQueue.shift();
        }
    }

    if(confettiParticles) {
        const gravity = new THREE.Vector3(0, -9.8, 0);
        let activeParticles = 0;
        confettiParticles.children.forEach(p => {
            if (p.userData.lifetime < p.userData.maxLifetime) {
                p.userData.velocity.add(gravity.clone().multiplyScalar(deltaTime));
                p.position.add(p.userData.velocity.clone().multiplyScalar(deltaTime));
                p.rotation.x += p.userData.rotationSpeed.x * deltaTime;
                p.rotation.y += p.userData.rotationSpeed.y * deltaTime;
                p.rotation.z += p.userData.rotationSpeed.z * deltaTime;
                p.userData.lifetime += deltaTime;
                activeParticles++;
            }
        });
        if (activeParticles === 0) {
            scene.remove(confettiParticles);
            confettiParticles = null;
        }
    }
}

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- SHELL GAME: EVENT HANDLERS ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(currentView === 'pantomime') {
        resizeCanvas();
    }
    if(currentView === 'wheel-game') {
        resizeWheelCanvas();
        drawWheel();
    }
}

function onMouseDown(event) {
    if (currentView !== 'shell-game' || gameState !== 'guessing') return;

    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cupGroup.children);

    if (intersects.length > 0) {
        handleGuess(intersects[0].object);
    }
}


// --- APP THEME & SETTINGS ---

function handleBackgroundColorChange(event, game) {
    const target = event.target.closest('.color-swatch');
    if (!target) return;

    const newColor = target.dataset.color;
    const storageKey = `${game}BackgroundColor`;
    localStorage.setItem(storageKey, newColor);
    applyBackgroundColor(newColor, game);

    const selectorEl = event.currentTarget;
    if (selectorEl) {
        selectorEl.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
    }
}

function applyBackgroundColor(color, game) {
    const targetWrapper = {
        'shell': shellGameWrapper,
        'yes-no': yesNoSectionWrapper,
        'pantomime': yesNoSectionWrapper,
        'wheel': wheelGameWrapper
    }[game];

    if (game === 'shell') {
        if (scene) {
            scene.background = new THREE.Color(color);
            if (scene.fog) {
                scene.fog.color.set(color);
            }
        }
    } else if (targetWrapper) {
        targetWrapper.style.backgroundColor = color;
        targetWrapper.style.backgroundImage = 'none';
    }
}


function loadAndApplyInitialBackground() {
    // This runs on page load. The default view is shell-game.
    const color = localStorage.getItem('shellBackgroundColor') || '#4a148c';
    applyBackgroundColor(color, 'shell');
}

function setupBackgroundSelectors() {
    updateSelectedSwatch(shellGameBackgroundColorSelector, localStorage.getItem('shellBackgroundColor') || '#4a148c');
    updateSelectedSwatch(ynBackgroundColorSelector, localStorage.getItem('yesNoBackgroundColor') || '#004d40');
    updateSelectedSwatch(pantomimeBackgroundColorSelector, localStorage.getItem('pantomimeBackgroundColor') || '#f1c40f');
    updateSelectedSwatch(wheelBackgroundColorSelector, localStorage.getItem('wheelBackgroundColor') || '#212121');
}

function updateSelectedSwatch(selector, color) {
    if (!selector) return;
    const defaultColor = '#1a1a1a';
    selector.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('selected'));
    const selectedSwatch = selector.querySelector(`[data-color="${color}"]`);
    if (selectedSwatch) {
        selectedSwatch.classList.add('selected');
    } else {
        const defaultSwatch = selector.querySelector(`[data-color="${defaultColor}"]`);
        if (defaultSwatch) defaultSwatch.classList.add('selected');
    }
}


function handleThemeColorChange(event) {
    const target = event.target.closest('.color-swatch');
    if (!target) return;

    const newColor = target.dataset.color;
    const newDarkColor = target.dataset.darkColor;

    applyTheme(newColor, newDarkColor);

    localStorage.setItem('yesNoThemeColor', newColor);
    localStorage.setItem('yesNoThemeDarkColor', newDarkColor);

    // Update selected class
    ynColorSelector.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('selected'));
    target.classList.add('selected');
}

function applyTheme(color, darkColor) {
    document.documentElement.style.setProperty('--theme-accent', color);
    document.documentElement.style.setProperty('--theme-accent-dark', darkColor);
}

function loadTheme() {
    const savedColor = localStorage.getItem('yesNoThemeColor');
    const savedDarkColor = localStorage.getItem('yesNoThemeDarkColor');
    const defaultColor = '#f9a825';
    const defaultDarkColor = '#f57f17';

    const colorToApply = savedColor || defaultColor;
    const darkColorToApply = savedDarkColor || defaultDarkColor;
    
    applyTheme(colorToApply, darkColorToApply);

    // Update selected class
    ynColorSelector.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('selected'));
    const selectedSwatch = ynColorSelector.querySelector(`[data-color="${colorToApply}"]`);
    if (selectedSwatch) {
        selectedSwatch.classList.add('selected');
    } else {
         // Fallback to default color if saved color is no longer an option
         ynColorSelector.querySelector(`[data-color="${defaultColor}"]`).classList.add('selected');
    }
}

// --- YES/NO GAME: LOGIC ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetYesNoGameUI() {
    clearInterval(yesNoGame.timerId);
    ynQuestionEl.style.display = 'block';
    ynTimerContainer.style.display = 'none';
    ynAnswersEl.style.display = 'none';
    ynNextQuestionBtn.style.display = 'none';
    ynStartBtn.style.display = 'block';
    ynImageContainer.style.display = 'none';
    ynPauseToggle.style.display = 'none';
    ynRoundSummaryEl.style.display = 'none';
    ynFeedbackEl.textContent = '';
    ynFeedbackEl.className = '';
    ynQuestionEl.textContent = yesNoQuestions.length > 0
        ? 'برای شروع بازی دکمه را بزنید.'
        : 'ابتدا از منو چند سوال بسازید.';
    yesNoGame.gameActive = false;
    yesNoGame.isPaused = false;
    ynPauseToggle.classList.remove('paused');
}

function startYesNoGame() {
    if (yesNoQuestions.length === 0) {
        alert('هیچ سوالی برای بازی وجود ندارد. لطفا ابتدا یک سوال بسازید.');
        return;
    }
    yesNoGame.allShuffledQuestions = shuffleArray([...yesNoQuestions]);
    startNextRound();
}

function startNextRound() {
    ynStartBtn.style.display = 'none';
    ynRoundSummaryEl.style.display = 'none';

    if (yesNoGame.allShuffledQuestions.length === 0) {
        // If no more questions are left in the bank, start a completely new game.
        startYesNoGame();
        return;
    }

    const questionsForThisRound = yesNoGame.allShuffledQuestions.splice(0, yesNoGame.questionsPerRound);
    yesNoGame.currentRoundQuestions = questionsForThisRound;
    yesNoGame.totalQuestionsInRound = questionsForThisRound.length;
    yesNoGame.score = 0;
    yesNoGame.questionsAnsweredInRound = 0;

    displayNextYesNoQuestion();
}

function displayNextYesNoQuestion() {
    ynNextQuestionBtn.style.display = 'none';
    // Reset button states
    ynYesBtn.disabled = false;
    ynNoBtn.disabled = false;
    ynYesBtn.classList.remove('correct-answer-highlight', 'user-correct', 'user-wrong');
    ynNoBtn.classList.remove('correct-answer-highlight', 'user-correct', 'user-wrong');

    if (yesNoGame.currentRoundQuestions.length === 0) {
        endCurrentRound();
        return;
    }

    yesNoGame.gameActive = true;
    yesNoGame.isPaused = false;
    yesNoGame.currentQuestion = yesNoGame.currentRoundQuestions.shift();
    yesNoGame.questionsAnsweredInRound++;

    if (yesNoGame.currentQuestion.image) {
        ynQuestionImage.src = yesNoGame.currentQuestion.image;
        ynImageContainer.style.display = 'block';
    } else {
        ynImageContainer.style.display = 'none';
    }

    ynQuestionEl.style.display = 'block';
    const progressText = `(${yesNoGame.questionsAnsweredInRound}/${yesNoGame.totalQuestionsInRound})`;
    ynQuestionEl.textContent = `${progressText} ${yesNoGame.currentQuestion.question}`;
    ynFeedbackEl.textContent = '';
    ynFeedbackEl.className = '';
    ynAnswersEl.style.display = 'flex';
    ynTimerContainer.style.display = 'block';
    ynPauseToggle.style.display = 'flex';
    ynPauseToggle.classList.remove('paused');

    yesNoGame.timer = yesNoGame.timerDuration;
    startYesNoTimer();
}

function endCurrentRound() {
    yesNoGame.gameActive = false;
    clearInterval(yesNoGame.timerId);

    // Hide all active game elements
    ynQuestionEl.style.display = 'none';
    ynImageContainer.style.display = 'none';
    ynTimerContainer.style.display = 'none';
    ynAnswersEl.style.display = 'none';
    ynPauseToggle.style.display = 'none';
    yesNoGame.isPaused = false;
    ynPauseToggle.classList.remove('paused');
    ynFeedbackEl.textContent = ''; // Clear feedback

    // Show round summary
    ynRoundSummaryEl.style.display = 'block';
    ynRoundScoreTextEl.textContent = `شما به ${yesNoGame.score} از ${yesNoGame.totalQuestionsInRound} سوال پاسخ صحیح دادید.`;
    
    // Update button text for next action
    if (yesNoGame.allShuffledQuestions.length === 0) {
        ynNextRoundBtn.textContent = 'بازی جدید';
    } else {
        ynNextRoundBtn.textContent = 'دور بعد';
    }
}

function startYesNoTimer() {
    ynTimerEl.textContent = yesNoGame.timer;
    clearInterval(yesNoGame.timerId);

    yesNoGame.timerId = setInterval(() => {
        yesNoGame.timer--;
        ynTimerEl.textContent = yesNoGame.timer;
        if (yesNoGame.timer <= 0) {
            checkYesNoAnswer(null); // Timeout is a wrong answer
        }
    }, 1000);
}

function checkYesNoAnswer(userAnswer) {
    if (!yesNoGame.gameActive) return;

    clearInterval(yesNoGame.timerId);
    yesNoGame.gameActive = false; // Prevent multiple answers
    yesNoGame.isPaused = false;
    ynPauseToggle.style.display = 'none';
    ynPauseToggle.classList.remove('paused');

    // Disable buttons to prevent further clicks
    ynYesBtn.disabled = true;
    ynNoBtn.disabled = true;

    const correctAnswer = yesNoGame.currentQuestion.answer;
    const isCorrect = userAnswer === correctAnswer;

    ynFeedbackEl.textContent = ''; // Clear feedback text

    if (userAnswer === null) { // Timeout
        ynFeedbackEl.className = 'timeout';
        if (correctAnswer) {
            ynYesBtn.classList.add('correct-answer-highlight');
        } else {
            ynNoBtn.classList.add('correct-answer-highlight');
        }
    } else {
        const clickedButton = userAnswer ? ynYesBtn : ynNoBtn;
        if (isCorrect) {
            yesNoGame.score++;
            clickedButton.classList.add('user-correct');
        } else {
            clickedButton.classList.add('user-wrong');
        }
    }

    if (yesNoGame.currentRoundQuestions.length === 0) {
        // Last question of the round. Show summary after a delay to show feedback.
        setTimeout(endCurrentRound, 1500);
    } else {
        ynNextQuestionBtn.style.display = 'block';
    }
}

function toggleYesNoPause() {
    if (!yesNoGame.gameActive) return;

    yesNoGame.isPaused = !yesNoGame.isPaused;
    ynPauseToggle.classList.toggle('paused', yesNoGame.isPaused);

    if (yesNoGame.isPaused) {
        clearInterval(yesNoGame.timerId);
        ynYesBtn.disabled = true;
        ynNoBtn.disabled = true;
    } else {
        startYesNoTimer();
        ynYesBtn.disabled = false;
        ynNoBtn.disabled = false;
    }
}


// --- CREATE QUESTION: LOGIC ---
function handleQuestionSubmit(event) {
    event.preventDefault();
    const questionText = questionTextEl.value.trim();
    if (!questionText) {
        alert('متن سوال نمیتواند خالی باشد.');
        return;
    }

    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked').value === 'yes';
    const imageFile = questionImageInput.files[0];

    const addQuestion = (imageData = null) => {
        const newQuestion = {
            question: questionText,
            answer: correctAnswer,
        };
        if (imageData) {
            newQuestion.image = imageData;
        }

        yesNoQuestions.push(newQuestion);
        saveQuestionsToLocalStorage();
        renderQuestionList();

        createQuestionForm.reset();
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            addQuestion(e.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addQuestion();
    }
}

function handleDeleteQuestionClick(event) {
    const target = event.target;
    if (target.classList.contains('delete-question-btn')) {
        const index = parseInt(target.dataset.index, 10);
        if (!isNaN(index) && index >= 0 && index < yesNoQuestions.length) {
            yesNoQuestions.splice(index, 1);
            saveQuestionsToLocalStorage();
            renderQuestionList();
        }
    }
}


function saveQuestionsToLocalStorage() {
    localStorage.setItem('yesNoQuestions', JSON.stringify(yesNoQuestions));
}

function loadQuestionsFromLocalStorage() {
    const saved = localStorage.getItem('yesNoQuestions');
    if (saved) {
        yesNoQuestions = JSON.parse(saved);
        renderQuestionList();
    }
}

function renderQuestionList() {
    questionListEl.innerHTML = '';
    if (yesNoQuestions.length === 0) {
        questionListEl.innerHTML = '<li>هنوز سوالی نساخته‌اید.</li>';
    } else {
        yesNoQuestions.forEach((q, i) => {
            const li = document.createElement('li');
            const imageHtml = q.image ? `<img src="${q.image}" alt="تصویر کوچک سوال">` : '';
            li.innerHTML = `
                <div class="question-info">
                    ${imageHtml}
                    <span>${q.question}</span>
                </div>
                <div class="question-actions">
                    <span class="answer">${q.answer ? 'بله' : 'خیر'}</span>
                    <button class="delete-question-btn" data-index="${i}">حذف</button>
                </div>
            `;
            questionListEl.appendChild(li);
        });
    }
}

// --- PANTOMIME GAME: TIMER LOGIC ---
function resetPantomimeUI() {
    clearInterval(pantomimeGame.timerId);
    pantomimeGame.gameActive = false;
    pantomimeGame.isPaused = false;
    pantomimeTimerEl.textContent = pantomimeGame.timerDuration;
    pantomimeStartBtn.style.display = 'inline-block';
    pantomimeEndBtn.style.display = 'none';
    pantomimeStartBtn.textContent = 'شروع';
    pantomimePauseToggle.style.display = 'none';
    pantomimePauseToggle.classList.remove('paused');
    drawingHistory = [];
    redoHistory = [];
    updateUndoRedoButtons();
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

function startPantomimeGame() {
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingHistory = [];
    redoHistory = [];
    updateUndoRedoButtons();
    pantomimeGame.gameActive = true;
    pantomimeGame.isPaused = false;
    pantomimeStartBtn.style.display = 'none';
    pantomimeEndBtn.style.display = 'inline-block';
    pantomimePauseToggle.style.display = 'flex';
    pantomimePauseToggle.classList.remove('paused');
    pantomimeGame.timer = pantomimeGame.timerDuration;
    startPantomimeTimer();
}

function startPantomimeTimer() {
    pantomimeTimerEl.textContent = pantomimeGame.timer;
    clearInterval(pantomimeGame.timerId);

    pantomimeGame.timerId = setInterval(() => {
        pantomimeGame.timer--;
        pantomimeTimerEl.textContent = pantomimeGame.timer;
        if (pantomimeGame.timer <= 0) {
            endAndResetPantomimeRound(true);
        }
    }, 1000);
}

function endAndResetPantomimeRound(isTimeout: boolean) {
    clearInterval(pantomimeGame.timerId);
    pantomimeGame.gameActive = false;
    pantomimeGame.isPaused = false;
    pantomimePauseToggle.style.display = 'none';
    pantomimePauseToggle.classList.remove('paused');
    
    drawingHistory = [];
    redoHistory = [];
    updateUndoRedoButtons();
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    pantomimeEndBtn.style.display = 'none';
    pantomimeStartBtn.style.display = 'inline-block';

    if (isTimeout) {
        pantomimeStartBtn.textContent = 'دور جدید';
    } else {
        pantomimeStartBtn.textContent = 'شروع';
    }
    
    pantomimeTimerEl.textContent = pantomimeGame.timerDuration;
}

function togglePantomimePause() {
    if (!pantomimeGame.gameActive) return;

    pantomimeGame.isPaused = !pantomimeGame.isPaused;
    pantomimePauseToggle.classList.toggle('paused', pantomimeGame.isPaused);
    drawingCanvas.style.cursor = pantomimeGame.isPaused ? 'default' : 'crosshair';


    if (pantomimeGame.isPaused) {
        clearInterval(pantomimeGame.timerId);
    } else {
        startPantomimeTimer();
    }
}


// --- PANTOMIME GAME: DRAWING LOGIC ---
function updateUndoRedoButtons() {
    undoBtn.disabled = drawingHistory.length === 0;
    redoBtn.disabled = redoHistory.length === 0;
}

function redrawCanvas() {
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingHistory.forEach(path => {
        if (path.points.length < 2) return;
        drawingContext.beginPath();
        drawingContext.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
            drawingContext.lineTo(path.points[i].x, path.points[i].y);
        }
        drawingContext.strokeStyle = path.color;
        drawingContext.lineWidth = path.width;
        drawingContext.lineCap = 'round';
        drawingContext.lineJoin = 'round';
        drawingContext.stroke();
    });
}

function initDrawingBoard() {
    drawingContext = drawingCanvas.getContext('2d');
    resizeCanvas();

    const getPos = (e) => {
        const rect = drawingCanvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : null;
        return {
            x: (touch ? touch.clientX : e.clientX) - rect.left,
            y: (touch ? touch.clientY : e.clientY) - rect.top
        };
    };

    const startDrawing = (e) => {
        if (!pantomimeGame.gameActive || pantomimeGame.isPaused) return;
        isDrawing = true;
        const pos = getPos(e);
        
        currentPath = {
            color: penColor,
            width: penWidth,
            points: [pos]
        };

        drawingContext.beginPath();
        drawingContext.moveTo(pos.x, pos.y);
        drawingContext.strokeStyle = penColor;
        drawingContext.lineWidth = penWidth;
        drawingContext.lineCap = 'round';
        drawingContext.lineJoin = 'round';
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        isDrawing = false;
        drawingContext.closePath();

        if (currentPath && currentPath.points.length > 1) {
            drawingHistory.push(currentPath);
            redoHistory = []; // Clear redo history on new action
            updateUndoRedoButtons();
        }
        currentPath = null;
    };

    const draw = (e) => {
        if (!isDrawing || !pantomimeGame.gameActive || pantomimeGame.isPaused) return;
        e.preventDefault();
        const pos = getPos(e);
        
        currentPath.points.push(pos);
        
        drawingContext.lineTo(pos.x, pos.y);
        drawingContext.stroke();
    };

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);

    drawingCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    drawingCanvas.addEventListener('touchmove', draw, { passive: false });
    drawingCanvas.addEventListener('touchend', stopDrawing);

    colorPalette.addEventListener('click', (e) => {
        if (e.target.matches('.color-swatch')) {
            penColor = e.target.dataset.color;
            penWidth = 5;
            
            colorPalette.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('selected'));
            e.target.classList.add('selected');
            eraserBtn.classList.remove('selected');
        }
    });

    eraserBtn.addEventListener('click', () => {
        penColor = '#ffffff';
        penWidth = 20;
        colorPalette.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('selected'));
        eraserBtn.classList.add('selected');
    });
    
    undoBtn.addEventListener('click', () => {
        if(drawingHistory.length > 0) {
            redoHistory.push(drawingHistory.pop());
            redrawCanvas();
            updateUndoRedoButtons();
        }
    });

    redoBtn.addEventListener('click', () => {
        if(redoHistory.length > 0) {
            drawingHistory.push(redoHistory.pop());
            redrawCanvas();
            updateUndoRedoButtons();
        }
    });

    clearBtn.addEventListener('click', () => {
        if(pantomimeGame.gameActive && !pantomimeGame.isPaused){
            drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawingHistory = [];
            redoHistory = [];
            updateUndoRedoButtons();
        }
    });
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = drawingCanvas.getBoundingClientRect();
    const { width, height } = drawingCanvas;

    if (width !== rect.width * dpr || height !== rect.height * dpr) {
        drawingCanvas.width = rect.width * dpr;
        drawingCanvas.height = rect.height * dpr;
        drawingContext.scale(dpr, dpr);
        redrawCanvas(); // Redraw content after resize
    }
}

// --- WHEEL OF PRIZES: LOGIC ---

function initWheel() {
    wheelContext = wheelCanvas.getContext('2d');
    loadWheelSettings();
    resizeWheelCanvas();
    drawWheel();
}

function resizeWheelCanvas() {
    const container = document.getElementById('wheel-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    wheelCanvas.width = size;
    wheelCanvas.height = size;
    drawWheel();
}

function loadWheelSettings() {
    const savedPrizes = localStorage.getItem('wheelPrizes');
    let prizesToLoad = [
        { name: 'جایزه ۱', weight: 1 }, { name: 'جایزه ۲', weight: 1 },
        { name: 'جایزه ۳', weight: 1 }, { name: 'جایزه ۴', weight: 1 },
        { name: 'جایزه ۵', weight: 1 }, { name: 'جایزه ۶', weight: 1 }
    ];

    if (savedPrizes) {
        try {
            let parsedPrizes = JSON.parse(savedPrizes);
            if (Array.isArray(parsedPrizes) && parsedPrizes.length > 0) {
                // Migration from old string[] format to new {name, weight}[] format
                if (typeof parsedPrizes[0] === 'string') {
                    prizesToLoad = parsedPrizes.map(p => ({ name: p, weight: 1 }));
                } else if (typeof parsedPrizes[0] === 'object' && parsedPrizes[0].hasOwnProperty('name')) {
                    prizesToLoad = parsedPrizes;
                }
            }
        } catch (e) {
            console.error("Failed to parse wheel prizes from localStorage", e);
        }
    }
    
    wheelGame.prizes = prizesToLoad;
    wheelGame.prizeCount = prizesToLoad.length;
    
    renderWheelPrizeInputs();
}

function renderWheelPrizeInputs() {
    wheelPrizesContainer.innerHTML = '';
    wheelGame.prizes.forEach(p => addPrizeInput(p));
}

function addPrizeInput(prize = { name: '', weight: 1 }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'prize-input-wrapper';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'setting-input prize-name-input';
    nameInput.value = prize.name;
    nameInput.placeholder = 'نام جایزه';

    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.className = 'setting-input prize-weight-input';
    weightInput.value = prize.weight.toString();
    weightInput.min = '0';
    weightInput.title = 'شانس';


    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-prize-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'حذف گزینه';

    wrapper.appendChild(nameInput);
    wrapper.appendChild(weightInput);
    wrapper.appendChild(removeBtn);
    wheelPrizesContainer.appendChild(wrapper);
}

function handlePrizeRemove(event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('remove-prize-btn')) {
        if (wheelPrizesContainer.querySelectorAll('.prize-input-wrapper').length <= 2) {
            alert('گردونه باید حداقل ۲ گزینه داشته باشد.');
            return;
        }
        target.closest('.prize-input-wrapper').remove();
    }
}


function applyWheelSettings() {
    const prizeWrappers = wheelPrizesContainer.querySelectorAll('.prize-input-wrapper');
    const newPrizes = Array.from(prizeWrappers).map(wrapper => {
        const name = (wrapper.querySelector('.prize-name-input') as HTMLInputElement).value.trim();
        const weight = parseFloat((wrapper.querySelector('.prize-weight-input') as HTMLInputElement).value) || 0;
        return { name, weight };
    }).filter(p => p.name && p.weight > 0);

    if (newPrizes.length < 2) {
        alert('گردونه باید حداقل ۲ گزینه داشته باشد.');
        return;
    }

    if (newPrizes.length > 20) {
        alert('گردونه حداکثر می‌تواند ۲۰ گزینه داشته باشد.');
        return;
    }

    wheelGame.prizes = newPrizes;
    wheelGame.prizeCount = newPrizes.length;

    localStorage.setItem('wheelPrizeCount', wheelGame.prizeCount.toString());
    localStorage.setItem('wheelPrizes', JSON.stringify(wheelGame.prizes));

    wheelMainMenu.classList.remove('open');
    wheelMenuToggle.classList.remove('open');
    drawWheel();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.lineWidth=2;
    ctx.strokeStyle='#a1882c'; // Dark gold
    ctx.fillStyle = '#ffd700'; // Gold
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawWheel() {
    const numPrizes = wheelGame.prizeCount;
    if (numPrizes < 2) return;

    const angle = wheelGame.startAngle + wheelGame.spinAngle;
    const arc = Math.PI * 2 / numPrizes;
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = centerX * 0.95;

    wheelContext.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    wheelContext.save();
    wheelContext.translate(centerX, centerY);
    wheelContext.rotate(angle);

    for (let i = 0; i < numPrizes; i++) {
        const prizeText = wheelGame.prizes[i]?.name || `جایزه ${i + 1}`;
        const segmentAngle = i * arc;

        // Draw segment
        wheelContext.beginPath();
        wheelContext.fillStyle = wheelGame.colors[i % wheelGame.colors.length];
        wheelContext.moveTo(0, 0);
        wheelContext.arc(0, 0, radius, segmentAngle, segmentAngle + arc);
        wheelContext.closePath();
        wheelContext.fill();
        
        // Draw segment border
        wheelContext.strokeStyle = '#00000033';
        wheelContext.lineWidth = 2;
        wheelContext.stroke();


        // Draw text
        wheelContext.save();
        wheelContext.rotate(segmentAngle + arc / 2);
        wheelContext.textAlign = 'right';
        wheelContext.fillStyle = '#fff';
        wheelContext.font = `bold ${Math.max(12, 20 - numPrizes)}px Vazirmatn, sans-serif`;
        wheelContext.shadowColor = 'black';
        wheelContext.shadowBlur = 3;
        wheelContext.fillText(prizeText, radius * 0.85, 5);
        wheelContext.restore();
    }
    wheelContext.restore();
    
    // Draw the star in the center
    const starRadius = radius * 0.12;
    drawStar(wheelContext, centerX, centerY, 5, starRadius, starRadius / 2);
}

function handleSpinClick() {
    if (wheelGame.isSpinning) return;
    
    const totalWeight = wheelGame.prizes.reduce((sum, p) => sum + (p.weight || 0), 0);
    if (totalWeight <= 0) {
        alert('لطفا برای گزینه‌ها شانس (وزن) معتبر و مثبت وارد کنید.');
        return;
    }

    wheelSpinSound.currentTime = 0;
    wheelSpinSound.play();

    wheelGame.isSpinning = true;
    wheelSpinBtn.disabled = true;
    wheelGame.spinStartTime = null; 

    // --- WEIGHTED WINNER SELECTION ---
    const randomWeight = Math.random() * totalWeight;
    let weightSum = 0;
    let winnerIndex = -1;

    for (let i = 0; i < wheelGame.prizes.length; i++) {
        weightSum += wheelGame.prizes[i].weight;
        if (randomWeight <= weightSum) {
            winnerIndex = i;
            break;
        }
    }
    
    // Fallback if something goes wrong (shouldn't happen with valid weights)
    if (winnerIndex === -1) {
        winnerIndex = wheelGame.prizes.length - 1;
    }
    
    wheelGame.winnerIndex = winnerIndex;
    
    const numPrizes = wheelGame.prizeCount;
    const arc = Math.PI * 2 / numPrizes;
    
    const targetAngleOnWheel = arc * wheelGame.winnerIndex + (arc / 2);
    const finalAngle = (3 * Math.PI / 2) - targetAngleOnWheel;
    const fullSpins = (8 + Math.floor(Math.random() * 5)) * Math.PI * 2;
    const currentAngle = wheelGame.startAngle % (Math.PI * 2);
    const requiredMovement = (finalAngle - currentAngle + Math.PI * 2 * 100) % (Math.PI * 2);
    
    wheelGame.spinAngleTotal = fullSpins + requiredMovement;
    wheelGame.spinAngle = 0; // Reset before starting

    requestAnimationFrame(spin);
}

const customWheelEase = t => 1 - Math.pow(1 - t, 4); // Eased out for a more natural slowdown

function spin(timestamp) {
    if (!wheelGame.spinStartTime) {
        wheelGame.spinStartTime = timestamp;
    }
    const elapsed = timestamp - wheelGame.spinStartTime;
    
    if (elapsed < wheelGame.spinDuration) {
        const progress = elapsed / wheelGame.spinDuration;
        wheelGame.spinAngle = wheelGame.spinAngleTotal * customWheelEase(progress);
        drawWheel();
        requestAnimationFrame(spin);
    } else {
        // Animation has finished
        wheelGame.spinAngle = wheelGame.spinAngleTotal;
        drawWheel(); 

        wheelGame.isSpinning = false;
        wheelSpinBtn.disabled = false;
        // The new start angle is the old one plus the total spin, normalized.
        wheelGame.startAngle = (wheelGame.startAngle + wheelGame.spinAngleTotal) % (Math.PI * 2);
        
        wheelSpinSound.pause();
        
        // Display the pre-determined winner
        const winnerText = wheelGame.prizes[wheelGame.winnerIndex]?.name || `جایزه ${wheelGame.winnerIndex + 1}`;
        
        if (winnerText.trim() === 'پوچ') {
            wheelResultTextEl.textContent = 'پوچ';
        } else {
            wheelResultTextEl.textContent = `شما برنده ${winnerText} شدید`;
        }
        
        wheelResultEl.classList.add('show');
    }
}


// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    if (currentView === 'shell-game') {
        const deltaTime = clock.getDelta();
        updateAnimations(deltaTime);
        renderer.render(scene, camera);
    }
}

// --- START ---
init();