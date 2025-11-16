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
            totalLayer = activeItem.layers.length ? activeItem.layers.length : 0;

            return compName + ' (' + totalLayer + ' Layers)'
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