'use strict'

async function getAlbumsPromise() {
    try {
        let res = await fetch('/album');
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function showFiles() {
    getAlbumsPromise()
        .then(albums => {
            albums.forEach(album => {

            });
        })
}

function showAlbum(album) {

}

function startShow() {

}

document.addEventListener('DOMContentLoaded', () => {
    startShow();
})