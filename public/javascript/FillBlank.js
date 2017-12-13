const { ipcRenderer } = require('electron');

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
  constructor(textArray, blankIndex, gridIndex, onInput){
    this.textArray = textArray
    this.blankIndex = blankIndex
    this.weight = Math.random()
    this.gridIndex = gridIndex
    this.blankText = this.getBlankText()
    this.isComplete = false
    this.onInput = onInput
  }

  getTextElements(){
    const beforeBlankTextArray = this.textArray.filter((elm, ind, arr) => {
      if(ind < this.blankIndex[0]){
        return true;
      }else {
        return false;
      }
    });

    const blankTextArray = this.textArray.filter((elm, ind, arr) => {
      if(this.blankIndex[0] <= ind && ind <= this.blankIndex[1]){
        return true;
      }else{
        return false;
      }
    });
    
    const afterBlankTextArray = this.textArray.filter((elm, ind, arr)=>{
      if(this.blankIndex[1] < ind){
        return true;
      }else{
        return false;
      }
    });

    this.elementList = [this.createSpanElement(this.concatText(beforeBlankTextArray)), this.createTextAreaElement(), this.createSpanElement(this.concatText(afterBlankTextArray))];

    return this.elementList;
  }

  createSpanElement(text){
    const spanElement = document.createElement("span");
    spanElement.className = "text";
    spanElement.innerHTML = text;
    return spanElement;
  }

  createTextAreaElement(){
    const textAreaElement = document.createElement("textarea");
    textAreaElement.className = "text_area";
    textAreaElement.addEventListener("input",(evt) => {
      if(this.blankText.replace(/[\r\n\s]+/g, "") == textAreaElement.value.replace(/[\r\n\s]+/g, "")){
        this.isComplete = true
        textAreaElement.className = "text_area_complete"
      }else{
        this.isComplete = false
        textAreaElement.className = "text_area"
      }
      this.onInput();
    });
    return textAreaElement;
  }

  setDisableToEdit(){
    this.elementList.forEach((elm, ind, arr) => {
      elm.disabled = true;
    });
  }

  concatText(textArray){
    var text = "";
    textArray.forEach((elm, ind, arr) => {
      if(text == ""){
        text = elm;
      }else{
        text = text + " " + elm;
      }
    });
    return text;
  }
  
  getBlankText(){
    var blankTextArray = this.textArray.filter((elm, ind, arr) => {
      if(this.blankIndex[0] <= ind && ind <= this.blankIndex[1]){
        return true;
      }else{
        return false;
      }
    });
    return this.concatText(blankTextArray);
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
cover_div.style.left = "0px";
cover_div.style.top = "0px";
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


function checkComplete(){

  const completeList = questionList.filter((elm, ind, arr) => {
    return elm.isComplete;
  });

  if(completeList.length == 6){
    questionList.forEach((elm, ind, arr) => {
      elm.setDisableToEdit();
    });
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
}

function startGame(){
  ipcRenderer.send("startGame",{});
}

/*
  ipc events
*/
ipcRenderer.on('syncQuestionList',(event,arg)=>{
  //ipcRenderer.send('syncCardList',{cardlist:cardList});

  // FillBlank オブジェクト作成
  arg.questionList.forEach((elm,ind,arr)=>{
    questionList.push(new FillBlank(elm.textArray, elm.blankIndex, ind, checkComplete))
  });

  // Append Elements
  questionList.forEach((elm, ind, arr) => {
    const questionElements = elm.getTextElements();
    const gridElement = document.getElementById("grid_"+String(ind+1));

    questionElements.forEach((elm, ind, arr) => {
      gridElement.appendChild(elm);
    });
  });

});

ipcRenderer.on('startGame',(event,arg)=>{
  console.log("start");
  start_button.parentNode.removeChild(start_button);
  cover_div.parentElement.removeChild(cover_div);
  startTime = new Date();
})




init();
