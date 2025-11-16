//#include "json2.js";

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