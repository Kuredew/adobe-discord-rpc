function getAppCode() {
    return 'AEFT';
}

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