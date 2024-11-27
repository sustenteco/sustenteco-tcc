const inputs = document.querySelector(".inputs"),
  resetBtns = document.querySelectorAll(".reset-btn"),
  hint = document.querySelector(".hint span"),
  guessLeft = document.querySelector(".guess-left span"),
  typingInput = document.querySelector(".typing-input"),
  gameContainer = document.getElementById("game-container"),
  resultContainer = document.getElementById("result-container"),
  totalErrors = document.getElementById("total-errors"),
  totalTime = document.getElementById("total-time"),
  resultMessage = document.getElementById("result-message"),
  helpContainer = document.getElementById("help-container"),
  gameTitle = document.getElementById("game-title"),
  gameContent = document.getElementById("game-content");
var word,
  maxGuesses,
  corrects = [],
  incorrects = [],
  gameOver = false;
let interval;
let time = 0;
const wordCheck = document.querySelector("#word-check");
const wordWin = document.querySelector("#word-win");
const wordStart = document.querySelector("#word-start");
document.addEventListener("DOMContentLoaded", () => {
  showHelp();
});
function goToHome() {
  if (window.self !== window.top) {
    window.top.location.href = "../../telas/home/index.html";
  } else {
    window.location.href = "../../telas/home/index.html";
  }
}
function startTime() {
  let startTime = Date.now() - time;
  interval = setInterval(() => {
    time = Date.now() - startTime;
    document.getElementById("time").innerText = calculateTime(time);
  }, 1000);
}
function pauseTime() {
  clearInterval(interval);
  document.getElementById("time").innerText = calculateTime(time);
}
function stopTime() {
  time = 0;
  clearInterval(interval);
  document.getElementById("time").innerText = "00:00";
}
function calculateTime(time) {
  let totalSeconds = Math.floor(time / 1000);
  let totalMinutes = Math.floor(totalSeconds / 60);
  let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0");
  let displayMinutes = totalMinutes.toString().padStart(2, "0");
  return `${displayMinutes}:${displaySeconds}`;
}
function startGame() {
  wordStart.play();
  closeHelp();
  stopTime();
  startTime();
  randomWord();
  createKeyboard();
}
function resetGame() {
  wordStart.play();
  stopTime();
  resultContainer.style.display = "none";
  gameContent.style.display = "block";
  randomWord();
  createKeyboard();
  startTime();
  corrects = [];
  incorrects = [];
  gameOver = false;
}
resetBtns.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    resetGame();
  })
);
function createKeyboard() {
  const keyboardContainer = document.getElementById("keyboard");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  keyboardContainer.innerHTML = "";
  alphabet.forEach((letter) => {
    const button = document.createElement("button");
    button.innerText = letter;
    button.addEventListener("click", () => handleInput(letter, button));
    keyboardContainer.appendChild(button);
  });
}
function handleInput(key, button) {
  if (gameOver) return;
  key = key.toUpperCase();
  if (!corrects.includes(key) && /^[A-Z]+$/.test(key)) {
    wordCheck.play();
    if (word.includes(key)) {
      for (let i = 0; i < word.length; i++) {
        if (word[i] === key) {
          wordCheck.play();
          corrects.push(key);
          inputs.querySelectorAll("input")[i].value = key;
        }
      }
      if (button) {
        button.style.backgroundColor = "#22543d";
        button.style.color = "#fff";
      }
    } else if (!incorrects.includes(key)) {
      incorrects.push(key);
      maxGuesses--;
      if (button) {
        button.style.backgroundColor = "#ff4c4c";
        button.style.color = "#fff";
      }
      const planetIconsContainer = document.getElementById("planet-icons");
      const remainingPlanets = planetIconsContainer.children;
      if (remainingPlanets.length > incorrects.length - 1) {
        const currentPlanet = remainingPlanets[incorrects.length - 1];
        currentPlanet.style.color = "#ff4c4c";
      }
      if (maxGuesses < 1) {
        pauseTime();
        showResult(false);
        for (let i = 0; i < word.length; i++) {
          inputs.querySelectorAll("input")[i].value = word[i];
        }
      }
    }
  }
  if (button) {
    button.disabled = true;
    button.classList.add("disabled-button");
  }
  setTimeout(() => {
    if (corrects.length === word.length) {
      pauseTime();
      showResult(true);
    } else if (maxGuesses < 1) {
      pauseTime();
      showResult(false);
      for (let i = 0; i < word.length; i++) {
        inputs.querySelectorAll("input")[i].value = word[i];
      }
    }
  });
}
document.addEventListener("keydown", (e) => {
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) {
    const button = Array.from(
      document.querySelectorAll(".keyboard-container button")
    ).find((btn) => btn.innerText === key && !btn.disabled);
    if (button) {
      handleInput(key, button);
    }
  }
});
function randomWord() {
  gameOver = false;
  let ranObj = wordList[Math.floor(Math.random() * wordList.length)];
  word = ranObj.word.toUpperCase();
  maxGuesses = 5;
  corrects = [];
  incorrects = [];
  hint.innerText = ranObj.hint;
  const planetIconsContainer = document.getElementById("planet-icons");
  planetIconsContainer.innerHTML = "";
  for (let i = 0; i < maxGuesses; i++) {
    const planetIcon = document.createElement("i");
    planetIcon.className = "fa-solid fa-earth-americas";
    planetIcon.style.color = "#4caf50";
    planetIconsContainer.appendChild(planetIcon);
  }
  let html = "";
  for (let i = 0; i < word.length; i++) {
    html += `<input type="text" disabled>`;
  }
  inputs.innerHTML = html;
}
async function saveRecord(time, incorrects) {
  try {
    const access_token = localStorage.getItem("token");
    if (!access_token) {
      console.log("Token não encontrado");
      return false;
    }
    let res;
    const response = await fetch("https://sustenteco.onrender.com/api/record/hangame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify({"tempo_record": time, "quantidade_erros": incorrects}),
      credentials: "include",
    });
    res = await response.json();
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}
function showResult(won) {
  wordWin.play();
  gameOver = true;
  gameContent.style.display = "none";
  resultContainer.style.display = "flex";
  totalErrors.innerText = incorrects.length;
  totalTime.innerText = calculateTime(time);
  if (won) {
    saveRecord(time, incorrects.length);
    resultMessage.innerText = "Parabéns! Você acertou a palavra!";
  } else {
    resultMessage.innerText = "Que pena! Você errou... Tente novamente!";
  }
}
function showHelp() {
  const blurOverlay = document.getElementById("blur-overlay");
  const helpDialog = document.getElementById("help-dialog");
  const isMobile = window.innerWidth <= 768;
  blurOverlay.style.display = "block";
  helpDialog.style.display = "flex";
  if (!isMobile) {
    helpDialog.style.maxHeight = "600px";
    helpDialog.style.overflowX = "overlay";
    helpDialog.style.justifyContent = "flex-start";
  }
}
function closeHelp() {
  const blurOverlay = document.getElementById("blur-overlay");
  const helpDialog = document.getElementById("help-dialog");
  blurOverlay.style.display = "none";
  helpDialog.style.display = "none";
}
function toggleFullScreen() {
  const fullscreenIcon = document.getElementById("fullscreen-icon");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenIcon.classList.remove("fa-expand");
    fullscreenIcon.classList.add("fa-compress");
    fullscreenBtn.classList.add("fullscreen");
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      fullscreenIcon.classList.remove("fa-compress");
      fullscreenIcon.classList.add("fa-expand");
      fullscreenBtn.classList.remove("fullscreen");
    }
  }
}
const fullscreenBtn = document.getElementById("fullscreen-btn");
fullscreenBtn.addEventListener("click", toggleFullScreen);
