var gameRoundTrueCells = [];
var gameDOMCells = []
var gameMediaElements = []
var gameStage = 1;
var playBtn;
var score = 0;
var topScore = localStorage.getItem("hassenSimonTopScore");

/** Change game title text configurationally
 * 
 * @param messagesArray Array<{text: string, fontWeight: string, delay: number, callback: function, callbackParams: Array<any>}>
 */
function gameTitleMessages(messagesArray){
    if(messagesArray.length){

        document.querySelector(".game-title").style.fontWeight = messagesArray[0].fontWeight;
        document.querySelector(".game-title").textContent = messagesArray[0].text;
        if(messagesArray[0].callback){
            if(messagesArray[0].callbackParams){
                messagesArray[0].callback(...messagesArray[0].callbackParams);
            }
            else{
                messagesArray[0].callback();
            }
        }
        if(messagesArray[0].delay){
            var messagesTimer = window.setTimeout(()=>{
                gameTitleMessages(messagesArray.slice(1));
            }, messagesArray[0].delay);
        }
    }
}

/**
 * function to be called whenever the game or the next stage are going to start 
 * @param gameDOMCells: Array of DOM elelements corresponding to game cells
 */
function ready(gameDOMCells){
    gameRoundTrueCells.push(Math.floor(Math.random() * 4) + 1);
    gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    playBtn.disabled = true;
    gameTitleMessages([
        {text:'Ready', fontWeight: 'bold', delay:1000},
        {text:'Go', fontWeight: 'bold', delay: 1000},
        {text:'Simon', fontWeight: '', callback: gameAI, callbackParams: [gameDOMCells, gameRoundTrueCells]}
    ]);
}

/**
 * the AI of the game in view mode
 * @param {*} gameDOMCells Array of DOM elelements corresponding to game cells
 * @param {*} arr Array of cell indexes to be highlighted
 */
function gameAI(gameDOMCells, arr){
    if(arr.length){
        gameDOMCells[arr[0] - 1].classList.add("active")
        playAudio(arr[0] - 1)
        let cellActiveTimer = window.setTimeout(()=>{
            gameDOMCells[arr[0] - 1].classList.remove("active");
            let nextRecursionTimer = window.setTimeout(()=>{
                gameAI(gameDOMCells, arr.slice(1));
            }, 400);
        }, 350);
    }
    else{
        gameTitleMessages([
        {text:'Your turn!', fontWeight: 'bold', delay: 1000},
        {text:'Simon', fontWeight: '', callback: ()=>{
            userGamePlay(gameDOMCells)
            //playBtn.disabled = false;    //nope :p
        } , callbackParams: [gameDOMCells]
        }
        ]);
    }
}

function userGamePlay(gameDOMCells){
    gameDOMCells.forEach(element => {
        element.classList.remove("disabled");
    });
}

/**
 * .playBtn's click event hanldner
 * @param {*} event click event? meh
 */
function playBtnEventHandler(event){
    ready(gameDOMCells);
}

/**
 * Play one of simon game's beeps according to the clicked cell
 * @param {*} nth audio element index equivalent to cell index
 */
function playAudio(nth){
    gameMediaElements[nth].cloneNode(true).play();
}
///////////////////////////

document.addEventListener("DOMContentLoaded", function(){
    gameMediaElements.push(document.querySelector("#simon-sound-1"));
    gameMediaElements.push(document.querySelector("#simon-sound-2"));
    gameMediaElements.push(document.querySelector("#simon-sound-3"));
    gameMediaElements.push(document.querySelector("#simon-sound-4"));

    gameDOMCells.push(document.querySelector(".cell:nth-child(1)"));
    gameDOMCells.push(document.querySelector(".cell:nth-child(2)"));
    gameDOMCells.push(document.querySelector(".cell:nth-child(3)"));
    gameDOMCells.push(document.querySelector(".cell:nth-child(4)"));

    playBtn = document.querySelector(".gameBtn.playBtn");
    playBtn.addEventListener("click", playBtnEventHandler);

    
    //var pauseBtn = document.querySelector(".gameBtn.pauseBtn");
    //var restartBtn = document.querySelector(".gameBtn.restartBtn");
});