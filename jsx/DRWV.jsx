/*
 * Adapted from: https://github.com/teeteeteeteetee/adobe-discord-rpc
 */

function getState(){

    try{
        switch(dw.getDocumentDOM().getView()){
            case "code":
                return "Mode: Code"
                break;
            case "split":
                return "Mode: Split"
                break;
            case "design":
                return "Mode: Live"
                break;
            case "":
            default: 
                return "Idling";
        }
    }catch(e){
        return "Idling"
    }



}

function getDetails(){

    try{

        if(dw.getDocumentDOM().URL === ""){
            return "Untitled";
        }else{
            return (dw.getDocumentDOM().URL).split("/").pop();
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
    return app.appName;
}

function getPartySize(){
    return 0;
}

function getPartyMax(){
    return 0;
}