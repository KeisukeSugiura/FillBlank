const { ipcRenderer } = require('electron');
require('bootstrap')

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
console.log(windowWidth);
console.log(windowHeight);

const RESOURCE_PATH = "../res/";
var matchCount = 0;

var questionList = [];

var startTime = null;
var endTime = null;


class FillBlank {
  constructor(textArray, blankIndex, gridIndex){
    this.textArray = textArray
    this.blankIndex = blankIndex
    this.weight = Math.random();
    this.gridIndex = gridIndex
  }

}


document.body.style.width = String(windowWidth)+"px";
document.body.style.height = String(windowHeight)+"px";

var start_button = document.createElement("button");
start_button.addEventListener('click',(event)=>{
  ipcRenderer.send('startGame',{});
  startGame();
});

var cover_div = document.createElement('div');
cover_div.style.width = String(windowWidth)+"px";
cover_div.style.height = String(windowHeight) + "px";
cover_div.style.backgroundColor = "black";
cover_div.style.position = "absolute";
cover_div.style.zIndex = 1;
document.body.appendChild(cover_div);

start_button.innerHTML = "<font size='50'>start</font>";
start_button.style.position = "absolute";
start_button.style.zIndex = 1;
start_button.style.width = "40%";
start_button.style.height = "40%";
start_button.style.left = "30%";
start_button.style.top = "30%";

document.body.appendChild(start_button);

/*
  methods
*/
function init(){
  ipcRenderer.send('syncQuestionList',{});
}


function checkNumber(card){
  if(cardStack == null){
    cardStack = card;
  }else{
    if(card.number == cardStack.number){
      card.flg = true;
      cardStack.flg = true;
      matchCount++;
      if(matchCount == 27){
        //終了
        endTime = new Date();
        const box_div = document.createElement("div");
        const result_h1 = document.createElement("h1");
        box_div.style.background = "black";
        box_div.style.width = "100%";
        box_div.style.height = "100%";
        box_div.style.opacity = "0.5"
        box_div.style.zIndex = 10;
        result_h1.style.backgroundColor = "white";
        result_h1.style.position = "absolute";
        result_h1.style.textAlign = "center";
        result_h1.style.top ="45%";
        result_h1.style.width = "100%";
        result_h1.style.zIndex = 10;
        result_h1.innerHTML = String((endTime - startTime) / 1000) + "  seconds";
        result_h1.addEventListener("click",(event)=>{
          ipcRenderer.send("restartGame",{});
        })
        box_div.appendChild(result_h1);
        document.body.appendChild(box_div);
      }
      cardStack = null;
    }else{
      openLock = true;
      setTimeout(()=>{
        card.changeSide();
        cardStack.changeSide();
        cardStack = null;
        openLock = false;
      },1000)
    }
  }
}

function startGame(){
  ipcRenderer.send("startGame",{});
}

/*
  ipc events
*/
ipcRenderer.on('syncQuestionList',(event,arg)=>{
  //ipcRenderer.send('syncCardList',{cardlist:cardList});

  arg.questionList.forEach((elm,ind,arr)=>{
      questionList.push(new FillBlank(elm.textArray,elm.blankIndex, ind))
    });

});

ipcRenderer.on('startGame',(event,arg)=>{
  start_button.parentNode.removeChild(start_button);
  openLock=false;
  startTime = new Date();
})




init();
