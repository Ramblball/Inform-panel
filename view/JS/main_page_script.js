'use strict'


document.addEventListener('DOMContentLoaded', () => {
    let view = new View();
    view.setUp();
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
        document.getElementById('logOutBtn').onclick = () => {
            RequestsToServer.makeFetchGetRequest('/logout');
        }
        document.getElementById('helpBtn').onclick = () =>
            console.debug('Help');
    }

    _setAlbums() {
        let albums = this._controller.Albums;
        if (albums.length == 0)
            return
        let albumGrid = document.createElement('div');
        albumGrid.setAttribute('class', 'album-grid');
        albums.forEach(albumInfo => {
            let albumDiv = this._createAlbumDom(albumInfo);
            albumGrid.appendChild(albumDiv);
        });
        document.querySelector('.container').appendChild(albumGrid);
        let fileInput = docment.createElement('input');
        fileInput.setAttribute('id', 'fileInput');
        fileInput.style.display = 'none';
        fileInput.onclick = () => { console.log('Открывается модальное окно для добавления файла в альбом') } // TODO: Надо как-то брать id альбома при нажатии, замыкание
        document.querySelector('.container').appendChild(fileInput);
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
        albumText.textContent = albumInfo.name;
        albumDiv.appendChild(albumText);
        let albumDrop = this._createAlbumDropdown(albumInfo);
        albumDiv.appendChild(albumDrop);
        albumDiv.oncontextmenu = (e) => {
            e.preventDefault();
            this._openDropdown(e, albumDrop.id);
        };
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
        dropdownDom.childNodes[0].textContent = 'Альбом';
        dropdownDom.childNodes[0].onclick = () => { console.log('Тут типо открыается модалка для создания альбома') };
        dropdownDom.childNodes[1].textContent = 'Объявление';
        dropdownDom.childNodes[1].onclick = () => { console.log('Тут типо открыается модалка для создания объявления') };
    }

    _createAlbumDropdown(album) {
        let dropdownDom = this._createBasicDropdown(`${album._id}_drop`, 6);

    }

    _createBasicModalWindow() {
        let modalDom = document.getElementById('div');
        modalDom.setAttribute('class', 'modal');
        let modalContent = document.createElement('div');
        modalContent.setAttribute('class', 'modal-content');
        modalDom.appendChild(modalContent);
        return modalDom;
    }

    _createAlbumCreateModal() {
        
    }

    _openDropdown(event, dropdownId) {
        this._closeAllDropdowns();
        document.getElementById(dropdownId).style.display = 'block';
        document.getElementById(dropdownID).style.left = event.pageX + "px";
        document.getElementById(dropdownID).style.top = event.pageY + "px";
    }

    _closeAllDropdowns() {
        document.querySelectorAll(".dropdown")
            .forEach(dropdown => {
                dropdown.style.display = "none";
            });
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
        this._albums = RequestsToServer.makeFetchGetRequest('/album');
    }

    CreateNewAlbum(albumInfo) {
        RequestsToServer.makeFetchPostRequest('/album/create', albumInfo);
    }
}

class RequestsToServer {
    static makeFetchPostRequest(url, data, waitForResponse = false) {
        const request = async (url, data, waitForResponse) => {
            let response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .catch(er => { throw er });

            if (waitForResponse)
                return await response.json();
        }
        return request(url, data, waitForResponse);
    }

    static makeFetchGetRequest(url) {
        const request = async (url) => {
            let response = await fetch(url)
                .catch(er => { throw er });
            return await response.json();
        }
        return request(url);
    }
}