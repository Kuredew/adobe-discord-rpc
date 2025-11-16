// some code is adapted from https://github.com/teeteeteeteetee/adobe-discord-rpc

function getDetails() {
    try {
        return app.activeDocument.name;
    } catch (e) {
        return 'Untitled.psd';
    }
}

function getState() {
    try {
        return app.activeDocument.activeLayer.name;
    } catch (e) {
        return 'Idling.'
    }
}

function getSmallImageKey(){
    try{
        return app.currentTool.toString().toLowerCase();
    }catch(e){
        return "";
    }
}

function getPartySize(){
    try{

        return app.activeDocument.activeLayer.itemIndex;

    }catch(e){
        return 0;
    }
}

function getPartyMax(){
    try{

        var all_layers = 0;

        if(app.activeDocument.layerSets.length !== 0){

            for (var i=0, len=app.activeDocument.layerSets.length; i < len ; i++) {
              all_layers = all_layers + app.activeDocument.layerSets[i].layers.length + app.activeDocument.layerSets.length
            };
        }

        return app.activeDocument.layers.length + all_layers;
    }catch(e){
        return 0;
    }
}