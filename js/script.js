const canvas = document.getElementById("gameCanvas"); // andiamo a dichiare lo "sfondo" 
const disegno = canvas.getContext("2d"); //andiamo a dichiarare la modaità per "disegnarer"
const pausa1 = document.getElementById("pausa");
const menu = document.getElementById("menu"); 
const continua = document.querySelector(".continua"); //document.querySelector serve per prendere un elemento da html
const restart = document.querySelectorAll(".restart");
const bottone_iniziale = document.getElementById("inizio");
const inizio = document.getElementById("schermata_inizio");
const nome = document.getElementById("nome");
const schermata = document.getElementById("sfondo_schermata_inizio");
const erba = document.getElementById("erba");

let spriteUccellino = new Image();
spriteUccellino.src = "img/Sprites_Uccellino3.png";

let uccellino = {
    x: 50,
    y: 150,
    width: 43, //hitbox
    height: 34, //hitbox
    gravità: 0.5,
    salto: -7.7,
    velocità: 0,
    velocitàX: 0,
    spriteWidth: 85, // dimendioni di grafica
    spriteHeight: 85, // dimendioni di grafica
    offsetX: 16,
    offsetY: 20
};

let record = parseInt(localStorage.getItem("record")) || 0; //prende il record che inizialmente è una stringa e "parseInt" lo trasforma in intero
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
let margine_fondo = 26;
let nomeGiocatore = "";
let giocoAvviato = false;
let morto = false;
let timerMorto = 0;

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
    if (uccellino.y + uccellino.height > canvas.height - margine_fondo) {
        uccellino.y = canvas.height - margine_fondo - uccellino.height;
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

    tubi.forEach(tubo => { //forEach ripete per tutti gli elementi della lista (Array)
                           //=> si chiama funzione freccia, serve per accorciare 
       
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
        
            if (punteggio > record) { // serve ad aggiornare il record in live
                record = punteggio;
                localStorage.setItem("record", record);
            }
        }
    });

    // rimuove tubi fuori schermo
    tubi = tubi.filter(tubo => tubo.x + tubo.width > 0);
}

//funzione per creare nuvole grandi
function creazione_nuvole_grandi(){
    nuvole_grandi.push({
        x: canvas.width + 50,
        y: Math.random() * 350,
        velocità: 1.3
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

    disegno.fill(); //colora tutto l'interno
    disegno.closePath();
    
    disegno.restore();
}

function disegna_nuvole_grande(){
    nuvole_grandi.forEach(nuvola => {
        disegno_nuvola_grande(nuvola.x, nuvola.y, nuvola.scala);
    });
}

function salto(){
    uccellino.velocità = uccellino.salto;
}
//mobile
document.addEventListener("pointerdown", (e) =>{ //prende il click come input
    if (!giocoAvviato) return;
    
    e.preventDefault(); //serve per bloccare lo scroll
    salto()
});

// salto con spazio
document.addEventListener("keydown", function(e) {
    if (e.code === "Space"&& !pausa && !gameOver && !morto) {
        uccellino.velocità = uccellino.salto;
    }
});

continua.onclick = () => {
    conto_alla_rovescia = true;
    riprendere_gioco = 3;
    timer_riprendi = 0;
    pausa = false;
    menu.classList.add("nascosto");
};

restart.forEach(btn => {
    btn.onclick = () => {
        erba.style.display = "block";
        uccellino.y = 150;
        uccellino.velocità = 0;
        tubi = [];
        frame = 0;
        punteggio = 0;
        pausa = false;
        nuvole_grandi = [];
        gameOver = false;
        menu.classList.add("nascosto");
        morto = false;
        timerMorto = 0;
        uccellino.x = 50;
        uccellino.velocitàX = 0;

        const gameover1 = document.getElementById("gameover")
        if(gameover1){
            gameover1.classList.add("nascosto");
        }
    };
});

bottone_iniziale.onclick = () => {
    nomeGiocatore = nome.value.trim();

    if (nomeGiocatore === "") {
        alert("Inserisci un nome!");
        return;
    }

    inizio.style.display = "none"; // nasconde schermata iniziale
    schermata.style.display = "none";
    giocoAvviato = true;
};

// pausa con il tasto esc
document.addEventListener("keydown", function(e) {
    if (e.code === "Escape") {
        if (conto_alla_rovescia) return;

        pausa = !pausa;

        if (pausa) {
            menu.classList.remove("nascosto");
        } else {
            menu.classList.add("nascosto");
        }
    }
});


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

//nome
function disegna_nome(){
    let x = 325;
    let y = 20;
    let w = 190;
    let h = 35;
    
    disegno.fillStyle = "rgba(0, 0, 0, 0.3)";
    disegno.fillRect(x, y, w, h);

    disegno.textAlign ="center";
    disegno.textBaseline = "middle";
    disegno.fillStyle = "white";
    disegno.font = "20px Arial";
    disegno.fillText("Utente: " + nomeGiocatore, x + w / 2, y + h / 2);
}

//record
function disegna_record(){
    let x = 590;
    let y = 20;
    let w = 170;
    let h = 35;
    
    disegno.fillStyle = "rgba(0, 0, 0, 0.3)";
    disegno.fillRect(x, y, w, h);

    disegno.textAlign ="center";
    disegno.textBaseline = "middle";
    disegno.fillStyle = "white";
    disegno.font = "20px Arial";
    disegno.fillText("Record: " + record, x + w / 2, y + h / 2);
}

//funziona che fa partire il game
function gameLoop() {
    disegno.clearRect(0, 0, canvas.width, canvas.height);

    if (pausa) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!giocoAvviato) {
        requestAnimationFrame(gameLoop);
        return;
    }
    if (gameOver) {
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
        uccellino.velocità = 0;
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
    
    if (!morto) {
        aggiornamento_uccellino();
    }else{
        timerMorto++;

        uccellino.velocità += 0.4;
        uccellino.y += uccellino.velocità;
        uccellino.x += uccellino.velocitàX;
        if (timerMorto > 100) {

        gameOver = true;
        morto = false;
        timerMorto = 0;

        erba.style.display = "none";
        document.getElementById("gameover").classList.remove("nascosto");
        document.getElementById("punteggio").innerText = "Punteggio " + punteggio;
        document.getElementById("record").innerText = "Record " + record;
    }
}
    
    if(!morto){
        aggiornamento_tubi();
    }

    for (let tubo of tubi) {
        if (collisioni(uccellino, tubo) && !morto) {
            morto = true;
            
            uccellino.velocitàX -= 2;
            uccellino.velocità = 5;
            
            if(punteggio > record){
                record = punteggio;
                localStorage.setItem("record", record);
            }
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

    // punteggio
    let x = 70;
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

    disegna_record();
    disegna_nome();

    if(conto_alla_rovescia){
        disegno.fillStyle = "rgba(0, 0, 0, 0.2)";
        disegno.fillRect(0, 0, canvas.width, canvas.height);
        
        disegno.fillStyle = "white";
        disegno.font = "50px Arial";
        disegno.textAlign = "center";
       
        if(riprendere_gioco === 3){
            disegno.fillStyle="white";
        }if(riprendere_gioco === 2){
            disegno.fillStyle="orange";
        }if(riprendere_gioco === 1){
            disegno.fillStyle="red";
        }
        disegno.fillText("Il gioco riprende tra... " + riprendere_gioco, canvas.width / 2, canvas.height / 2);
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();