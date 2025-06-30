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