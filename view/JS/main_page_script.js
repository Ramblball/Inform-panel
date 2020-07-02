"use strict"

document.addEventListener("DOMContentLoaded", () => {
    let view = new View();
    view.setUp();
});

class TVWebError extends Error {

    constructor(message) {
        super(message);
        this.name = "";
    }
}

class PageLoadError extends TVWebError {
    constructor(message) {
        super(message);
        this.name = "PageLoadError";
    }
}

class View {

    constructor() {
        this.controller = new Controller();
        this._LOAD_PAGE_ERROR = false;
    }

    setUp() {
        console.debug("Loading the page and setting up elements...");
        this._LOAD_PAGE_ERROR = true;
        if (!this._LOAD_PAGE_ERROR)
            console.debug("The page was loaded and all its elements" +
                "were successfully loaded!");
        else
            throw new PageLoadError("Some problems occurred while loading page...");
    }
}

class Controller {

    constructor() {
        this._model = new Model();
    }

}

class Model {

    constructor() {
        this._albums = []
        this._albumContent = [];
    }

    _fetchAlbums() {
        //    http fetch request will be here
        this._albums = ['Album 1'];
    }

    get Albums () {
        return this._albums;
    }

    _fetchAlbumContent() {
        //    http fetch request will be here
        this._albums = ['Album 1'];
    }

    get AlbumContent () {
        return this._albumContent;
    }
}