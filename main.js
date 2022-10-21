const { app, Tray, Menu, Notification } = require('electron'); //electron ma bhako component haru use gareko
const path = require('path');
const Store= require('electron-store');//to adjust some preferences fro the app
const mongoose= require("mongoose");
let tray;
let notificationInterval;
//Allow only single instance of theapp 

mongoose.connect("mongodb://localhost/wordOfTheDay").then(console.log('connected to database')).catch((e)=>{console.log('error',e)});


// importing modals
 let WordMeaning=require('./modals/database')

const ifFirstInstance= app.requestSingleInstanceLock();
if(!ifFirstInstance){
    app.quit();
}

app.whenReady().then(() => {
    firstRunCheck();
    initTrayMenu();
    const notificationTimee= 2000;//one min
    notificationInterval= setInterval(() => {
        sendnotification();
    },notificationTimee);
  
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('quit',()=>{
    clearInterval(notificationInterval);
});


const initTrayMenu = () => {

    tray = new Tray(path.join(__dirname, '/assets/scrabble.png'));
    const contextmenu = Menu.buildFromTemplate(
        [
            {
                label:"Open At StartUp",
                type:"checkbox",
                checked:app.getLoginItemSettings().openAtLogin,
                click:toogleStartupRun
            },
            {
                label: "Quit",
                click: () => app.quit()
            }
        ]);

    tray.setContextMenu(contextmenu);


};

 const sendnotification =  async() =>{   //async
    var allresult = await WordMeaning.find({isRead:false});


    // console.log(allresult);
       
    const selectRandomNumber = randomnumber(0,allresult.length);

    var title = allresult[selectRandomNumber]['title']

    WordMeaning.updateOne({title:title}, {$set: {isRead:true}})
    // console.log(allresult[11]['title'])
    if (!Notification.isSupported())
        return;

    const notification =  new Notification({
        title: allresult[selectRandomNumber]['title'],
        icon: "./assets/scrabble.png",
        body: allresult[selectRandomNumber]['meaning']
      

    });
     notification.show();
   
};

const firstRunCheck=()=>{

    const store= new Store();
    const runBefore= store.get("runBefore");
    if(!runBefore)
{
    app.setLoginItemSettings({'openAtLogin':true});
    store.set('runBefore',true);
}
};
const toogleStartupRun=()=>{
    const openAtLogin= !app.getLoginItemSettings().openAtLogin;
    app.setLoginItemSettings({openAtLogin});
};
  

const randomnumber=(min,max)=>{
    min=Math.ceil(min);
    max=Math.floor(max);
    return Math.floor(Math.random()*(max-min))+min;  //+1 ni rakhya cha (max-min+1)
};
