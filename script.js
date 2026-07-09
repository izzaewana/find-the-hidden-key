const introScreen = document.getElementById("intro-screen");
const characterScreen = document.getElementById("character-screen");
const levelScreen = document.getElementById("level-screen");
const gameScreen = document.getElementById("game-screen");

const goCharacterButton = document.getElementById("go-character-button");
const goLevelButton = document.getElementById("go-level-button");
const backCharacterButton = document.getElementById("back-character-button");
const levelOneButton = document.getElementById("level-one-button");

const travelerCard = document.getElementById("traveler-card");
const sallyCard = document.getElementById("sally-card");
const sallyText = document.getElementById("sally-text");
const travelerPreview = document.getElementById("traveler-preview");
const sallyPreview = document.getElementById("sally-preview");

const gameBoard = document.getElementById("game-board");
const messageBox = document.getElementById("message-box");
const coinsText = document.getElementById("coins");
const keyStatus = document.getElementById("key-status");
const playerNameText = document.getElementById("player-name");
const nameInput = document.getElementById("name-input");

const mobileControls = document.getElementById("mobile-controls");
const upButton = document.getElementById("up-button");
const downButton = document.getElementById("down-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

const soundButton = document.getElementById("sound-button");

const confettiContainer = document.getElementById("confetti-container");
const unlockPopup = document.getElementById("unlock-popup");
const unlockedCharacter = document.getElementById("unlocked-character");
const closeUnlockButton = document.getElementById("close-unlock-button");

// const endButtons = document.getElementById("end-buttons");
// const playAgainButton = document.getElementById("play-again-button");
// const returnLevelButton = document.getElementById("return-level-button");
// const chooseCharacterButton = document.getElementById("choose-character-button");

const endPopup = document.getElementById("end-popup");
const replayButton = document.getElementById("replay-button");
const levelsButton = document.getElementById("levels-button");
const charactersButton = document.getElementById("characters-button");

const SHEET_COLUMNS = 12;
const SHEET_ROWS = 11;

const chickenAudio = new Audio("./assets/chicken.wav");
chickenAudio.volume = 0.2;
chickenAudio.preload = "auto";

let audioContext;
let soundOn = true;
let backgroundMusicStarted = false;
let backgroundMusicInterval;

let map = [];

let selectedCharacter = "player";

let player = {
    name: "Traveler",
    row: 8,
    col: 2,
    coins: 0,
    hasKey: false,
    gameStarted: false
};

const tileSprites = {
    grass: { col: 0, row: 2 },
    grassSpot: { col: 0, row: 0 },
    path: { col: 0, row: 2 },
    Epath: { col: 0, row: 1 },
    Spath: { col: 0, row: 3 },
    Rpath: { col: 0, row: 5 },
    R2path: { col: 1, row: 5 },
    Lpath: { col: 2, row: 5 },
    tree: { col: 4, row: 1 },
    Lwater: { col: 2, row: 9 },
    Rwater: { col: 3, row: 9 },
    chicken: { col: 2, row: 10 },
    fence: { col: 2, row: 6 },
    gate: { col: 7, row: 10 },
    coin: { col: 8, row: 5 },
    key: { col: 4, row: 1 },
    flower: { col: 11, row: 6 },
    cow: { col: 1, row: 10 },
    spawn: { col: 5, row: 6 },
    doorOpen: { col: 4, row: 6 },
    player: { col: 0, row: 9 }
};

const originalMap = [
    ["tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree"],
    ["tree", "Epath", "grassSpot", "coin", "Epath", "Epath", "flower", "Epath", "gate", "tree"],
    ["tree", "grass", "tree", "tree", "grass", "Lwater", "Rwater", "grass", "path", "tree"],
    ["tree", "Spath", "Epath", "Epath", "Spath", "Spath", "grass", "Spath", "path", "tree"],
    ["tree", "tree", "grass", "Spath", "tree", "tree", "grass", "tree", "grass", "tree"],
    ["tree", "coin", "Spath", "Rpath", "R2path", "Lpath", "grass", "tree", "grass", "key"],
    ["tree", "grass", "tree", "tree", "tree", "tree", "Spath", "grassSpot", "Spath", "tree"],
    ["tree", "chicken", "R2path", "flower", "Lpath", "tree", "tree", "tree", "coin", "tree"],
    ["tree", "Spath", "spawn", "tree", "tree", "Rpath", "R2path", "R2path", "Lpath", "tree"],
    ["tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree", "tree"]
];

function copyMap() {
    return originalMap.map(function(row) {
        return row.slice();
    });
}

function showScreen(screen) {
    introScreen.classList.add("hidden");
    characterScreen.classList.add("hidden");
    levelScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}

function setElementSprite(element, spriteName) {
    const sprite = tileSprites[spriteName];

    if (!sprite) {
        return;
    }

    const xPosition = (sprite.col / (SHEET_COLUMNS - 1)) * 100;
    const yPosition = (sprite.row / (SHEET_ROWS - 1)) * 100;

    element.style.backgroundPosition = xPosition + "% " + yPosition + "%";
}

function setTileSprite(tile, spriteName) {
    setElementSprite(tile, spriteName);
}

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
    }

    return audioContext;
}

async function unlockAudio() {
    if (!soundOn) {
        return;
    }

    const audio = getAudioContext();

    if (audio.state === "suspended") {
        await audio.resume();
    }

    // Unlock WebAudio sounds
    playTone(440, 0.05, "sine", 0.01);

    // Unlock chicken audio file on mobile browsers
    chickenAudio.muted = true;

    try {
        await chickenAudio.play();
        chickenAudio.pause();
        chickenAudio.currentTime = 0;
    } catch (error) {
        console.log("Chicken unlock error:", error);
    }

    chickenAudio.muted = false;
}

function playTone(frequency, duration, type = "sine", volume = 0.08) {
    if (!soundOn) {
        return;
    }

    const audio = getAudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
}

function playCoinSound() {
    playTone(880, 0.08, "square", 0.06);

    setTimeout(function() {
        playTone(1175, 0.1, "square", 0.05);
    }, 80);
}

function playKeySound() {
    playTone(523, 0.12, "sine", 0.07);

    setTimeout(function() {
        playTone(659, 0.12, "sine", 0.07);
    }, 120);

    setTimeout(function() {
        playTone(784, 0.18, "sine", 0.07);
    }, 240);
}

function playFlowerSound() {
    playTone(698, 0.1, "triangle", 0.04);

    setTimeout(function() {
        playTone(880, 0.12, "triangle", 0.04);
    }, 100);
}

function playBlockedSound() {
    playTone(160, 0.12, "sawtooth", 0.05);
}


// function playChickenSound() {
//     playTone(700, 0.06, "square", 0.08);

//     setTimeout(function() {
//         playTone(420, 0.08, "square", 0.08);
//     }, 80);

//     setTimeout(function() {
//         playTone(700, 0.06, "square", 0.07);
//     }, 170);

//     setTimeout(function() {
//         playTone(420, 0.1, "square", 0.07);
//     }, 250);
// }

function playChickenSound() {
    if (!soundOn) {
        return;
    }

    chickenAudio.pause();
    chickenAudio.currentTime = 0;

    chickenAudio.play().catch(function(error) {
        console.log("Chicken sound error:", error);
    });
}
function playWinSound() {
    playTone(523, 0.12, "square", 0.07);

    setTimeout(function() {
        playTone(659, 0.12, "square", 0.07);
    }, 120);

    setTimeout(function() {
        playTone(784, 0.12, "square", 0.07);
    }, 240);

    setTimeout(function() {
        playTone(1046, 0.3, "square", 0.07);
    }, 360);
}

function startBackgroundMusic() {
    if (!soundOn || backgroundMusicStarted) {
        return;
    }

    backgroundMusicStarted = true;

    const melody = [
        261.63, 329.63, 392.00, 329.63,
        293.66, 349.23, 440.00, 349.23,
        261.63, 329.63, 392.00, 523.25,
        440.00, 392.00, 329.63, 293.66
    ];

    let index = 0;

    backgroundMusicInterval = setInterval(function() {
        if (!soundOn) {
            return;
        }

        playTone(melody[index], 0.6, "sine", 0.018);

        index++;

        if (index >= melody.length) {
            index = 0;
        }
    }, 850);
}

function stopBackgroundMusic() {
    if (backgroundMusicInterval) {
        clearInterval(backgroundMusicInterval);
        backgroundMusicInterval = null;
    }

    backgroundMusicStarted = false;
}

function updateHud() {
    playerNameText.textContent = player.name;
    coinsText.textContent = player.coins;
    keyStatus.textContent = player.hasKey ? "Yes" : "No";
}

function drawMap() {
    gameBoard.innerHTML = "";

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const tile = document.createElement("div");
            const tileType = map[row][col];

            tile.classList.add("tile");
            tile.classList.add(tileType);

            if (row === player.row && col === player.col) {
                setTileSprite(tile, selectedCharacter);
                tile.classList.add("player");
            } else {
                setTileSprite(tile, tileType);
            }

            gameBoard.appendChild(tile);
        }
    }
}

function startGame() {
    const typedName = nameInput.value.trim();

    endPopup.classList.add("hidden");

    player.name = typedName !== "" ? typedName : "Traveler";
    player.row = 8;
    player.col = 2;
    player.coins = 0;
    player.hasKey = false;
    player.gameStarted = true;

    map = copyMap();

    document.body.classList.remove("win");

    updateHud();
    drawMap();

    messageBox.textContent = "Welcome, " + player.name + "! Collect 3 coins and find the HIDDEN key to unlock the gate.";

    showScreen(gameScreen);
    startBackgroundMusic();
}

function movePlayer(rowChange, colChange) {
    if (!player.gameStarted) {
        messageBox.textContent = "Choose a level first.";
        return;
    }

    const newRow = player.row + rowChange;
    const newCol = player.col + colChange;


    // Stop player from walking outside the map
    if (
        newRow < 0 ||
        newRow >= map.length ||
        newCol < 0 ||
        newCol >= map[0].length
    ) {
        playBlockedSound();
        messageBox.textContent = "You cannot leave the maze.";
        return;
    }

    const nextTile = map[newRow][newCol];

    if (nextTile === "tree" || nextTile === "fence") {
        playBlockedSound();
        messageBox.textContent = "Something blocks your way.";
        return;
    }

    if (nextTile === "Lwater" || nextTile === "Rwater") {
        playBlockedSound();
        messageBox.textContent = "You cannot walk into the water.";
        return;
    }

    if (nextTile === "chicken") {
        playChickenSound();
        messageBox.textContent = "Meet Sally! Bawk bawk.";
    } else if (nextTile === "coin") {
        playCoinSound();
        player.coins++;
        map[newRow][newCol] = "spawn";
        messageBox.textContent = "You collected a coin! You have " + player.coins + "/3 coins.";
    } else if (nextTile === "key") {
        playKeySound();
        player.hasKey = true;
        map[newRow][newCol] = "cow";
        messageBox.textContent = "You found the hidden key! Now find the gate.";
    } else if (nextTile === "flower") {
        playFlowerSound();
        messageBox.textContent = "A cute flower patch. Very cottagecore.";
    } else if (nextTile === "gate") {
        if (player.hasKey && player.coins >= 3) {
            player.row = newRow;
            player.col = newCol;
            map[newRow][newCol] = "doorOpen";
            winGame();
            return;
        } else {
            playBlockedSound();
            messageBox.textContent = "The gate needs 3 coins and a key.";
            return;
        }
    } else {
        messageBox.textContent = "You walk through the cozy maze.";
    }

    player.row = newRow;
    player.col = newCol;

    updateHud();
    drawMap();
}

function createConfetti() {
    const colors = ["#f87171", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#fb923c"];

    for (let i = 0; i < 90; i++) {
        const confetti = document.createElement("div");

        confetti.classList.add("confetti");
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.8 + "s";
        confetti.style.animationDuration = 2 + Math.random() * 1.5 + "s";

        confettiContainer.appendChild(confetti);

        setTimeout(function() {
            confetti.remove();
        }, 4000);
    }
}

function showCharacterUnlock() {
    const alreadyUnlocked = localStorage.getItem("sallyUnlocked");

    if (alreadyUnlocked === "yes") {
        return;
    }

    localStorage.setItem("sallyUnlocked", "yes");

    setElementSprite(unlockedCharacter, "chicken");
    unlockPopup.classList.remove("hidden");

    updateCharacterScreen();
}

function winGame() {
    document.body.classList.add("win");
    playWinSound();
    createConfetti();

    messageBox.textContent = "You unlocked the gate and escaped the cozy maze. You win!";

    updateHud();
    drawMap();

    setTimeout(function() {
        endPopup.classList.remove("hidden");
    }, 700);

    setTimeout(function() {
        showCharacterUnlock();
    }, 1200);
}

function updateCharacterScreen() {
    const sallyUnlocked = localStorage.getItem("sallyUnlocked") === "yes";

    setElementSprite(travelerPreview, "player");
    setElementSprite(sallyPreview, "chicken");

    if (sallyUnlocked) {
        sallyCard.classList.remove("locked");
        sallyText.textContent = "Sally";
    } else {
        sallyCard.classList.add("locked");
        sallyText.textContent = "Sally 🔒";
    }
    selectCharacter(selectedCharacter);
}

function selectCharacter(characterName) {
    const sallyUnlocked = localStorage.getItem("sallyUnlocked") === "yes";

    if (characterName === "chicken" && !sallyUnlocked) {
        playBlockedSound();
        messageBox.textContent = "Sally is still locked. Win Level 1 to unlock her!";
        return;
    }

    selectedCharacter = characterName;

    travelerCard.classList.remove("selected");
    sallyCard.classList.remove("selected");

    if (selectedCharacter === "player") {
        travelerCard.classList.add("selected");
    }

    if (selectedCharacter === "chicken") {
        sallyCard.classList.add("selected");
    }
}

/* EVENTS */
goCharacterButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    updateCharacterScreen();
    showScreen(characterScreen);
});

goLevelButton.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    showScreen(levelScreen);
});

backCharacterButton.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    stopBackgroundMusic();
    showScreen(characterScreen);
});

levelOneButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    startGame();
});

levelsButton.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    stopBackgroundMusic();
    player.gameStarted = false;
    document.body.classList.remove("win");
    endPopup.classList.add("hidden");
    showScreen(levelScreen);
});

travelerCard.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    selectCharacter("player");
});

sallyCard.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    selectCharacter("chicken");
});

soundButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();

    soundOn = !soundOn;

    if (soundOn) {
        soundButton.textContent = "Sound: On";
        await unlockAudio();
        startBackgroundMusic();
    } else {
        soundButton.textContent = "Sound: Off";
        stopBackgroundMusic();

    }
});

closeUnlockButton.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    unlockPopup.classList.add("hidden");
});

document.addEventListener("keydown", function(event) {
    if (event.target.tagName === "INPUT") {
        return;
    }

    const key = event.key.toLowerCase();

    const movementKeys = [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d"
    ];

    if (movementKeys.includes(key)) {
        event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
        movePlayer(-1, 0);
    } else if (key === "arrowdown" || key === "s") {
        movePlayer(1, 0);
    } else if (key === "arrowleft" || key === "a") {
        movePlayer(0, -1);
    } else if (key === "arrowright" || key === "d") {
        movePlayer(0, 1);
    }
});

nameInput.addEventListener("keydown", async function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        await unlockAudio();
        updateCharacterScreen();
        showScreen(characterScreen);
    }
});

upButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    movePlayer(-1, 0);
});

downButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    movePlayer(1, 0);
});

leftButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    movePlayer(0, -1);
});

rightButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    movePlayer(0, 1);
});

replayButton.addEventListener("pointerdown", async function(event) {
    event.preventDefault();
    await unlockAudio();
    endPopup.classList.add("hidden");
    startGame();
});
;

charactersButton.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    stopBackgroundMusic();
    player.gameStarted = false;
    document.body.classList.remove("win");
    endPopup.classList.add("hidden");
    updateCharacterScreen();
    showScreen(characterScreen);
});

/* INIT */
map = copyMap();
updateCharacterScreen();
selectCharacter("player");
drawMap();