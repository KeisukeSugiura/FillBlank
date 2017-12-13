const electron = require('electron')
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

var displayWidth
var displayHeight
var DISPLAY_MAGNIFICATION = 0.8

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let FillBlankWindow
let answerWindow

const RESOURCE_PATH = "../res/";
var questionList = []

class FillBlank {
    constructor(text, blankIndex) {
        this.weight = Math.random();
        this.textArray = text;
        this.blankIndex = blankIndex;
    }

}


function createFillBlankWindow () {
  // Create the browser window.
  console.log("create FillBlank window")
  FillBlankWindow = new BrowserWindow({width: displayWidth*DISPLAY_MAGNIFICATION, height: displayHeight*DISPLAY_MAGNIFICATION, x:0,y:0})

  // and load the index.html of the app.
  FillBlankWindow.loadURL(url.format({
    pathname: path.join(__dirname, './public/html/FillBlank.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //FillBlankWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  FillBlankWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    FillBlankWindow = null
    if(answerWindow != null){
      answerWindow.close()
    }

  })

}

function createAnswerWindow(){
  console.log("create answer window")
  answerWindow = new BrowserWindow({width:displayWidth*DISPLAY_MAGNIFICATION, height:displayHeight*DISPLAY_MAGNIFICATION,x:displayWidth*0.2,y:displayHeight*0.2})

  // answerWindow.webContents.openDevTools()

  answerWindow.loadURL(url.format({
    pathname: path.join(__dirname, './public/html/answer.html'),
    protocol:'file:',
    slashes: true
  }))
  answerWindow.on('closed',() => {
    answerWindow = null
  })
}


function initTextList(){
      return new Promise((resolve,reject)=>{

        var textDataList = JSON.parse(fs.readFileSync('./public/res/test1.json', 'utf8'));
        // console.log(obj);
        questionList = textDataList.map((elm, ind, arr) => {
          console.log(elm);
          return new FillBlank(elm.text_all, elm.blank_index)
        })

        //console.log(cardList);
        questionList.sort((a, b) => {
            return a.weight < b.weight ? 1 : -1;
        });
        console.log(questionList[0]);

        resolve(questionList);
      })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',()=>{

  displayWidth = electron.screen.getPrimaryDisplay().size.width
  displayHeight = electron.screen.getPrimaryDisplay().size.height
  console.log(displayWidth)
  console.log(displayHeight)

  initTextList().then(createAnswerWindow).then(createFillBlankWindow)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  //On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
 if (process.platform !== 'darwin') {
   app.quit()
 }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (FillBlankWindow === null) {
    createFillBlankWindow()
  }
})


// ipc event
//var syncFlg = false≈
ipcMain.on("syncQuestionList",(event, arg)=>{
  // if(!syncFlg){
  //   event.sender.send('syncCardList',)
  // }
//  answerWindow
  event.sender.send('syncQuestionList',{questionList:questionList});
})



ipcMain.on("startGame",(event, arg)=>{
    answerWindow.webContents.send('startGame',{});
    event.sender.send("startGame",{});
})

ipcMain.on("restartGame",(event,arg)=>{
  FillBlankWindow.close();
  cardList = [];
  initTextList().then(createAnswerWindow).then(createFillBlankWindow)
  //FillBlankWindow.webContents.openDevTools()
})
