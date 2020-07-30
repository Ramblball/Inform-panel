'use strict'


function loadPageElements() {
    clearAllInputs();
    showAlbums();
}

function logOut() {
    fetch('/logout')
        .then(res => {
            console.log(res);
            window.location.href = '/';
        })
        .catch(er => console.log(er));
}

function clearAllInputs() {
    document.querySelectorAll('input').forEach(el => {
        el.value = '';
    });
    document.querySelectorAll('textarea').forEach(el => {
        el.value = '';
    });
}

function showAlert(style, message) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('id', 'alert-wrapper');
    wrapper.style.position = 'absolute';
    wrapper.style.zIndex = '1';
    wrapper.style.top = '30px';
    wrapper.style.width = '100%';
    let alertDiv = document.createElement('div');
    alertDiv.setAttribute('uk-alert', '');
    alertDiv.setAttribute('class', style + ' uk-align-center');
    let p = document.createElement('p');
    p.textContent = message;
    alertDiv.appendChild(p);
    alertDiv.style.width = '50%';
    wrapper.appendChild(alertDiv);
    document.body.appendChild(wrapper);
    removeAlert();
}

function removeAlert() {
    setTimeout(() => {
        document.getElementById('alert-wrapper').remove();
    }, 2500);
}

function createQueryUrl(baseUrl, params) {
    let url = new URL(baseUrl, window.location.href);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url;
}

function removeObject(baseUrl, objectId, okMsg, erMsg, finallyFunc) {
    let url = createQueryUrl(baseUrl, {id: objectId});
    fetch(url, {
        method: 'DELETE'
    })
        .then(res => {
            showAlert('uk-alert-primary', okMsg);
        })
        .catch(er => {
            showAlert('ur-alert-warning', erMsg);
        })
        .finally(res => {
            finallyFunc();
        });
}

function checkTextInput(selector, limit) {
    let textInput = document.querySelector(selector);
    return textInput.value.length <= limit && textInput.value.length !== 0;
}

function checkDateInput(selector) {
    let inputVal = new Date(document.querySelector(selector).value).getTime();
    let now = Date.now();
    return inputVal > now;
}

function checkAlbumCreationModal() {
    let nameInputStatus = checkTextInput('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(1) > input:nth-child(2)', 64);
    let commentInputStatus = checkTextInput('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(2) > input:nth-child(2)', 256);
    let dateInputStatus = checkDateInput('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(3) > input:nth-child(2)');
    if (!(nameInputStatus && commentInputStatus && dateInputStatus)) {
        document.querySelector('button.uk-button:nth-child(4)').removeAttribute('enabled');
        document.querySelector('button.uk-button:nth-child(4)').setAttribute('disabled', '');
    } else {
        document.querySelector('button.uk-button:nth-child(4)').removeAttribute('disabled');
        document.querySelector('button.uk-button:nth-child(4)').setAttribute('enabled', '');
    }
}

async function getAlbumPromise() {
    try {
        let res = await fetch('/album');
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function createNewAlbum() {
    let albumName = document.querySelector('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(1) > input:nth-child(2)').value;
    let albumComment = document.querySelector('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(2) > input:nth-child(2)').value;
    let albumDate = new Date(document.querySelector('#createAlbum > div:nth-child(1) >' +
        ' div:nth-child(3) > div:nth-child(3) > input:nth-child(2)').value).getTime();
    fetch('/album/create', {
        method: 'POST',
        body: JSON.stringify({name: albumName, comment: albumComment, end: albumDate}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (res.ok) {
                showAlert('uk-alert-primary', 'Альбом создан успешно');
                showAlbums();
            } else {
                console.log(res);
                showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
            }
        })
        .catch(er => {
            console.error(er);
            showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
        })
        .finally(() => {
            clearAllInputs();
            UIkit.modal(document.getElementById('createAlbum')).hide();
        })
}

function showAlbums() {
    getAlbumPromise()
        .then(albums => {
            let albumContainer = document.getElementById('mainField');
            albumContainer.innerHTML = '';
            if (albums.length === 0)
                return
            albumContainer.setAttribute('uk-grid', '');
            albumContainer.classList.add('uk-child-width-1-5');
            albums.forEach(album => {
                let albumDom = createAlbumDom(album);
                albumContainer.appendChild(albumDom);
                fillAlbumDropdown(album);
            });
        });
}

function createAlbumDom(album) {
    let albumDom = document.createElement('div');
    albumDom.setAttribute('id', `album_${album._id}`);
    let albumCard = document.createElement('div');
    albumCard.setAttribute('class', 'uk-card uk-card-body');
    albumCard.classList.add(album.hide ? 'uk-card-secondary' : 'uk-card-default');
    albumCard.textContent = album.name;
    albumDom.appendChild(albumCard);
    let albumDropdownMarkup = createAlbumDropdown(album);
    albumDom.innerHTML += (albumDropdownMarkup);
    return albumDom;
}

function createAlbumDropdown(album) {
    const dropdownMarkup = `
        <div uk-dropdown='delay-hide: 0;' id='drop_${album._id}'>
            <ul class='uk-nav uk-dropdown-nav'>
                <li>${album.name}</li>
                <li>${album.comment}</li>
                <li class="uk-nav-divider"></li>
                <li><a>Открыть</a></li>
                <li><a href='#'>Добавить файл</a></li>
                <li><a href='#'>Изменить название</a></li>
                <li><a href='#'>Изменить комментарий</a></li>
                <li><a href='#'>Изменить дату удаления</a></li>
                <li><a href='#'>${album.hide ? 'Показать' : 'Скрыть'}</a></li>
                <li><a href='#'>Удалить</a></li>
            </ul>
        </div>
    `
    return dropdownMarkup.replace(/\s{2,}/g, '');
}

function createChangeInput(changeType, changeKey) {
    let changeInput = null;
    switch (changeKey) {
        case 'name':
        case 'comment':
            changeInput = document.createElement('input');
            changeInput.setAttribute('type', 'text');
            break;
        case 'text':
            changeInput = document.createElement('textarea');
            changeInput.style.resize = 'none';
            break;
        case 'date':
            changeInput = document.createElement('input');
            changeInput.setAttribute('type', 'date');
            break;
    }
    return changeInput;
}

function checkChangeModal(changeType, changeKey) {
    let ok = null;
    if (changeType === 'text') {
        let limit = 0;
        switch (changeKey) {
            case 'name':
                limit = 64;
                break;
            case 'comment':
                limit = 256;
                break;
            case 'text':
                limit = 512;
                break;
        }
        ok =
    } else {

    }
}

function fillChangeObjectModal(changeType, changeKey, originalObject, baseUrl,
                               successFunction, successMessage, errorMessage) {
    let modal = document.getElementById('change-object-modal');
    let changeInput = createChangeInput(changeType, changeKey);
    modal.querySelector('div:nth-child(1) > div:nth-child(2)').appendChild(changeInput);
    if (changeType === 'date')
        changeInput.onchange = () => {
            checkChangeModal(changeType, changeKey);
        }
    else if (changeType === 'text')
        changeInput.onkeyup = () => {
            checkChangeModal(changeType, changeKey);
        }
    let prevValue = originalObject[changeKey];
    if (changeType == 'date')
        prevValue = formatDate(prevValue);
    changeDom.value = prevValue;
    let previousChangedDom = modal.querySelector('div:nth-child(1) > div:nth-child(2)').childNodes[3];
    if (typeof (previousChangedDom) != 'undefined' && previousChangedDom != null)
        modal.querySelector('div:nth-child(1) > div:nth-child(2)').removeChild(previousChangedDom);
    switch (changeKey) {
        case 'name':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Название';
            break;
        case 'text':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Содержимое';
            break;
        case 'comment':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Комментарий';
            break;
        case 'end':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Дата удаления';
            break;
    }
    modal.querySelector('#change-object-save-button').onclick = () => {
        let changed = changeDom.value;
        if (changeType === 'date')
            changed = new Date(changed).getTime();
        updateObject(baseUrl, originalObject._id, {
                [changeKey]: changed
            }, successFunction,
            successMessage, errorMessage);
        UIkit.modal(modal).hide();
    };
    UIkit.modal(modal).show();
}

function fillAlbumDropdown(album) {
    let drop = document.getElementById(`drop_${album._id}`);
    drop.onclick = () => {
        UIkit.dropdown(drop).hide();
    };
    drop.querySelector('.uk-nav>li:nth-child(4) > a:nth-child(1)').onclick = () => {
        showFiles(album._id);
    }
    drop.querySelector('.uk-nav>li:nth-child(5) > a:nth-child(1)').onclick = () => {
        let input = document.getElementById('file-upload');
        input.onchange = () => {
            uploadFiles(album._id);
        };
        input.click();
    };
    drop.querySelector('.uk-nav>li:nth-child(6) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'name', album, 'album', showAlbums, 'Название альбома изменена',
            'Ошибка во время изменения названия альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(7) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'comment', album, 'album', showAlbums, 'Комментарий альбома изменена',
            'Ошибка во время изменения комментария альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(8) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('date', 'end', album, 'album', showAlbums, 'Дата удаления альбома изменена',
            'Ошибка во время изменения даты удаления альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(9) > a:nth-child(1)').onclick = () => {
        updateObject(album._id, {hide: !album.hide}, 'album', showAlbums, 'Видимость альбома изменена',
            'Ошибка во время изменения видимости альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(10)>a:nth-child(1)').onclick = () => {
        removeObject('album/remove', album._id, `Альбом "${album.name}" успешно удален`,
            'Ошибка во время удаления альбома', showAlbums);
    };
}


document.addEventListener('DOMContentLoaded', () => {
    clearAllInputs();
    showAlbums();
})