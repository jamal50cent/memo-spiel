const API_URL = 'https://api.pexels.com/v1/search?query=nature&per_page=8';
// Pexels API-Key zum Herunterladen von Bilder
const API_KEY = 'Bt7E6qEYhRlujKyUeOV566LG9WKckw1g8r4vYGo2Trqj5rGo4FSkf2ja';
const headers = {
    'Authorization': API_KEY
};

const cards = [];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let attempts = 0;
let startTime;
let highscore = localStorage.getItem('highscore') || 0; // Highscore aus localStorage laden

document.addEventListener('DOMContentLoaded', () => {
    startGame();
});

async function startGame() {
    let highscore = localStorage.getItem('highscore') || 0; // Highscore aus localStorage laden
    document.getElementById('message').innerText = '';
    document.getElementById('highscore-value').innerText = highscore;
    const images = await fetchImages();
    createCards(images);
    shuffle(cards);
    displayCards();
    startTime = new Date();
}

// Zum Bilder Herunterladen
async function fetchImages() {
    try {
        const response = await fetch(API_URL, { headers });
    const data = await response.json();
    return data.photos.map(photo => ({ url: photo.src.medium, title: photo.photographer }));
    } catch(error) {
        console.error('Error beim Laden von Bilder: ', e);
    }
}

// Erstellen von Karten aus Bildern
function createCards(images) {
    cards.length = 0;
    images.forEach(image => {
        cards.push(createCard(image));
        cards.push(createCard(image)); // Jedes Bild zweimal
    });
}

// Erstelle einzelne Card aus einenm Bild
function createCard(image) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="front">?</div>
        <div class="back"><img src="${image.url}" alt="${image.title}"></div>
    `;
    card.addEventListener('click', flipCard);
    return card;
}

// Zufällig Ordnen von Cards
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function displayCards() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    cards.forEach(card => gameBoard.appendChild(card));
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;
    checkForMatch();
}

function checkForMatch() {
    attempts++;
    const isMatch = firstCard.querySelector('.back img').src === secondCard.querySelector('.back img').src;

    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();

    if (document.querySelectorAll('.card:not(.flip)').length === 0) {
        endGame();
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function endGame() {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
    const score = Math.round(1000 / (attempts * timeTaken));

    if (!highscore) {
        highscore = 0;
    }

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore); // Highscore im localStorage speichern
    }

    document.getElementById('highscore-value').innerText = highscore;
    document.getElementById('message').innerText = `Glückwunsch! Sie haben das Spiel in ${timeTaken} Sekunden und ${attempts} Versuchen gewonnen.`;
}
