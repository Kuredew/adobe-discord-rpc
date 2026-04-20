/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 * Original Copyright (c) 2023 Tee, Demon Cat
 */

function getState(){
    var x;
    try{
        switch(app.activeDocument.reflect.name){
            case "MultitrackDocument":
                x = "Multitrack Session";
                break;
            case "WaveDocument":
                x = "Audio File";
                break;
            case "Document":
                x = "CD Layout"; 
                break;
            default:
                x = app.activeDocument.reflect.name;
        }

    }catch(e){
        x = "Idling";
    }

    return x;

}

function getDetails(){

    try{

    if(app.activeDocument && app.activeDocument.displayName){
        return app.activeDocument.displayName;
    }else{
        return "No file.";
    }

    }catch(e){
        return "No file.";
    }
    
}

function getSmallImageKey(){

}

function getSmallImageText(){

}

function getLargeImageText(){
    return "Adobe Audition";
}

function getPartySize(){
    return 0;
}

function getPartyMax(){
    return 0;
}