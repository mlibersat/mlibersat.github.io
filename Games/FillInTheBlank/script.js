// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const gameRef = db.ref("game");
const scoresRef = db.ref("scores");

function submitAnswer() {
    const answer = document.getElementById("answer").value.trim();
    if (!answer) return;
    
    const playerId = localStorage.getItem("playerId") || `player-${Math.random().toString(36).substr(2, 5)}`;
    localStorage.setItem("playerId", playerId);
    
    gameRef.child("responses").child(playerId).set(answer);
    document.getElementById("answer").value = "";
}

function revealAnswers() {
    gameRef.child("responses").once("value", snapshot => {
        const responses = snapshot.val();
        if (!responses) return;

        let answerCounts = {};
        let responseHTML = "<h3>Responses:</h3><ul>";
        Object.values(responses).forEach(answer => {
            responseHTML += `<li>${answer}</li>`;
            answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        });
        responseHTML += "</ul>";
        document.getElementById("responses").innerHTML = responseHTML;

        // Award points for matching answers
        Object.keys(responses).forEach(playerId => {
            const answer = responses[playerId];
            if (answerCounts[answer] > 1) {
                scoresRef.child(playerId).transaction(score => (score || 0) + 1);
            }
        });

        updateScores();
    });
}

function updateScores() {
    scoresRef.once("value", snapshot => {
        const scores = snapshot.val();
        if (!scores) return;
        
        let scoreHTML = "";
        Object.keys(scores).forEach(playerId => {
            scoreHTML += `<li>${playerId}: ${scores[playerId]} points</li>`;
        });
        document.getElementById("scoreboard").innerHTML = scoreHTML;
    });
}

function nextRound() {
    gameRef.child("responses").set(null);  // Clear responses
    document.getElementById("responses").innerHTML = "";
}
