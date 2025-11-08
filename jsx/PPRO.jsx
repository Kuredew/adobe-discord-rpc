function getDetails() {
    try {
        if (app.project && app.project.file && app.project.file.name) {
            return decodeURIComponent(app.project.file.name);
        } else if (app.project && app.project.name) {
            return app.project.name;
        }
        return "Untitled.prproj";
    } catch (e) {
        return "Untitled.prproj";
    }
}

function getState() {
    try {
        if (app.project && app.project.activeSequence) {
            var sequenceName = app.project.activeSequence.name;
            var itemCount = 0;
            if (app.project.rootItem && app.project.rootItem.children) {
                itemCount = app.project.rootItem.children.numItems;
            }
            return sequenceName + " (" + itemCount + " items)";
        }
        return "Idling.";
    } catch (e) {
        return "Idling.";
    }
}