/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 */


var FLTitle2;

function getState(){
    try{
        if(document.name){
            var i = fl.getDocumentDOM().getTimeline().currentLayer;
            var info = fl.getDocumentDOM().getTimeline().layers[i].name
        }
    }catch(err){

        if(err){
            info = "Testing Movie";
        }
    }

    return info;
}

function getDetails(){
    var info;

    try{
        if(document.name){
            info = document.name
            FLTitle2 = info;
        }
    }catch(err){

        if(err){
            info = FLTitle2;
        }
    }

    return info;
}

function getSmallImageKey(){

}

function getSmallImageText(){

}

function getLargeImageText(){
    return "Adobe Animate";
}

function getPartySize(){
    return 0;
}

function getPartyMax(){
    return 0;
}