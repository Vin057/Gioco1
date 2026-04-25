const canvas = document.getElementById("gameCanvas"); // andiamo a dichiare lo "sfondo" 
const disegno = canvas.getContext("2d"); //andiamo a dichiarare la modaità per "disegnarer"

let spriteUccellino = new Image();
spriteUccellino.src = "img/Sprites_Uccellino3.png";
// uccellino
let uccellino = {
    x: 50,
    y: 150,
    width: 43, //hitbox
    height: 34, //hitbox
    gravità: 0.5,
    salto: -8,
    velocità: 0,
    spriteWidth: 85, // dimendioni di grafica
    spriteHeight: 85, // dimendioni di grafica
    offsetX: 16,
    offsetY: 20
};

let tubi = []; //creiamo una lista(array) per andare a gestire tutti i tubi contemporaneamente 
let frame = 0; //serve  per la creazione dei tubi ogni tot (ex. 100 frame)
let pausa = false;
let punteggio = 0;
let conto_alla_rovescia = false;
let riprendere_gioco = 0;
let timer_riprendi = 0;
let gameOver = false;
let spriteTubo = new Image();
spriteTubo.src ="img/Sprites_tubi1.png";
let margine = 62;
let spriteTuboSu = new Image();
spriteTuboSu.src = "img/Sprites_tubiSu.png";
let nuvole_grandi = [];
let nuvole_piccole = [];


// andiamo a definire la funzione che mostrerà l'uccellino a schermo 
function disegna_uccellino() {
    disegno.fillStyle = "yellow";
    disegno.drawImage(
        spriteUccellino,
        uccellino.x - uccellino.offsetX,
        uccellino.y - uccellino.offsetY,
        uccellino.spriteWidth,
        uccellino.spriteHeight
    );
}


function aggiornamento_uccellino() {
    uccellino.velocità += uccellino.gravità;
    uccellino.y += uccellino.velocità;

     // limite in basso
    if (uccellino.y + uccellino.height > canvas.height) {
        uccellino.y = canvas.height - uccellino.height;
        uccellino.velocità = 0;
    }

    // limite in alto
    if (uccellino.y < 0) {
        uccellino.y = 0;
        uccellino.velocità = 0;
    }
}

function creazione_tubi() {
    let spazio_tubi = 135; // spazio tra tubo sopra e tubo sotto
    let altezza_tubo_superiore = Math.random() * 350;

    tubi.push({ //andiamo ad aggiungere i tubi alla lista
        x: canvas.width, //il tubo spunta da destra
        tubo_superiore: altezza_tubo_superiore,
        tubo_inferiore: canvas.height - altezza_tubo_superiore - spazio_tubi,
        width: 150,
        passaggio: false
    });
}

//funzione che mostra i tubi a schermo
function disegna_tubi() {
    disegno.fillStyle = "green";

    tubi.forEach(tubo => {
       
        // tubo di sopra  
        disegno.drawImage(
            spriteTuboSu,
            0, 0,
            spriteTuboSu.width,
            spriteTuboSu.height,
            tubo.x,
            0,
            tubo.width,
            tubo.tubo_superiore
        );
        
        // tubo di sotto
        disegno.drawImage(
            spriteTubo,
            0, 0,
            spriteTubo.width,
            spriteTubo.height,
            tubo.x,
            canvas.height - tubo.tubo_inferiore,
            tubo.width,
            tubo.tubo_inferiore
        );
    });
}

function aggiornamento_tubi() {
    tubi.forEach(tubo => {
        tubo.x -= 2; // velocità di spostamento dei tubi
    
        if(!tubo.passaggio && tubo.x + tubo.width < uccellino.x){
            punteggio ++; //se la "x" dell'uccellino supera la larghezza del tubo punteggio + 1
            tubo.passaggio = true;
        }
    });

    // rimuove tubi fuori schermo
    tubi = tubi.filter(tubo => tubo.x + tubo.width > 0);
}

//funzione per creare nuvole grandi
function creazione_nuvole_grandi(){
    nuvole_grandi.push({
        x: canvas.width + 50,
        y: Math.random() * 250,
        velocità: 1
    });
}

//funzione per il movimento delle nuvole grandi
function aggiornamento_nuvole_grandi(){
    nuvole_grandi.forEach(nuvola => {
        nuvola.x -= nuvola.velocità;
    });

    // rimuove quando escono dal canvas
    nuvole_grandi = nuvole_grandi.filter(nuvola => {
        let fuoriCanvas = nuvola.x + 100 < 0;

        return !fuoriCanvas;
    });
}

//funzione per disegnare le nuvole grandi 
function disegno_nuvola_grande(x, y, scala = 1.5) {
    disegno.save();

    disegno.globalAlpha = 0.8;
    disegno.fillStyle = "white";
    disegno.shadowColor = "rgba(0,0,0,0.1)";
    disegno.shadowBlur = 10;

    // corpo nuvola (cerchi sovrapposti)
    disegno.beginPath();

    disegno.arc(x, y, 20 * scala, 0, Math.PI * 2);
    disegno.arc(x + 20 * scala, y - 10 * scala, 25 * scala, 0, Math.PI * 2);
    disegno.arc(x + 45 * scala, y, 22 * scala, 0, Math.PI * 2);
    disegno.arc(x + 20 * scala, y + 10 * scala, 20 * scala, 0, Math.PI * 2);

    disegno.fill();
    disegno.closePath();
    
    disegno.restore();
}

function disegna_nuvole_grande(){
    nuvole_grandi.forEach(nuvola => {
        disegno_nuvola_grande(nuvola.x, nuvola.y, nuvola.scala);
    });
}

// salto con spazio
document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        uccellino.velocità = uccellino.salto;
    }
});


// pausa con il tasto esc
document.addEventListener("keydown", function(e) {
    if (e.code === "Escape") {
        if(conto_alla_rovescia)return;
        
        pausa = !pausa;
        timer_riprendi = 0;
        riprendere_gioco = 3;
    }
});

//disegna il gameover
function disegna_game_over() {
    // sfondo scuro
    disegno.fillStyle = "rgba(0,0,0,0.5)";
    disegno.fillRect(0, 0, canvas.width, canvas.height);

    // box centrale
    let w = 250;
    let h = 150;
    let x = canvas.width / 2 - w / 2;
    let y = canvas.height / 2 - h / 2;

    disegno.fillStyle = "white";
    disegno.fillRect(x, y, w, h);

    // testo
    disegno.fillStyle = "black";
    disegno.font = "25px Arial";
    disegno.textAlign = "center";
    disegno.fillText("GAME OVER", canvas.width / 2, y + 40);

    disegno.font = "18px Arial";
    disegno.fillText("Punteggio: " + punteggio, canvas.width / 2, y + 75);

    // bottone restart
    disegno.fillStyle = "silver";
    disegno.fillRect(x + 35, y + 95, 180, 40);

    disegno.strokeStyle = "black";
    disegno.strokeRect(x + 35, y + 95, 180, 40);

    disegno.fillStyle = "black";
    disegno.fillText("RIPROVA", canvas.width / 2, y + 115);
}


// menù con tasto esc
function disegna_menu() {

    //rettangolo più grande
    let w1 = canvas.width - 400;
    let h1 = canvas.height - 190;

    let x1 = (canvas.width - w1) / 2;
    let y1 = (canvas.height - h1) / 2;

    disegno.fillStyle = "rgba(0,0,0,0.5)";
    disegno.fillRect(x1, y1, w1, h1);
    
    // rettangolo centrale
    let w = 220;
    let h = 140;
    let x = canvas.width / 2 - w / 2;
    let y = canvas.height / 2 - h / 2;

    disegno.fillStyle = "white";
    disegno.fillRect(x, y, w, h);

    // bottone CONTINUA
    disegno.fillStyle = "silver";
    disegno.fillRect(x + 20, y + 20, 180, 40);

    disegno.strokeStyle = "black"; //bordo bottone
    disegno.strokeRect(x + 20, y + 20, 180,40);
    
    disegno.fillStyle = "black";
    disegno.font = "18px Arial";
    disegno.textAlign = "center";
    disegno.textBaseline = "middle";
    disegno.fillText("CONTINUA", x + 110, y + 40);

    // bottone RICOMINCIA
    disegno.fillStyle = "silver";
    disegno.fillRect(x + 20, y + 80, 180, 40);

    disegno.strokeStyle = "black";
    disegno.strokeRect(x + 20, y + 80, 180, 40);
    disegno.fillStyle = "black";
    disegno.textAlign = "center";
    disegno.textBaseline = "middle";
    disegno.fillText("RICOMINCIA", x + 110, y + 100);
}


function gestione_mouse(e) {
    //gestione del click per il game over
    if (gameOver) {
        let rect = canvas.getBoundingClientRect();//prende la posizione del mouse all'interno della finestra
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        let x = canvas.width / 2 - 125;
        let y = canvas.height / 2 - 75;

        // bottone riprova
        if (
            mouseX > x + 35 && mouseX < x + 215 &&
            mouseY > y + 95 && mouseY < y + 135
        ) {
            // reset gioco
            uccellino.y = 150;
            uccellino.velocità = 0;
            tubi = [];
            frame = 0;
            punteggio = 0;
            gameOver = false;
            nuvole_grandi = [];
        }
        return;
    }
    
    if (!pausa) return;
    let campo_di_gioco = canvas.getBoundingClientRect(); //prende la posizione del mouse all'interno della finestra
    let mouseX = e.clientX - campo_di_gioco.left; //da sinistra
    let mouseY = e.clientY - campo_di_gioco.top;  //da sopra

    let x = canvas.width / 2 - 110;
    let y = canvas.height / 2 - 70;

    // controlla se sei sul bottone continua
    if (
        mouseX > x + 20 && mouseX < x + 200 &&
        mouseY > y + 20 && mouseY < y + 60
    ) {
        conto_alla_rovescia = true;
        riprendere_gioco = 3; //3 secondi 
        timer_riprendi = 0;
        pausa = false;
    }

    // controlla se sei sul bottone ricomincia 
    if (
        mouseX > x + 20 && mouseX < x + 200 &&
        mouseY > y + 80 && mouseY < y + 120
    ) {
        uccellino.y = 150;
        uccellino.velocità = 0;
        tubi = []; //si azzera tutto
        frame = 0;
        pausa = false;
        punteggio = 0;
        nuvole_grandi = [];
    }
}

//evento del "click" del mouse
canvas.addEventListener("click", gestione_mouse);


//collisioni
function collisioni(uccellino, tubo) {

    let hitboxX = tubo.x + margine;
    let hitboxWidth = tubo.width - margine * 2;

    // collisioni con il tubo di sopra
    if (
        uccellino.x < hitboxX + hitboxWidth &&
        uccellino.x + uccellino.width > hitboxX &&
        uccellino.y < tubo.tubo_superiore
    ) {
        return true;
    }

    // collisioni con il tubo di sotto
    if (
        uccellino.x < hitboxX + hitboxWidth &&
        uccellino.x + uccellino.width > hitboxX &&
        uccellino.y + uccellino.height > canvas.height - tubo.tubo_inferiore
    ) {
        return true;
    }

    return false;
}


//funziona che fa partire il game
function gameLoop() {
    disegno.clearRect(0, 0, canvas.width, canvas.height);

    if (pausa) {
    disegna_menu();
    requestAnimationFrame(gameLoop);
    return;
    }

    if (gameOver) {
    disegna_game_over();
    requestAnimationFrame(gameLoop);
    return;
}
    if(conto_alla_rovescia){
      
       timer_riprendi ++;

        if(timer_riprendi % 60 === 0){
            riprendere_gioco--;
            timer_riprendi = 0;
        }
        if(riprendere_gioco <= 0){
            conto_alla_rovescia = false;
            riprendere_gioco = 3;
            timer_riprendi = 0;
        }
        
      }else{
            frame++;
            
        // crea un nuovo tubo in base ai frame
        if (frame % 100 === 0) {
            creazione_tubi();
            }
        
        // crea una nuvola in base ai frame
         if(frame % 240 === 0){
            creazione_nuvole_grandi();
        }
    
    aggiornamento_nuvole_grandi();
    aggiornamento_uccellino();
    aggiornamento_tubi();
   
    for (let tubo of tubi) {
        if (collisioni(uccellino, tubo)) {
            gameOver = true;
            }
        }
    }

    disegna_nuvole_grande();
    disegna_uccellino();
    
    /*
    disegno.strokeStyle = "red";
    disegno.strokeRect(
    uccellino.x,                      //  HITBOX UCCELLINO
    uccellino.y,
    uccellino.width,
    uccellino.height
);
    */
    disegna_tubi();

    let x = 90;
    let y = 20;
    let w = 170;
    let h = 35;
    
    disegno.fillStyle = "rgba(0, 0, 0, 0.3)";
    disegno.fillRect(x, y, w, h);

    disegno.textAlign ="center";
    disegno.textBaseline = "middle";
    disegno.fillStyle = "white";
    disegno.font = "20px Arial";
    disegno.fillText("Punteggio: " + punteggio, x + w / 2, y + h / 2);
   
    if(conto_alla_rovescia){
        disegno.fillStyle = "rgba(0, 0, 0, 0.2)";
        disegno.fillRect(0, 0, canvas.width, canvas.height);
        
        disegno.fillStyle = "white";
        disegno.font = "50px Arial";
        disegno.textAlign = "center";
       
        disegno.fillText(riprendere_gioco, canvas.width / 2, canvas.height / 2);
    }
    
    requestAnimationFrame(gameLoop);
}


gameLoop();