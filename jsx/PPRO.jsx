function getDetails() {
    try {
        return app.project.name;
    } catch (e) {
        return "Untitled.prproj";
    }
}

function getState() {
    try {
        return "Working on " + app.project.activeSequence.name + " (" + app.project.rootItem.children.numItems+ ")";
    } catch (e) {
        return "No Active Sequence";
    }
}