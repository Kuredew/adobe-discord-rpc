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

        if (activeItem instanceof CompItem) {
            compName = activeItem.name;
            totalLayer = activeItem.layers.length ? activeItem.layers.length : 0

            return 'Working on ' + compName + ' (' + totalLayer + ' Layers)'
        }
        return 'Idling.'
    } catch (e) {
        return 'No Composition'
    }
}

// Deprecated.
// cuz not all Adobe Apps work with JSON even with polyfill
function getInfo() {
    var project = app.project;
    var projectName = null;
    var compName = null;
    var totalLayer = null;
    
    if (project) {
        try {
            projectName = decodeURIComponent(project.file.name);
        } catch (e) {
            // Nothing, just make sure this is work.
        }
    }

    if (project.activeItem && project.activeItem instanceof CompItem) {
        var comp = project.activeItem;

        compName = comp.name;
        totalLayer = comp.layers.length ? comp.layers.length : 0;
    }

    var info = {
        details: projectName ? projectName : 'Untitled Project.aep',
        state: compName ? 'Working on ' + compName + ' (' + totalLayer + ' Layers)' : 'No Composition'
    }


    return JSON.stringify(info);
}