var gameData = {
    gameXHR: new XMLHttpRequest(),
    gameAICells: [],
    gameDOMCells: [],
    gameRemainingCellsCount: 0,
    gameMediaElements: [],
    gameStage: 0,

    gameButtons:{
        playBtn: undefined,
        exitScoresBoardBtn: undefined,
        submitUsernameInputBtn: undefined
    },

    usernameInput: undefined,

    score: 0,
    topScore: 0,
    topPlayers: [],
    gameDOMScore: undefined,
    gameDOMTopScore: undefined,

    gameDOMTitle: undefined,
    gameDiv: undefined,
    gameScoresDiv: undefined,
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
    exitScoresBoardBtnEventHandler: function(event){
        GameBoard()
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
    },
    animationStartHandler: function(event){
        console.log("animationStartHandler ", event);
        switch(event.animationName){
            case "rotatesimonhide": //whatever
            break;    
        }
    },
    animationEndHandler: function(event){
        console.log("animationEndHandler ", event);
        switch(event.animationName){
            case "rotatesimonhide": document.body.classList.remove("animateShowScores");
            break;   

            case "rotatesimonshow": document.body.classList.remove("animateShowGame");
            break; 
        }
    },
    /*
    showScoresAnimationStartEventHandler: function(event){
        console.log('inside  showScoresAnimationStartEventHandler!');
    },
    showScoresAnimationEndEventHandler: function(event){
        console.log('inside  showScoresAnimationEndEventHandler!');
        document.body.classList.remove("animateShowScores");
    },
    showGameAnimationStartEventHandler: function(event){
        console.log('inside  showGameAnimationStartEventHandler!');
    },
    showGameAnimationEndEventHandler: function(event){
        console.log('inside  showGameAnimationEndEventHandler!');
        document.body.classList.remove("animateShowGame");
    },*/
    getScoresAjaxResponse: function(event){
        console.log('getScoresAjaxResponse: ', this);
        let items = JSON.parse(this.responseText).items;
        gameData.topScore = parseInt(items[0].score);
        gameData.topPlayers = items;
        gameData.gameDOMTopScore.textContent = items[0].score;
        document.querySelector(".scoresLoaded").style.display = "";
        document.querySelector(".scoresLoading").style.display = "none";
        fillScoresTable();

        gameData.gameXHR.removeEventListener("load", gameEventHandlers.getScoresAjaxResponse);
    },
    viewScoresEventHandler: function(event){
        scoresBoard(false);
    }
}

function setScore(score){
    gameData.score = score;
    gameData.gameDOMScore.textContent = score;
    if(gameData.topScore < gameData.score){
        setTopScore(score)
    }
}

function fillScoresTable(){
    let tbody = document.querySelector("#scoresTable > tbody");
    tbody.innerHTML = "";
    gameData.topPlayers.forEach((player, index)=>{
        tbody.innerHTML += "<tr><td>" + player.name + "</td><td>" + player.score + "</td></tr>";
    })
}

function setTopScore(score = undefined){

    if(score){ //set new game topscore ingame ?
        gameData.topScore = score ? score : gameData.topScore;
    }
    else{ //initiate game topscore from server ?
        gameData.gameXHR.open("GET", "https://5ced4e76b779120014b4a06a.mockapi.io/api/v1/simon_scores?sortBy=score&order=desc");
        gameData.gameXHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        gameData.gameXHR.send();
        gameData.gameXHR.addEventListener("load", gameEventHandlers.getScoresAjaxResponse)
    }
    

    let storedTopScore = localStorage.getItem("hassenSimontopScore");// to be restorable from DB in the future
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
    gameData.gameButtons.playBtn.disabled = true;
    gameData.gameButtons.viewScoresBtn.disabled = true;
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
            gameData.gameButtons.playBtn.disabled = true; //disable play button
            gameData.gameButtons.viewScoresBtn.disabled = true
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
    gameData.gameButtons.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
    gameData.gameDOMCells.forEach(element => {
        element.classList.add("disabled");
    });
    console.log("gameNextStage !")
    gameTitleMessages([{text: "Good job!", fontWeight: 'bold', delay: 500, callback: ()=>{
        gameData.gameButtons.playBtn.disabled = false; //enable play button
        gameData.gameButtons.viewScoresBtn.disabled = false;
    }
    }])
}

function gameOver(){
    playAudio(5);
    gameTitleMessages([{text: "Game Over!", fontWeight: "bold", delay: 700, callback: ()=>{
            gameData.gameButtons.playBtn.disabled = false; //enable play button
            gameData.gameButtons.viewScoresBtn.disabled = false;
            gameData.gameButtons.playBtn.removeEventListener("click", gameEventHandlers.gameCellClickEventHandler);
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
    
    gameData.gameButtons.playBtn = document.querySelector(".gameBtn#playBtn");

    gameData.gameButtons.exitScoresBoardBtn = document.querySelector("#exitScoresBoardBtn");

    gameData.gameDOMScore = document.querySelector("#score");
    gameData.gameDOMTopScore = document.querySelector("#top-score");
    gameData.gameDOMTitle = document.querySelector(".game-title");
    gameData.gameDiv = document.querySelector(".outerGameDiv");
    gameData.gameScoresDiv = document.querySelector(".outerScoresDiv");
    gameData.gameButtons.viewScoresBtn = document.querySelector("#viewScoresBtn");

    gameData.usernameInput = document.querySelector("#usernameInput");

    gameData.gameButtons.playBtn.addEventListener("click", gameEventHandlers.playBtnEventHandler);
    gameData.gameDiv.addEventListener("animationstart", gameEventHandlers.animationStartHandler);
    gameData.gameDiv.addEventListener("animationend", gameEventHandlers.animationEndHandler);
    gameData.gameButtons.viewScoresBtn.addEventListener("click", gameEventHandlers.viewScoresEventHandler);
    gameData.gameButtons.exitScoresBoardBtn.addEventListener("click", gameEventHandlers.exitScoresBoardBtnEventHandler);

    setScore(0);
    setTopScore();
}

function scoresBoard(canInput = true){
    document.body.classList.add("animateShowScores");
    gameData.gameDiv.classList.add("isHidden");
    gameData.gameDiv.classList.remove("isShown");
    gameData.gameScoresDiv.classList.add("isShown");
    gameData.gameScoresDiv.classList.remove("isHidden");
    gameData.usernameInput.parentNode.style.display = canInput === false? 'none' : '';
}

function GameBoard(){
    document.body.classList.add("animateShowGame");
    gameData.gameDiv.classList.add("isShown");
    gameData.gameDiv.classList.remove("isHidden");
    gameData.gameScoresDiv.classList.add("isHidden");
    gameData.gameScoresDiv.classList.remove("isShown");
}
///////////////////////////

document.addEventListener("DOMContentLoaded", function(){
    initGame();
});