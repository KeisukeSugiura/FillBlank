const { ipcRenderer } = require('electron');

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
console.log(windowWidth);
console.log(windowHeight);

const RESOURCE_PATH = "../res/";

var questionList = [];

class FillBlank {
  constructor(textArray, blankIndex){
    this.textArray = textArray
    this.blankIndex = blankIndex
    this.weight = Math.random();
  }

  getTextElement(){
    // TODO: create text element
    const spanElement = document.createElement("span");
    spanElement.className = "text";
    spanElement.innerHTML = this.getText();
    return spanElement;
  }

  getText(){
    var text = ""
    this.textArray.forEach((elm, index, arr) => {
      text = text + elm
    });
    return text
  }
  
}


document.body.style.width = String(windowWidth)+"px";
document.body.style.height = String(windowHeight)+"px";

var cover_div = document.createElement('div');
cover_div.style.width = String(windowWidth)+"px";
cover_div.style.height = String(windowHeight) + "px";
cover_div.style.backgroundColor = "black";
cover_div.style.position = "absolute";
cover_div.style.left = "0px";
cover_div.style.top = "0px";
cover_div.style.zIndex = 1;
document.body.appendChild(cover_div);

/*
  methods
*/
function init(){
  ipcRenderer.send('syncQuestionList',{});
}


function startGame(){
  cover_div.parentNode.removeChild(cover_div);
}

/*
  ipc events
*/
ipcRenderer.on('syncQuestionList',(event,arg)=>{
  //ipcRenderer.send('syncCardList',{cardlist:cardList});

  arg.questionList.forEach((elm,ind,arr)=>{
    console.log(elm)
    questionList.push(new FillBlank(elm.textArray, elm.blankIndex))
  });

  questionList.sort((a, b) => {
      return a.weight < b.weight ? 1 : -1;
  });

  questionList.forEach((elm, ind, arr) => {
    const questionElement = elm.getTextElement();
    const gridElement = document.getElementById("grid_"+String(ind+1));
    gridElement.appendChild(questionElement);
  });
});

ipcRenderer.on("startGame",(event,arg)=>{
  startGame();
});



init();
