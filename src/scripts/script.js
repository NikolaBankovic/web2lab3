// Postavljanje canvasa za 2d igru i dohvacanje konteksta
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Postavljanje visine i sirine canvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Postavljanje velicine i pocetne pozicije loptice
const ballRadius = 15;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;

// Ova funkcija sluzi za generiranje slucajnog smjera kretanja loptice pri pocetku igre
function getRandomDirection() {
    // Nasumičan kut između 0 i 90 stupnjeva (0 do pi/2 radijana)
    let angle = Math.random() * (Math.PI / 2);

    // Brzina kretanja loptice
    let speed = 5;

    // Nasumičan odabir smjera po x-osi
    // može biti -1 (lijevo) ili +1 (desno)
    let direction = Math.random() < 0.5 ? -1 : 1;

    //Ovdje se izracunavaju komponente kretanja loptice pa x i y osi
    let dx = direction * speed * Math.cos(angle);
    let dy = -speed * Math.sin(angle);

    return { dx, dy };
}

// Pocetno kretanje loptice u slucajnom smjeru
// Smjer se generira funkcijom getRandomDirection()
let { dx: ballDX, dy: ballDY } = getRandomDirection();

// Inicijalizacija pozicije palice
const paddleHeight = 25;
const paddleWidth = 150;
let paddleX = (canvas.width - paddleWidth) / 2;

// Varijable za pracenje koja tipka je pritisnuta
let rightPressed = false;
let leftPressed = false;

// Inicijalizacija za postavljanje velicine i broja cigli
const brickWidth = 125;
const brickHeight = 35;
const brickRowCount = 3;
const brickPadding = 10;
const brickColumnCount = Math.ceil((canvas.width / (brickWidth + brickPadding)) - 3);
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Inicijalizacija pocetnog broja bodova i polja cigli
let score = 0;
let bricks = [];

// Inicijalizacija polja cigli i njihovog statusa
// Status odreduje treba li ciglu nacrtati ili ne
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Varijable za provjeru je li igra zavrsila pobjedom ili porazom
let gameOver = false;
let winGame = false;

// Učitavanje najboljeg rezultata iz localStorage
// Ako ne postoji rezultat u localStorage-u best score se postavlja na 0
let bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0;

// Event listeneri koji prate pritiske tipki na tipkovnici
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Funkcija postavlja varijablu pritisnute tipke na true dok je pritisnuta
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

// Funkcija postavlja varijablu pritisnute tipke na false nakon otpustanja
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Funkcija za crtanje palice sa sjenčanjem
function drawPaddle() {
    ctx.beginPath();
    // Postavljanje sjencanja palice
    ctx.shadowColor = "#8B0000";
    ctx.shadowBlur = 20;
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    // Postavljanje boje palice
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.lineWidth = 2;

    ctx.closePath();
}

// Funkcija za crtanje loptice
function drawBall() {
    ctx.beginPath();
    // Postavljanje sjencanja loptice
    ctx.shadowColor = "black";
    ctx.shadowBlur = 20;
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    // Postavljanje boje loptice
    ctx.fillStyle = "#0beeee";
    ctx.fill();
    ctx.closePath();
}

// Funkcija za crtanje cigli sa sjenčanjem
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                // Postavljanje koordinata cigle
                let brickX = bricks[c][r].x;
                let brickY = bricks[c][r].y;
                ctx.beginPath();
                // Postavljanje sjencanja cigle
                ctx.shadowColor = "white";
                ctx.shadowBlur = 20;
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                // Postavljanje boje cigle
                ctx.fillStyle = "magenta";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.closePath();
            }
        }
    }
}

// Funkcija za prikazivanje poruke "GAME OVER"
function showGameOver() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

// Funkcija za prikazivanje poruke "YOU WIN"
function showWinMessage() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "green"; // Zelena boja za tekst
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
}

// Glavna funkcija igre, loop za crtanje i ažuriranje
// U funkciji se vrsi provjera pobjede/poraza i pozivaju se funkcije za crtanje
// Funkcija poziva funkcije koje sluze za crtanje cigli, loptice i palice te poziva
// funkcije za prikaz poruka u slucaju pobjede ili poraza
function draw() {
    // Provjera je li igra zavrsila porazom
    // i poziv funkcije za prikaz game over poruke
    if (gameOver) {
        showGameOver();
        return;
    }

    console.log("brick row count = " + brickRowCount)
    console.log("brick col count = " + brickColumnCount)

    // Ocisti canvas kako bi se maknule preostale nacrtane stvari iz prosle igre
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pozivaju se funkcije za crtanje cigli, loptice i palice
    drawBricks();
    drawBall();
    drawPaddle();

    // Provjera je li igra zavrsila pobjedom
    // i poziv funkcije za prikaz you win poruke
    if (winGame) {
        showWinMessage();
        return;
    }

    // Kretanje loptice po canvasu
    ballX += ballDX;
    ballY += ballDY;

    // Sudari s rubovima
    // Loptica se odbija od bočnih rubova u suprotnom smjeru po x-osi
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    // Loptica se odbija od gornjeg ruba u suprotnom smjeru po y-osi
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - ballRadius) {
        if (
            ballX + ballRadius > paddleX &&
            ballX - ballRadius < paddleX + paddleWidth &&
            ballY + ballRadius > canvas.height - paddleHeight
        ) {
            // Odbijanje na temelju položaja loptice na palici
            let paddleCenter = paddleX + paddleWidth / 2;
            let distanceFromCenter = ballX - paddleCenter;

            // Kut odbijanja loptice od palice ovisi o postavljenim brzinama ballDX i ballDY
            // Promjena smjera kretanja po x-osi na temelju mjesta dodira s palicom
            // Skaliranje brzine prema udaljenosti od centra palice
            ballDX = distanceFromCenter * 0.1;

            // Loptica se uvijek odbija prema gore od palice
            ballDY = -Math.abs(ballDY);

            // Skaliranje brzine tako da ukupna brzina ostane konstantna
            let magnitude = Math.sqrt(ballDX ** 2 + ballDY ** 2);
            let scale = 5 / magnitude;
            ballDX *= scale;
            ballDY *= scale;
        } else {
            // Igra završava porazom ako loptica padne ispod palice
            gameOver = true;
        }
    }


    // Odredivanje smjera i brzine kretanja palice
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

// Sudar s ciglama
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ballX + ballRadius > b.x &&
                    ballX - ballRadius < b.x + brickWidth &&
                    ballY + ballRadius > b.y &&
                    ballY - ballRadius < b.y + brickHeight
                ) {
                    // Loptica se odbija od cigle prema dolje
                    ballDY = -ballDY;
                    // Cigla se brise
                    b.status = 0;
                    // Povećaj broj bodova
                    score++;
                }
            }
        }
    }


    // Provjera jesu li sve cigle unistene
    // Ako su sve cigle unistene igra je gotova i igrac je pobjedio
    if (score === brickRowCount * brickColumnCount) {
        winGame = true;
    }

    // Ispis trenutnog broja bodova u desnom gornjem kutu
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, canvas.width - 20, 20);

    // Ispis najboljeg rezultata u desnom gornjem kutu
    ctx.fillText("Best Score: " + bestScore, canvas.width - 20, 40);

    // Poziv funkcije loop-a za crtanje u idućem frame-u
    requestAnimationFrame(draw);
}

// Inicijalizacija pozicija cigli
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].x = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            bricks[c][r].y = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        }
    }
}

// Funkcija koja sluzi za pohranu najboljeg rezultata u localStorage
function saveBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }
}

// Pokretanje igre
initBricks();
draw();

// Pohrana najboljeg rezultata na kraju
window.addEventListener("beforeunload", saveBestScore);
