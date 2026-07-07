const gameBoard = document.getElementById("game-board");
const messageBox = document.getElementById("message-box");
const coinsText = document.getElementById("coins");
const keyStatus = document.getElementById("key-status");
const playerNameText = document.getElementById("player-name");
const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const mobileControls = document.getElementById("mobile-controls");

const upButton = document.getElementById("up-button");
const downButton = document.getElementById("down-button");
const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

const SHEET_COLUMNS = 12;
const SHEET_ROWS = 11;

const soundButton = document.getElementById("sound-button");

let audioContext;
let soundOn = true;
let backgroundMusicStarted = false;

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
    }

    return audioContext;
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

    setInterval(function() {
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

/*
    These numbers choose which tile from tilemap_packed.png to show.

    col = column number from left to right
    row = row number from top to bottom

    The first tile is:
    col 0, row 0
*/
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

let map = [];

let player = {
    name: "Traveler",
    row: 8,
    col: 2,
    coins: 0,
    hasKey: false,
    gameStarted: false
};

function copyMap() {
    return originalMap.map(function(row) {
        return row.slice();
    });
}

function setTileSprite(tile, spriteName) {
    const sprite = tileSprites[spriteName];

    if (!sprite) {
        return;
    }

    const xPosition = (sprite.col / (SHEET_COLUMNS - 1)) * 100;
    const yPosition = (sprite.row / (SHEET_ROWS - 1)) * 100;

    tile.style.backgroundPosition = xPosition + "% " + yPosition + "%";
}

function startGame() {
    const typedName = nameInput.value.trim();

    if (typedName !== "") {
        player.name = typedName;
    } else {
        player.name = "Traveler";
    }

    player.row = 8;
    player.col = 2;
    player.coins = 0;
    player.hasKey = false;
    player.gameStarted = true;

    map = copyMap();

    document.body.classList.remove("win");
    startScreen.classList.add("hidden");
    mobileControls.classList.remove("hidden");

    updateHud();
    drawMap();

    messageBox.textContent = "Welcome, " + player.name + "! Collect 3 coins and find the HIDDEN key to unlock the gate.";
    startBackgroundMusic();
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
                setTileSprite(tile, "player");
                tile.classList.add("player");
            } else {
                setTileSprite(tile, tileType);
            }

            gameBoard.appendChild(tile);
        }
    }
}

function movePlayer(rowChange, colChange) {
    if (!player.gameStarted) {
        messageBox.textContent = "Press Start first.";
        return;
    }

    const newRow = player.row + rowChange;
    const newCol = player.col + colChange;

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

    if (nextTile === "coin") {
        playCoinSound();
        player.coins++;
        map[newRow][newCol] = "spawn";
        messageBox.textContent = "You collected a coin! You have " + player.coins + "/3 coins.";
    } else if (nextTile === "key") {
        playKeySound();
        player.hasKey = true;
        map[newRow][newCol] = "cow";
    
        messageBox.textContent = "You found the hidden key! Now find the gate.";
    } else if (nextTile === "chicken") {
        playChickenSound();
        messageBox.textContent = "Meet Sally!";
    } else if (nextTile === "flower") {
        playFlowerSound();
        messageBox.textContent = "A cute flower patch. Very cottagecore.";
    } else if (nextTile === "gate") {
        if (player.hasKey && player.coins >= 3) {
            player.row = newRow;
            player.col = newCol;
            winGame();
            map[newRow][newCol] = "doorOpen";
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

function winGame() {
    document.body.classList.add("win");
    playWinSound();
    messageBox.textContent = "You unlocked the gate and escaped the cozy maze. You win!";
    updateHud();
    drawMap();
}

function playChickenSound() {
    playTone(520, 0.08, "square", 0.05);

    setTimeout(function() {
        playTone(680, 0.08, "square", 0.05);
    }, 90);

    setTimeout(function() {
        playTone(520, 0.1, "square", 0.04);
    }, 180);
}

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

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

soundButton.addEventListener("click", function() {
    soundOn = !soundOn;

    if (soundOn) {
        soundButton.textContent = "Sound: On";
        startBackgroundMusic();
    } else {
        soundButton.textContent = "Sound: Off";
    }
});

startButton.addEventListener("click", startGame);

nameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        startGame();
    }
});

upButton.addEventListener("click", function() {
    movePlayer(-1, 0);
});

downButton.addEventListener("click", function() {
    movePlayer(1, 0);
});

leftButton.addEventListener("click", function() {
    movePlayer(0, -1);
});

rightButton.addEventListener("click", function() {
    movePlayer(0, 1);
});

map = copyMap();
drawMap();