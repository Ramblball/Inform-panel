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

function formatDate(date) {
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
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

function removeObject(baseUrl, params, okMsg, erMsg, finallyFunc) {
    let url = createQueryUrl(baseUrl, params);
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

function checkTextInput(id, limit) {
    let inputDom = document.getElementById(id);
    return inputDom.value.length <= limit && inputDom.value.length !== 0;
}

function checkDateInput(id) {
    let inputVal = new Date(document.getElementById(id).value).getTime();
    let now = Date.now();
    return inputVal > now;
}

function checkAlbumCreationModal() {
    let nameInputStatus = checkTextInput('new-album-name', 64);
    let commentInputStatus = checkTextInput('new-album-comment', 256);
    let dateInputStatus = checkDateInput('new-album-end');
    let createButton = document.getElementById('create-album-button');
    if (!(nameInputStatus && commentInputStatus && dateInputStatus)) {
        createButton.removeAttribute('enabled');
        createButton.setAttribute('disabled', '');
    } else {
        createButton.removeAttribute('disabled');
        createButton.setAttribute('enabled', '');
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
    let albumName = document.getElementById('new-album-name').value;
    let albumComment = document.getElementById('new-album-comment').value;
    let albumDate = new Date(document.getElementById('new-album-end').value).getTime();
    fetch('/album/create', {
        method: 'POST',
        body: JSON.stringify({name: albumName, comment: albumComment, end: albumDate}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (res.ok)
                showAlert('uk-alert-primary', 'Альбом создан успешно');
            else {
                console.log(res);
                showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
            }
        })
        .catch(er => {
            console.error(er);
            showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
        })
        .finally(res => {
            clearAllInputs();
            UIkit.modal(document.getElementById('create-album')).hide();
            showAlbums();
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

function createChangeInput(changeType, changeKey, prevValue) {
    let changeInput;
    switch (changeKey) {
        case 'name':
        case 'comment':
            changeInput = document.createElement('input');
            changeInput.setAttribute('type', 'text');
            break;
        case 'text':
            changeInput = document.createElement('textarea');
            changeInput.style.resize = 'none';
            changeInput.setAttribute('rows', 5)
            break;
        case 'end':
            changeInput = document.createElement('input');
            changeInput.setAttribute('type', 'date');
            break;
    }
    if (changeKey === 'text')
        changeInput.setAttribute('class', 'uk-textarea')
    else
        changeInput.setAttribute('class', 'uk-input')
    if (changeType === 'date')
        changeInput.onchange = () => {
            checkChangeModal(changeType, changeKey);
        }
    else if (changeType === 'text')
        changeInput.onkeyup = () => {
            checkChangeModal(changeType, changeKey);
        }
    if (changeType === 'date')
        prevValue = formatDate(prevValue);
    changeInput.value = prevValue;
    changeInput.setAttribute('id', 'change-object-input');
    return changeInput;
}

function checkChangeModal(changeType, changeKey) {
    let ok;
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
        ok = checkTextInput('change-object-input', limit);
    } else
        ok = checkDateInput('change-object-input');
    let changeButton = document.getElementById('change-object-save-button');
    if (!ok) {
        changeButton.setAttribute('disabled', '');
        changeButton.removeAttribute('enabled');
    } else {
        changeButton.removeAttribute('disabled');
        changeButton.setAttribute('enabled', '');
    }
}

function fillChangeObjectModal(changeType, changeKey, prevValue, baseUrl, okMsg, erMsg, finallyFunc, params) {
    let modal = document.getElementById('change-object-modal');
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
    modal.querySelector('div:nth-child(1) > div:nth-child(2)').appendChild(createChangeInput(changeType,
        changeKey, prevValue));
    document.getElementById('change-object-save-button').onclick = () => {
        let changed = modal.querySelector('div:nth-child(1) > div:nth-child(2)').childNodes[3].value;
        if (changeType === 'date')
            changed = new Date(changed).getTime();
        updateObject(baseUrl, {
            [changeKey]: changed
        }, okMsg, erMsg, finallyFunc, params);
        UIkit.modal(modal).hide();
    };
    UIkit.modal(modal).show();
}

function updateObject(baseUrl, data, okMsg, erMsg, finallyFunc, params) {
    let url = `/${baseUrl}/update`;
    url = createQueryUrl(url, params);
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!(res.ok))
                showAlert('uk-alert-danger', erMsg);
            else
                showAlert('uk-alert-primary', okMsg);
        })
        .catch(er => {
            showAlert('uk-alert-danger', erMsg);
            console.error(er);
        })
        .finally(res => {
            finallyFunc();
        });
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
    let albumParams = {id: album._id};
    console.log(albumParams);
    drop.querySelector('.uk-nav>li:nth-child(6) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'name', album['name'], 'album', 'Название альбома изменена',
            'Ошибка во время изменения названия альбома', showAlbums, albumParams);
    };
    drop.querySelector('.uk-nav>li:nth-child(7) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'comment', album['comment'], 'album', 'Комментарий альбома изменена',
            'Ошибка во время изменения комментария альбома', showAlbums, albumParams);
    };
    drop.querySelector('.uk-nav>li:nth-child(8) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('date', 'end', album['end'], 'album', 'Дата удаления альбома изменена',
            'Ошибка во время изменения даты удаления альбома', showAlbums, albumParams);
    };
    drop.querySelector('.uk-nav>li:nth-child(9) > a:nth-child(1)').onclick = () => {
        updateObject('album', {hide: !album.hide}, 'Видимость альбома изменена',
            'Ошибка во время изменения видимости альбома', showAlbums, albumParams);
    };
    drop.querySelector('.uk-nav>li:nth-child(10)>a:nth-child(1)').onclick = () => {
        removeObject('album/remove', albumParams, `Альбом "${album.name}" успешно удален`,
            'Ошибка во время удаления альбома', showAlbums);
    };
}

function uploadFiles(albumId) {
    let input = document.getElementById('file-upload');
    let files = input.files;
    let url = createQueryUrl(`file/upload`, {id: albumId})
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append("files", file);
    });
    console.log(formData);
    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(res => console.log(res))
        .finally(res => {
            showFiles(albumId);
        });
}

async function getFilesPromise(albumId) {
    let url = createQueryUrl('/file', {aid: albumId})
    try {
        let res = await fetch(url, {
            method: 'GET'
        });
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function showFiles(albumId) {
    getFilesPromise(albumId)
        .then(files => {
            let fileContainer = document.getElementById('mainField');
            fileContainer.innerHTML = '';
            if (files.length === 0) {
                showAlbums();
                return;
            }
            fileContainer.setAttribute('uk-grid', '');
            fileContainer.classList.add('uk-child-width-1-5');
            files.forEach(file => {
                let fileDom = createFileDom(file);
                fileContainer.appendChild(fileDom);
                fillFileDropdown(file, albumId);
            });
        });
}

function createFileDom(file) {
    console.log(file)
    let fileDom = document.createElement('div');
    fileDom.setAttribute('id', `file_${file._id}`);
    fileDom.setAttribute('class', 'uk-card uk-card-body');
    let fileContentDom;
    if (file.type) {
        fileContentDom = document.createElement('img');
        fileContentDom.setAttribute('uk-img', '');
    } else {
        fileContentDom = document.createElement('video');
        fileContentDom.setAttribute('uk-video', 'autoplay: false');
        fileContentDom.setAttribute('controls', '');
        fileContentDom.setAttribute('playsinline', '');
    }
    fileContentDom.setAttribute('src', `/static/${file.name}`);
    if (file.hide)
        fileContentDom.setAttribute('class', 'file-hidden')
    fileDom.appendChild(fileContentDom);
    fileDom.innerHTML += createFileDropdown(file);
    return fileDom;
}

function createFileDropdown(file) {
    const markup = `
        <div uk-dropdown='delay-hide: 0' id='drop_${file._id}'>
            <ul class='uk-nav uk-dropdown-nav'>
                <li><a href='#'>Открыть</a></li>
                <li><a href='#'>Изменить комментарий</a></li>
                <li><a href='#'>${file.hide ? 'Показать' : 'Скрыть'}</a></li>
                <li><a href='#'>Удалить</a></li>
            </ul>
        </div>
    `
    return markup.replace(/\s{2,}/g, '');
}

function fillFileDropdown(file, albumId) {
    let drop = document.getElementById(`drop_${file._id}`);
    drop.onclick = () => {
        UIkit.dropdown(drop).hide();
    };
    let params = {aid: albumId, fid: file._id}
    drop.querySelector('.uk-nav>li:nth-child(1) > a:nth-child(1)').onclick = () => {
        let showAnchor = document.getElementById('open-lightbox-anchor');
        showAnchor.setAttribute('href', 'static/' + file.name);
        showAnchor.click();
    };
    drop.querySelector('.uk-nav>li:nth-child(2) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'comment',
            file['comment'] === undefined ? '' : file['comment'], 'file', 'Комментарий файла изменена',
            'Ошибка во время изменения комментария файла', () => showFiles(albumId), params);
    };
    drop.querySelector('.uk-nav>li:nth-child(3) > a:nth-child(1)').onclick = () => {
        updateObject('file', {hide: !file.hide}, 'Видимость файла изменена',
            'Ошибка во время изменения видимости файла', () => showFiles(albumId), params);
    };
    drop.querySelector('.uk-nav>li:nth-child(4)>a:nth-child(1)').onclick = () => {
        removeObject('file/remove', params, 'Файл успешно удален',
            'Ошибка во время удаления файла', () => showFiles(albumId));
    };
}

function checkTextCreationModel() {
    let textContentInputStatus = checkTextInput('new-text-content', 512);
    let dateInputStatus = checkDateInput('new-text-end');
    let createButton = document.getElementById('create-text-button');
    if (!(textContentInputStatus && dateInputStatus)) {
        createButton.removeAttribute('enabled');
        createButton.setAttribute('disabled', '');
    } else {
        createButton.removeAttribute('disabled');
        createButton.setAttribute('enabled', '');
    }
}

function createNewText() {
    let textContent = document.getElementById('new-text-content').value;
    let textDate = new Date(document.getElementById('new-text-end').value).getTime();
    fetch('text/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: textContent, end: textDate})
    }).then(res => {
        if (res.ok) {
            showAlert('uk-alert-primary', 'Объявление создано успешно');
        } else {
            showAlert('uk-alert-danger', 'Ошибка во время создания объявления');
        }
    })
        .catch(er => {
            showAlert('uk-alert-danger', 'Ошибка во время создания объявления');
            console.error(er);
        })
        .finally(() => {
            clearAllInputs();
            showTexts();
            UIkit.modal(document.getElementById('create-text')).hide();
        })

}

async function getTextsPromise() {
    try {
        const res = await fetch('/text');
        return await res.json();
    } catch (er) {
        return console.log(error);
    }
}

function showTexts() {
    getTextsPromise().then(texts => {
        let textContainer = document.getElementById('mainField');
        textContainer.innerHTML = '';
        if (texts.length === 0) {
            showAlbums();
            return
        }
        texts.forEach(el => {
            let textDom = createTextDom(el);
            textContainer.appendChild(textDom);
            fillTextDropdown(el);
        })
    });
}

function createTextDom(text) {
    let textDom = document.createElement('div');
    textDom.setAttribute('id', `text_${text._id}`);
    textDom.setAttribute('class', 'uk-align-center')
    let textCard = document.createElement('div');
    textCard.setAttribute('class', 'uk-card uk-card-body');
    if (text.hide)
        textCard.classList.add('uk-card-secondary');
    else
        textCard.classList.add('uk-card-default');
    textCard.textContent = text.text;
    textDom.appendChild(textCard);
    textDom.style.width = '80%';
    let textDropdown = createTextDropdown(text);
    textDom.innerHTML += textDropdown;
    return textDom;
}

function createTextDropdown(text) {
    const markup = `
        <div uk-dropdown='delay-hide: 0' id='drop_${text._id}'>
            <ul class='uk-nav uk-dropdown-nav'>
                <li><a href='#'>Изменить содержимое</a></li>
                <li><a href='#'>Изменить дату удаления</a></li>
                <li><a href='#'>${text.hide ? 'Показать' : 'Скрыть'}</a></li>
                <li><a href='#'>Удалить</a></li>
            </ul>
        </div>
    `
    return markup.replace(/\s{2,}/g, '');
}

function fillTextDropdown(text) {
    let drop = document.getElementById(`drop_${text._id}`);
    drop.onclick = () => {
        UIkit.dropdown(drop).hide();
    };
    let params = {id: text._id}
    drop.querySelector('.uk-nav>li:nth-child(1) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('textarea', 'text', text['text'], 'text',  'Объявление изменено',
            'Ошибка во время изменения объявления', showTexts, params);
    };
    drop.querySelector('.uk-nav>li:nth-child(2) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('date', 'end', text['end'], 'text', 'Дата удаления объявления изменена',
            'Ошибка во время изменения даты удаления объявления', showTexts, params);
    };
    drop.querySelector('.uk-nav>li:nth-child(3) > a:nth-child(1)').onclick = () => {
        updateObject('text', {hide: !text.hide},  'Видимость объявления изменена',
            'Ошибка во время изменения видимости объявления', showTexts, params);
    };
    drop.querySelector('.uk-nav>li:nth-child(4)>a:nth-child(1)').onclick = () => {
        removeObject('text/remove', params, `Объявление успешно удалено`,
            'Ошибка во время удаления объявления', showTexts);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    clearAllInputs();
    showAlbums();
})