/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 */

function getState(){
    try{
        return app.activeDocument.activeLayer.name;
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

}

function getSmallImageText(){

}

function getLargeImageText(){
    return "Adobe Illustrator";
}

function getPartySize(){
    try{
        return app.activeDocument.activeLayer.zOrderPosition;
    }catch(e){
        return 0;
    }
}

function getPartyMax(){
    try{
        return app.activeDocument.layers.length;
    }catch(e){
        return 0;
    }
}