"use strict"

document.addEventListener("DOMContentLoaded", () => {
    let view = new View();
    try {
        view.setUp();
    } catch {
        throw new PageLoadError("Some problems occurred while loading the page...");
    }
});

class View {

    constructor() {
        this._controller = new Controller();
    }

    setUp() {
        console.debug("Loading the page and setting up elements...");
        this._setUpButtons();
        console.debug("The page and all its elements" +
            "were successfully loaded!");
    }

    _setUpButtons() {
        document.getElementById("logOutBtn").onclick = RequestsToServer.logOutRequest;
        document.getElementById("helpBtn").onclick = () => console.debug("Help");
    }

    _setAlbums() {
        let albums = this._controller.Albums;
    }

    _createAlbumDom(albumInfo) {

    }
}

class Controller {

    constructor() {
        this._model = new Model();
    }

    get Albums() {
        return this._model.Albums;
    }

}

class Model {

    constructor() {
        this._albums = [];
        this._curAlbum = {};
        this._albumContent = [];
        this._curFile = {};
        this._texts = [];
    }

    get Albums() {
        return this._albums;
    }

    _updateAlbums() {
        this._albums = RequestsToServer.fetchAlbumsRequest();
    }

    get AlbumContent() {
        return this._albumContent;
    }

    _updateAlbumContent() {
        this._albums = RequestsToServer.fetchAlbumContentRequest();
    }

    get Texts() {
        return this._albumContent;
    }

    _updateTexts() {
        this._texts = RequestsToServer.fetchTextsRequests();
    }
}

class RequestsToServer {
    static logOutRequest() {
        // http fetch logout request will be here
        console.debug("Logging out...");
    }

    static fetchAlbumsRequest() {
        //    http fetch getAlbums request will be here
        return ['Album 1'];
    }

    static fetchAlbumContentRequest() {
        //    http fetch getAlbumContent request will be here
        return ['Content 1'];
    }

    static fetchTextsRequests() {
        //    http fetch getTexts request will be here
        return ['Text 1'];
    }
}

class TVWebError extends Error {

    constructor(message) {
        super(message);
    }
}

class PageLoadError extends TVWebError {
    constructor(message) {
        super(message);
        this.name = "PageLoadError";
    }
}