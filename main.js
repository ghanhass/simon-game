var gameData = {
    gameAICells: [],
    gameDOMCells: [],
    gameRemainingCellsCount: 0,
    gameMediaElements: [],
    gameStage: 0,

    playBtn: undefined,

    score: 0,
    topScore: getTopScore(),
    gameDOMScore: undefined,
    gameDOMTopScore: undefined,

    gameDOMTitle: undefined,
    gameDiv: undefined,
    gameScoresDiv: undefined
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
        //console.log("current cellId = ", cellId);
        //console.log("right cellId = ", rightCellId);
        //console.log("current cell count: ", gameData.gameRemainingCellsCount, " / ", gameData.gameAICells.length);
        
        if(cellId != rightCellId){
            gameOver();
        }
        else{
            playAudio(cellId);
            if(gameData.gameRemainingCellsCount >= gameData.gameAICells.length ){//stage complete
                setScore(gameData.score + 1);
                gameNextStage();
            }
        }

        
        //console.log('cell: ', event.target);
    }
}

function setScore(score){
    gameData.score = score;
    gameData.gameDOMScore.textContent = score;
    if(gameData.topScore < gameData.score){
        setTopScore(score)
    }
}
function getTopScore(){
    let topScore = localStorage.getItem("hassenSimontopScore");
    if(topScore){
        return parseInt(topScore);
    }
    localStorage.setItem("hassenSimontopScore", 0);
    return 0;
}
function setTopScore(score = undefined){
    let storedTopScore = localStorage.getItem("hassenSimontopScore");
    if(score){
        localStorage.setItem("hassenSimontopScore", score);
        gameData.gameDOMTopScore.textContent = score;
        gameData.topScore = score;
    }
    else{
        if(storedTopScore){
            gameData.topScore = parseInt(storedTopScore);
            gameData.gameDOMTopScore.textContent = storedTopScore;
        }
        else{
            localStorage.setItem("hassenSimontopScore", 0);
            gameData.gameDOMTopScore.textContent = 0;
        }
    }
}

/** Change game title text configurationally
 * 
 * @param messagesArray Array<{text: string, fontWeight: string, delay: number, callback: function, callbackParams: Array<any>}>
 */
function gameTitleMessages(messagesArray){
    if(messagesArray.length){

        gameData.gameDOMTitle.style.fontWeight = messagesArray[0].fontWeight;
        gameData.gameDOMTitle.textContent = messagesArray[0].text;
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
    if(!gameData.gameAICells.length){//reset score after a gameover call
        setScore(0);
    }
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
            gameData.playBtn.disabled = true; //disable play button
        } , callbackParams: [gameDOMCells]},
        ]);
    }
}

function userGamePlay(gameDOMCells){
    gameData.gameRemainingCellsCount = 0; // reset counter
    gameDOMCells.forEach(element => {
        element.classList.remove("disabled"); //enable cells
        element.addEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    });

}

function gameNextStage(){
    gameData.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    gameData.gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    console.log("gameNextStage !")
    gameTitleMessages([{text: "Good job!", fontWeight: 'bold', delay: 500, callback: ()=>{
        gameData.playBtn.disabled = false; //enable play button
    }
    }])
}

function gameOver(){
    playAudio(5);
    gameTitleMessages([{text: "Game Over!", fontWeight: "bold", delay: 700, callback: ()=>{
            gameData.playBtn.disabled = false; //enable play button
            gameData.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
            gameData.gameDOMCells.forEach(element => {
                element.classList.add("disabled");
                console.log("gameOver !");
                gameData.gameAICells = [];
            });
        }},
        {text: gameData.gameDOMTitle.textContent, fontWeight: "", delay: 2000, callback: ()=>{
            scoresBoard();
        }
        }
    ]);
}


/**
 * Play one of simon game's beeps according to the clicked cell
 * @param {*} id audio element index equivalent to cell index
 */
function playAudio(id){
    gameData.gameMediaElements[id - 1].cloneNode(true).play();
}

function initGame(){
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-1"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-2"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-3"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-4"));
    gameData.gameMediaElements.push(document.querySelector("#simon-sound-X"));

    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='1']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='2']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='3']"));
    gameData.gameDOMCells.push(document.querySelector(".cell[data-cell-id='4']"));
    
    gameData.playBtn = document.querySelector(".gameBtn.playBtn");
    gameData.playBtn.addEventListener("click", gameEventHandlers.playBtnEventHandler);

    gameData.gameDOMScore = document.querySelector("#score");
    gameData.gameDOMTopScore = document.querySelector("#top-score");
    gameData.gameDOMTitle = document.querySelector(".game-title");
    gameData.gameDiv = document.querySelector(".outerGameDiv");
    gameData.gameScoresDiv = document.querySelector(".outerScoresDiv");
    setScore(0);
    setTopScore();
}

function scoresBoard(){
    document.body.className = "animateGame";
    gameData.gameDiv.classList.add("isHidden");
    gameData.gameDiv.classList.remove("isShown");
    gameData.gameScoresDiv.classList.add("isShown");
    gameData.gameScoresDiv.classList.remove("isHidden");
}
///////////////////////////

document.addEventListener("DOMContentLoaded", function(){
    
    initGame();
    
    //var pauseBtn = document.querySelector(".gameBtn.pauseBtn");
    //var restartBtn = document.querySelector(".gameBtn.restartBtn");
});