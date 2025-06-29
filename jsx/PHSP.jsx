function getAppCode() {
    return 'PHSP';
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

    /*
    if (project.activeItem && project.activeItem instanceof CompItem) {
        var comp = project.activeItem;

        compName = comp.name;
        totalLayer = comp.layers.length;
    }*/

    var info = {
        details: projectName ? projectName : 'Untitled Project.psd',
        state: 'Idling.'
    }


    return JSON.stringify(info);
}