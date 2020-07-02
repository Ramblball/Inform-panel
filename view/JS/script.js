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
        this._setUpButtons();
    }

    _setUpButtons() {
        document.getElementById("btn").onclick = this.message;
    }

    message() {
        console.log("message");
    }
}

class Controller {

    constructor() {
    }

}