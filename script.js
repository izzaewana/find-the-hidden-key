const storyText = document.getElementById("story-text");
const choices = document.getElementById("choices");
const scene = document.getElementById("scene");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const nameInput = document.getElementById("name-input");
const statusBar = document.getElementById("status-bar");
const playerNameText = document.getElementById("player-name");
const healthText = document.getElementById("health");
const coinsText = document.getElementById("coins");
const map = document.getElementById("map");
const playerToken = document.getElementById("player-token");

let player = {
    name: "",
    health: 3,
    coins: 0,
    hasKey: false
};

const playerPositions = {
    start: {
        left: "262px",
        top: "203px"
    },
    tunnel: {
        left: "92px",
        top: "128px"
    },
    key: {
        left: "58px",
        top: "38px"
    },
    river: {
        left: "428px",
        top: "128px"
    },
    bridge: {
        left: "462px",
        top: "38px"
    },
    exit: {
        left: "268px",
        top: "28px"
    },
    forest: {
        left: "472px",
        top: "203px"
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function movePlayer(location) {
    playerToken.style.left = playerPositions[location].left;
    playerToken.style.top = playerPositions[location].top;
}

function playSound(type) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.connect(gain);
    gain.connect(audio.destination);

    if (type === "click") {
        oscillator.frequency.value = 500;
    } else if (type === "win") {
        oscillator.frequency.value = 800;
    } else if (type === "lose") {
        oscillator.frequency.value = 150;
    } else {
        oscillator.frequency.value = 300;
    }

    gain.gain.value = 0.08;
    oscillator.start();

    setTimeout(function() {
        oscillator.stop();
        audio.close();
    }, 150);
}

async function typeText(text) {
    storyText.textContent = "";

    for (let char of text) {
        storyText.textContent += char;
        await sleep(28);
    }
}

function updateStatus() {
    playerNameText.textContent = player.name;
    healthText.textContent = "❤️".repeat(player.health);
    coinsText.textContent = player.coins;
}

function clearChoices() {
    choices.innerHTML = "";
}

function showChoices(options) {
    clearChoices();

    for (let option of options) {
        const button = document.createElement("button");
        button.textContent = option.text;

        if (option.type === "danger") {
            button.classList.add("danger");
        }

        if (option.type === "safe") {
            button.classList.add("safe");
        }

        button.onclick = function() {
            playSound("click");
            option.action();
        };

        choices.appendChild(button);
    }
}

function takeDamage() {
    player.health--;
    updateStatus();

    if (player.health <= 0) {
        loseGame("Your health is gone. The maze becomes darker and darker... Game over.");
        return true;
    }

    return false;
}

async function startGame() {
    const typedName = nameInput.value.trim();

    if (typedName === "") {
        player.name = "Traveler";
    } else {
        player.name = typedName;
    }

    player.health = 3;
    player.coins = 0;
    player.hasKey = false;

    document.body.classList.remove("win");
    document.body.classList.remove("lose");

    startScreen.classList.add("hidden");
    statusBar.classList.remove("hidden");
    map.classList.remove("hidden");

    updateStatus();
    movePlayer("start");

    scene.textContent = "🌙";
    clearChoices();

    await typeText("Welcome, " + player.name + ". You wake up inside a dark maze. The air is cold, and you hear footsteps behind you...");

    showChoices([
        {
            text: "Go Left",
            action: goLeft
        },
        {
            text: "Go Right",
            action: goRight
        },
        {
            text: "Call for Help",
            action: callForHelp,
            type: "danger"
        }
    ]);
}

async function goLeft() {
    scene.textContent = "🕳️";
    movePlayer("tunnel");
    clearChoices();

    await typeText("You walk left and find a dark tunnel. Something shiny is glowing at the end.");

    showChoices([
        {
            text: "Enter Tunnel",
            action: enterTunnel
        },
        {
            text: "Pick Up Shiny Object",
            action: pickUpKey,
            type: "safe"
        },
        {
            text: "Run Back",
            action: runBack
        }
    ]);
}

async function goRight() {
    scene.textContent = "🌊";
    movePlayer("river");
    clearChoices();

    await typeText("You walk right and reach a river. There is an old wooden bridge above it. The water is moving fast.");

    showChoices([
        {
            text: "Use Bridge",
            action: useBridge,
            type: "safe"
        },
        {
            text: "Swim Across",
            action: swimAcross,
            type: "danger"
        },
        {
            text: "Search Riverbank",
            action: searchRiverbank
        }
    ]);
}

async function callForHelp() {
    scene.textContent = "👹";
    clearChoices();

    await typeText("You call for help. Something answers... but it is not human. You lose 1 health.");

    const isDead = takeDamage();

    if (!isDead) {
        showChoices([
            {
                text: "Run Left",
                action: goLeft
            },
            {
                text: "Run Right",
                action: goRight
            }
        ]);
    }
}

async function enterTunnel() {
    scene.textContent = "💰";
    movePlayer("tunnel");
    clearChoices();

    player.coins += 10;
    updateStatus();

    await typeText("You enter the tunnel and find a treasure chest. You collect 10 coins. Behind the chest, there is a locked golden door.");

    showChoices([
        {
            text: "Open Golden Door",
            action: openGoldenDoor,
            type: "safe"
        },
        {
            text: "Leave Tunnel",
            action: goRight
        }
    ]);
}

async function pickUpKey() {
    scene.textContent = "🗝️";
    movePlayer("key");
    clearChoices();

    player.hasKey = true;
    updateStatus();

    await typeText("You pick up the shiny object. It is a golden key. This might be useful later.");

    showChoices([
        {
            text: "Enter Tunnel",
            action: enterTunnel
        },
        {
            text: "Go Back",
            action: goRight
        }
    ]);
}

async function runBack() {
    scene.textContent = "🏃";
    movePlayer("start");
    clearChoices();

    await typeText("You run back, but you trip on a broken stone. You lose 1 health.");

    const isDead = takeDamage();

    if (!isDead) {
        showChoices([
            {
                text: "Go Left Again",
                action: goLeft
            },
            {
                text: "Go Right",
                action: goRight
            }
        ]);
    }
}

async function openGoldenDoor() {
    clearChoices();

    if (player.hasKey) {
        scene.textContent = "🏆";
        movePlayer("exit");
        await winGame("You use the golden key to open the door. A bright light fills the maze. You escaped with treasure. You win!");
    } else {
        scene.textContent = "🔒";
        await typeText("The door is locked. You need a key.");

        showChoices([
            {
                text: "Search for Key",
                action: pickUpKey,
                type: "safe"
            },
            {
                text: "Go to River",
                action: goRight
            }
        ]);
    }
}

async function useBridge() {
    scene.textContent = "🌉";
    movePlayer("bridge");
    clearChoices();

    await typeText("You step onto the wooden bridge. It creaks loudly, but you move carefully and cross safely.");

    showChoices([
        {
            text: "Follow Exit Sign",
            action: exitMaze,
            type: "safe"
        },
        {
            text: "Explore Forest Path",
            action: forestPath
        }
    ]);
}

async function swimAcross() {
    scene.textContent = "🌊";
    movePlayer("river");
    clearChoices();

    await typeText("You jump into the river. The current is too strong. You lose 1 health.");

    const isDead = takeDamage();

    if (!isDead) {
        showChoices([
            {
                text: "Grab a Rock",
                action: grabRock,
                type: "safe"
            },
            {
                text: "Keep Swimming",
                action: keepSwimming,
                type: "danger"
            }
        ]);
    }
}

async function searchRiverbank() {
    scene.textContent = "🪙";
    movePlayer("river");
    clearChoices();

    player.coins += 5;
    updateStatus();

    await typeText("You search the riverbank and find 5 coins inside an old pouch.");

    showChoices([
        {
            text: "Use Bridge",
            action: useBridge,
            type: "safe"
        },
        {
            text: "Go Back to Tunnel",
            action: goLeft
        }
    ]);
}

async function grabRock() {
    scene.textContent = "🪨";
    movePlayer("river");
    clearChoices();

    await typeText("You grab a rock and pull yourself out of the river. You are safe, but very tired.");

    showChoices([
        {
            text: "Use Bridge Instead",
            action: useBridge,
            type: "safe"
        },
        {
            text: "Rest",
            action: rest
        }
    ]);
}

async function keepSwimming() {
    scene.textContent = "💀";
    movePlayer("river");
    clearChoices();

    await typeText("You keep swimming, but the river pulls you under.");

    await loseGame("You could not escape the river. Game over.");
}

async function rest() {
    scene.textContent = "✨";
    clearChoices();

    if (player.health < 3) {
        player.health++;
        updateStatus();
        await typeText("You rest for a moment and recover 1 health.");
    } else {
        await typeText("You rest for a moment. You already have full health.");
    }

    showChoices([
        {
            text: "Use Bridge",
            action: useBridge,
            type: "safe"
        },
        {
            text: "Go Left",
            action: goLeft
        }
    ]);
}

async function exitMaze() {
    scene.textContent = "🚪";
    movePlayer("exit");
    clearChoices();

    if (player.coins >= 10) {
        await winGame("You find the maze exit and escape with " + player.coins + " coins. Rich behavior. You win!");
    } else {
        await typeText("You find the exit, but a guard blocks the door and asks for 10 coins. You do not have enough.");

        showChoices([
            {
                text: "Search for Coins",
                action: searchRiverbank
            },
            {
                text: "Go to Tunnel",
                action: enterTunnel
            }
        ]);
    }
}

async function forestPath() {
    scene.textContent = "🌲";
    movePlayer("forest");
    clearChoices();

    await typeText("You walk into the forest path. The trees whisper your name. You lose 1 health from fear.");

    const isDead = takeDamage();

    if (!isDead) {
        showChoices([
            {
                text: "Run to Exit",
                action: exitMaze,
                type: "safe"
            },
            {
                text: "Follow the Whisper",
                action: followWhisper,
                type: "danger"
            }
        ]);
    }
}

async function followWhisper() {
    scene.textContent = "👻";
    movePlayer("forest");
    clearChoices();

    await typeText("You follow the whisper and find a ghost guarding a secret door.");

    if (player.hasKey) {
        movePlayer("exit");
        await winGame("The ghost sees your golden key and lets you pass. You found the secret ending. You win!");
    } else {
        await loseGame("The ghost asks for the golden key, but you do not have it. The maze traps you forever. Game over.");
    }
}

async function winGame(message) {
    playSound("win");
    document.body.classList.add("win");
    document.body.classList.remove("lose");
    scene.textContent = "🏆";
    clearChoices();

    await typeText(message);

    showChoices([
        {
            text: "Play Again",
            action: startGame,
            type: "safe"
        }
    ]);
}

async function loseGame(message) {
    playSound("lose");
    document.body.classList.add("lose");
    document.body.classList.remove("win");
    scene.textContent = "💀";
    clearChoices();

    await typeText(message);

    showChoices([
        {
            text: "Try Again",
            action: startGame
        }
    ]);
}

startButton.addEventListener("click", startGame);

nameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        startGame();
    }
});