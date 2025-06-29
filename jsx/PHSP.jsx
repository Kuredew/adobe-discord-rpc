//#include "json2.js";

function getDetails() {
    try {
        return app.activeDocument.name;
    } catch (e) {
        return 'Untitled Project.psd';
    }
}

function getState() {
    try {
        return 'Editing on ' + app.activeDocument.activeLayer.name;
    } catch (e) {
        return 'Idling.'
    }
}

/*
function getInfo() {
    var docName = getdocName();
    //var activeLayer = 'Bruh';
    
    //getdocName(docName);
    //getActiveLayer(activeLayer);


    var info = {
        details: docName ? docName : 'Untitled Project.psd',
        state: 'bjir'
    }

    //var infoString = '{"details": "test", "state": "bjir"}';

    return JSON.stringify(info);
}*/