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
        document.getElementById("btn").onclick = this.message;
    }



    message() {
        console.log("message")
    }
}

class Controller {

    constructor() {
    }

    
}