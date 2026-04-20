/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 */

function getState(){
    try{
        return "Page: "+app.activeWindow.activePage.name;
    }catch(e){
        return "";
    }
}

function getDetails(){
    try{
        return app.activeDocument.name;
    }catch(e){
        return "No file.";
    }
}

function getSmallImageKey(){
    return ""
}

function getSmallImageText(){
    return ""
}

function getLargeImageText(){
    return "Adobe InDesign";
}

function getPartySize(){
    try{
        return app.activeWindow.activePage.name;
    }catch(e){
        return 0;
    }
}

function getPartyMax(){
    try{
        return app.activeDocument.pages.length.toString();
    }catch(e){
        return 0;
    }
}