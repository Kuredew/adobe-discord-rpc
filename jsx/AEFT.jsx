// some code is adapted from https://github.com/teeteeteeteetee/adobe-discord-rpc

function getDetails() {
    try {
        return decodeURIComponent(app.project.file.name);
    } catch (e) {
        return 'Untitled Project.aep'
    }
}

function getState() {
    try {
        var activeItem = app.project.activeItem;

        if (activeItem && activeItem instanceof CompItem) {
            compName = activeItem.name;

            return compName;
        }
        return 'Idling.'
    } catch (e) {
        return 'No Composition'
    }
}

function getSmallImageKey(){
    try{
        return app.project.toolType;
    }catch(e){
        return "";
    }
}

function getPartySize() {
    try {
        var activeItem = app.project.activeItem;

        if (activeItem && activeItem instanceof CompItem) {
            selectedLayer = activeItem.selectedLayers[0];
            return selectedLayer.index;
        }
        return 0;
    }
    catch (e) {
        return 0;
    }
}

function getPartyMax() {
    try {
        var activeItem = app.project.activeItem;

        if (activeItem && activeItem instanceof CompItem) {
            totalLayer = activeItem.layers.length ? activeItem.layers.length : 0;

            return totalLayer;
        }
        return 0
    }
    catch (e) {
        return 0
    }
}