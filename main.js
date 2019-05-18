var gameData = {
    gameAICells: [],
    gameDOMCells: [],
    gameRemainingCellsCount: 0,
    gameMediaElements: [],
    gameStage: 0,
    playBtn: undefined,
    score: 0,
    topScore: window.localStorage.getItem("hassenSimonTopScore") || 0
}

var miscellaneous
var gameEventHandlers = {
    /**
    * play button click event hanldner
    * @param {*} event click event? meh
    */
    playBtnEventHandler: function(event){
        ready(gameData.gameDOMCells);
    },
    gameCellClickEventHandler: function(event){
        gameData.gameRemainingCellsCount++;
        let cellId = parseInt(event.target.dataset.cellId);
        let rightCellId = gameData.gameAICells[gameData.gameRemainingCellsCount - 1];
        console.log("current cellId = ", cellId);
        console.log("right cellId = ", rightCellId);
        console.log("current cell count: ", gameData.gameRemainingCellsCount, " / ", gameData.gameAICells.length);
        playAudio(cellId);
        if(cellId != rightCellId){
            gameOver();
        }
        else if(gameData.gameRemainingCellsCount >= gameData.gameAICells.length ){//stage complete
            gameNextStage();
        }
        //console.log('cell: ', event.target);
    }
}


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
    gameData.gameStage++;
    gameData.gameAICells.push(Math.floor(Math.random() * 4) + 1);
    gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    gameData.playBtn.disabled = true;
    gameTitleMessages([
        {text:'Ready', fontWeight: 'bold', delay:1000},
        {text:'Go', fontWeight: 'bold', delay: 1000},
        {text:'Simon', fontWeight: '', callback: gameAI, callbackParams: [gameDOMCells, gameData.gameAICells]}
    ]);
}

/**
 * the AI of the game in view mode
 * @param {*} gameDOMCells Array of DOM elelements corresponding to game cells
 * @param {*} cellsArray Array of cell indexes to be highlighted
 */
function gameAI(gameDOMCells, cellsArray){
    if(cellsArray.length){
        gameDOMCells[cellsArray[0] - 1].classList.add("active")
        playAudio(cellsArray[0])
        let cellActiveTimer = window.setTimeout(()=>{
            gameDOMCells[cellsArray[0] - 1].classList.remove("active");
            let nextRecursionTimer = window.setTimeout(()=>{
                gameAI(gameDOMCells, cellsArray.slice(1));
            }, 400);
        }, 350);
    }
    else{
        gameTitleMessages([
        {text:'Your turn!', fontWeight: 'bold',callback: ()=>{
            userGamePlay(gameDOMCells)
            gameData.playBtn.disabled = false;    //nope :p
        } , callbackParams: [gameDOMCells]},
        ]);
    }
}

function userGamePlay(gameDOMCells){
    gameData.gameRemainingCellsCount = 0; // reset
    gameDOMCells.forEach(element => {
        element.classList.remove("disabled");
        element.addEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    });

}

function gameNextStage(){
    gameData.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    gameData.gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    console.log("gameNextStage !")
}

function gameOver(){
    gameData.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    gameData.gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    console.log("gameOver !")
}


/**
 * Play one of simon game's beeps according to the clicked cell
 * @param {*} id audio element index equivalent to cell index
 */
function playAudio(id){
    gameData.gameMediaElements[id - 1].cloneNode(true).play();
}
///////////////////////////

document.addEventListener("DOMContentLoaded", function(){
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-1"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-2"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-3"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-4"));

    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='1']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='2']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='3']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='4']"));
    
    gameData.playBtn = document.querySelector(".gameBtn.playBtn");
    gameData.playBtn.addEventListener("click", gameEventHandlers.playBtnEventHandler);

    
    //var pauseBtn = document.querySelector(".gameBtn.pauseBtn");
    //var restartBtn = document.querySelector(".gameBtn.restartBtn");
});