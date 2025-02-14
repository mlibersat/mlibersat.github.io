// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const gameRef = db.ref("game");
const scoresRef = db.ref("scores");

let countdown;
let playerName = "";

// Predefined prompts with blank placement variations
const promptWords = ["happy", "run", "bright", "fast", "storm", "jump", "deep"];
function getRandomPrompt() {
  const word = promptWords[Math.floor(Math.random() * promptWords.length)];
  return Math.random() > 0.5 ? `${word} ___` : `___ ${word}`;
}

// Set player name and store in localStorage
function setPlayerName() {
  playerName = document.getElementById("player-name").value.trim();
  if (!playerName) return alert("Enter your name to join!");

  localStorage.setItem("playerName", playerName);
  document.getElementById("name-input").style.display = "none";

  startNewRound();
}

// Submit answer to Firebase
function submitAnswer() {
  const answer = document.getElementById("answer").value.trim();
  if (!answer) return;

  gameRef.child("responses").child(playerName).set(answer);
  document.getElementById("answer").value = "";
  document.getElementById("submit-btn").disabled = true;
}

// Reveal all answers and assign points for matching ones
function revealAnswers() {
  clearInterval(countdown);
  gameRef.child("responses").once("value", (snapshot) => {
    const responses = snapshot.val();
    if (!responses) return;

    let answerCounts = {};
    let responseHTML = "<h3>Responses:</h3><ul>";
    Object.entries(responses).forEach(([name, answer]) => {
      responseHTML += `<li><strong>${name}:</strong> ${answer}</li>`;
      answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    });
    responseHTML += "</ul>";
    document.getElementById("responses").innerHTML = responseHTML;

    // Award points for matching answers
    Object.keys(responses).forEach((player) => {
      const answer = responses[player];
      if (answerCounts[answer] > 1) {
        scoresRef.child(player).transaction((score) => (score || 0) + 1);
      }
    });

    updateScores();
    document.getElementById("next-round-btn").disabled = false;
  });

  document.getElementById("reveal-btn").disabled = true;
}

// Update scoreboard from Firebase
function updateScores() {
  scoresRef.once("value", (snapshot) => {
    const scores = snapshot.val();
    if (!scores) return;

    let scoreHTML = "";
    Object.entries(scores).forEach(([name, score]) => {
      scoreHTML += `<li>${name}: ${score} points</li>`;
    });
    document.getElementById("scoreboard").innerHTML = scoreHTML;
  });
}

// Start a new round with a random prompt and countdown timer
function startNewRound() {
  const newPrompt = getRandomPrompt();
  gameRef.child("prompt").set(newPrompt);
  gameRef.child("responses").set(null);

  document.getElementById("responses").innerHTML = "";
  document.getElementById("next-round-btn").disabled = true;

  gameRef.child("prompt").once("value", (snapshot) => {
    document.getElementById("prompt").innerText = snapshot.val();
  });

  document.getElementById("answer").disabled = false;
  document.getElementById("submit-btn").disabled = false;
  document.getElementById("reveal-btn").disabled = false;

  startCountdown();
}

// Countdown timer
function startCountdown() {
  let timeLeft = 10;
  document.getElementById("countdown").innerText = timeLeft;

  countdown = setInterval(() => {
    timeLeft--;
    document.getElementById("countdown").innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      document.getElementById("answer").disabled = true;
      document.getElementById("submit-btn").disabled = true;
      document.getElementById("reveal-btn").disabled = false;
    }
  }, 1000);
}

// Move to the next round
function nextRound() {
  startNewRound();
}
