"use strict"

document.addEventListener("DOMContentLoaded", () => {
    let view = new View();
    view.setUp();
});

class View {

    constructor() {
        this.controller = new Controller();
    }

    setUp() {

    }
}

class Controller {

    constructor() {
    }

}

class Model {

    constructor() {
    }

    _getAlbums() {
        //    http request will be here
        return [];
    }
}