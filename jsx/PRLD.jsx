/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 */

function PLTitle(){
    return app.project.name

}

function PLApp(){
    return app.project
}

function getState(){
    try{
            var x;
    if (app.project.activeSequence) {
        x = app.project.activeSequence.name;
    } else {
        x = "No active sequence.";
    }
    return x
    }catch(e){
        return "No active sequence.";
    }
}

function getDetails(){
    try{
        return app.project.name
    }catch(e){
        return "No file."
    }

}

function getSmallImageKey(){

}

function getSmallImageText(){

}

function getLargeImageText(){
    return "Adobe Prelude";
}

function getPartySize(){

}

function getPartyMax(){

}