'use strict'


function loadPageElements() {
    clearAllInputs();
    showAlbums();
}

function clearAllInputs() {
    document.querySelectorAll('input').forEach(el => {
        el.value = '';
    });
}

function checkTextInput(e, limit, btn) {
    let inputVal = document.getElementById(e.id).value;
    if (!(inputVal > 0 && inputVal <= limit))
        disableButton(btn);
    else
        enableButton(btn);
}

function checkDateInput(e, btn) {
    let inputVal = new Date(document.getElementById(e.id).value).getTime();
    let now = Date.now();
    console.log(inputVal, now);
    if (inputVal <= now)
        disableButton(btn);
    else
        enableButton(btn);
}

function disableButton(id) {
    document.getElementById(id).disabled = true;
}

function enableButton(id) {
    document.getElementById(id).disabled = false;
}

function createNewAlbum() {
    let albumName = document.getElementById('newAlbumName').value;
    let albumComment = document.getElementById('newAlbumComment').value;
    let albumDate = new Date(document.getElementById('newAlbumDate').value).getTime();
    fetch('/album/create', {
        method: 'POST',
        body: JSON.stringify({ name: albumName, comment: albumComment, end: albumDate }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (res.ok)
                showAlbums();
            else
                console.log(res)
        })
        .catch(er => console.error(er))
        .finally(() => {
            UIkit.modal(document.getElementById('createAlbum')).hide();
        })
}

function showAlbums() {
    getAlbumPromise()
        .then(albums => {
            if (albums.length == 0)
                return
            let albumContainer = document.getElementById('mainField');
            albumContainer.innerHTML = '';
            albumContainer.setAttribute('uk-grid', '');
            albumContainer.classList.add('uk-child-width-1-5');
            albums.forEach(el => {
                let albumDom = createAlbumDom(el);
                albumContainer.appendChild(albumDom);
                fillAlbumDropdown(el);
            });
        });
}

function createAlbumDom(album) {
    let albumDom = document.createElement('div');
    albumDom.setAttribute('id', `album_${album._id}`);
    let albumCard = document.createElement('div');
    albumCard.setAttribute('class', 'uk-card uk-card-default uk-card-body');
    albumCard.textContent = album.name;
    albumDom.appendChild(albumCard);
    let albumDropdown = createAlbumDropdown(album);
    albumDom.innerHTML += (albumDropdown);
    return albumDom;
}

function fillAlbumDropdown(album) {
    let drop = document.getElementById(`drop_${album._id}`);
    drop.querySelector('.uk-nav>li:nth-child(8)>a:nth-child(1)').onclick = () => {
        let url = new URL('remove', window.location.href)
        let params = { id: album._id }
        console.log(url, params)
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        fetch(url, {
            method: 'DELETE'
        })
            .then(res => {
                console.log(res);
                showAlbums();
            })
            .catch(er => console.error(er));
    }
}

function createAlbumDropdown(album) {
    const dropdownMarkup = `
        <div uk-dropdown id='drop_${album._id}'>
            <ul class='uk-nav uk-dropdown-nav'>
                <li>${album.name}</li>
                <li>${album.comment}</li>
                <li class="uk-nav-divider"></li>
                <li><a href='#'>Добавить файл</a></li>
                <li><a href='#'>Изменить комментарий</a></li>
                <li><a href='#'>Изменить дату удаления</a></li>
                <li><a href='#'>${album.hide ? 'Показать' : 'Скрыть'}</a></li>
                <li><a href='#'>Удалить</a></li>
            </ul>
        </div>
    `
    return dropdownMarkup.replace(/\s{2,}/g, '');
}

async function getAlbumPromise() {
    try {
        let res = await fetch('/album');
        return await res.json();
    } catch (e) {
        throw e;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadPageElements();
})