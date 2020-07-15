'use strict'
import * as errors from '/static/JS/errors.js'

document.addEventListener('DOMContentLoaded', () => {
    let album = {
        name: 'albumName',
        comment: 'albumComment',
        hide: false,
        end: new Date().getTime()
    };
    let view = new View();
    try {
        view.setUp();
    } catch (e) {
        if (e)
            throw new Error(e.message);
    }
});

class View {

    constructor() {
        this._controller = new Controller();
        this._currentSection = 0;
        this._sectionsList = {
            0: () => {
                this._setAlbums();
                this._currentSection = 0;
            },
            1: () => {
                this._currentSection = 1;
            }
        }
    }

    setUp() {
        console.log('Loading the page and setting up elements...');
        this._setUpButtons();
        this._setAlbums();
        this._setSectionListButtons();
        console.log('The page and all its elements ' +
            "were successfully loaded!");
    }

    _setUpButtons() {
        document.getElementById('logOutBtn').onclick =
            RequestsToServer.logOutRequest;
        document.getElementById('helpBtn').onclick = () =>
            console.debug('Help');
    }

    _setAlbums() {
        let albums = this._controller.Albums;
        console.log(albums);
        // let albumGrid = document.createElement('div');
        // albumGrid.setAttribute('class', 'album-grid');
        // albums.forEach(albumInfo => {
        // let albumDiv = this._createAlbumDom(albumInfo);
        // albumGrid.appendChild(albumDiv);
        // });
        // document.querySelector('.container').appendChild(albumGrid);
    }

    _setTexts() {
        let texts = this._controller
    }

    _setSectionListButtons() {
        for (let i = 0; i < 2; i++) {
            let num = i;
            document.getElementById(`section-${i}`).onclick = () => {
                this._switchSection(num);
            }
        }
    }

    _createAlbumDom(albumInfo) {
        let albumDiv = document.createElement('div');
        albumDiv.setAttribute('id', albumInfo._id);
        albumDiv.setAttribute('class', 'album');
        let albumText = document.createElement('p');
        albumText.textContent = albumInfo._id;
        albumDiv.appendChild(albumText);
        return albumDiv;
    }

    _closeAllSections() {
        let container = document.querySelector('.container');
        if (container.children.length < 2)
            throw new errors.UnexpectedError('Less then two children in ' +
                "container, omg!");
        container.removeChild(container.lastElementChild);
    }

    _switchSection(section) {
        if (!(section in this._sectionsList))
            throw new errors.UnexpectedError(`Key ${section} not found`);
        if (section === this._currentSection)
            return;
        this._closeAllSections();
        this._sectionsList[section]();
    }

    _createBasicDropdown(id, anchorCounts) {
        let dropdownDom = document.createElement('div');
        dropdownDom.setAttribute('class', 'dropdown');
        dropdownDom.setAttribute('id', id);
        for (let i = 0; i < anchorCounts; i++) {
            let anchorDom = document.createElement('a');
            dropdownDom.appendChild(anchorDom);
        }
        return dropdownDom;
    }

    _setUpCreationDropdown() {
        let dropdownDom = this._createBasicDropdown('createDropdown', 2);
        
    }
}

class Controller {

    constructor() {
        this._model = new Model();
    }

    get Albums() {
        return this._model.Albums;
    }

    get Texts() {
        return this._model.Texts;
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
        this._updateAlbums();
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
        this._updateTexts();
        return this._albumContent;
    }

    _updateTexts() {
        this._texts = RequestsToServer.fetchTextsRequests();
    }
}

class RequestsToServer {
    static logOutRequest() {
        // http fetch logout request will be here
        const request = async () => {
            const response = await fetch('some_api', {
                method: 'POST'
            });
            if (response.ok)
                return response.json();
            else
                throw new errors.RequestError(`${response.status}`)
        }
        try {

        } catch (error) {

        }
        request();
        console.debug("Logging out...");
    }

    static fetchAlbumsRequest() {
        const request = async () => {
            const response = await fetch('/album', {
                method: 'GET'
            });
            if (!(response.ok))
                console.error(response.status);
            else {
                const json = await response.json();
                console.log(json);
            }
        }
        const getReq = async () => {
            return await request();
        }
        return getReq();
    }

    static createNewAlbumRequest(albumBody) {
        const request = async (body) => {
            const response = await fetch('/album/create', {
                method: 'POST',
                body: body
            });
            if (!(response.ok))
                console.error(response.status);
        }
        return request(albumBody);
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