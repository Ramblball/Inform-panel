'use strict'


function loadPageElements() {
    clearAllInputs();
    showAlbums();
}

function clearAllInputs() {
    document.querySelectorAll('input').forEach(el => {
        el.value = '';
    });
    document.querySelectorAll('textarea').forEach(el => {
        el.value = '';
    });
}

function checkTextInput(el, limit, btn) {
    let inputVal = el.value;
    if (!(inputVal.length > 0 && inputVal.length <= limit)) {
        disableButton(btn);
    } else
        enableButton(btn);
}

function checkDateInput(e, btn) {
    let inputVal = new Date(e.value).getTime();
    let now = Date.now();
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
            if (res.ok) {
                showAlert('uk-alert-primary', 'Альбом создан успешно');
                showAlbums();
            } else {
                showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
            }
        })
        .catch(er => {
            showAlert('uk-alert-danger', 'Ошибка во время создания альбома');
            console.error(er);
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
            if (albums.length == 0)
                return
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
    albumCard.setAttribute('class', 'uk-card uk-card-body');
    if (album.hide)
        albumCard.classList.add('uk-card-secondary');
    else
        albumCard.classList.add('uk-card-default');
    albumCard.textContent = album.name;
    albumDom.appendChild(albumCard);
    let albumDropdown = createAlbumDropdown(album);
    albumDom.innerHTML += (albumDropdown);
    return albumDom;
}

function fillAlbumDropdown(album) {
    let drop = document.getElementById(`drop_${album._id}`);
    drop.onclick = () => {
        UIkit.dropdown(drop).hide();
    };
    drop.querySelector('.uk-nav>li:nth-child(5) > a:nth-child(1)').onclick = () => {
        fillChangingModal('album', 'text', 'name', album, showAlbums, 'Название альбома изменена',
            'Ошибка во время изменения названия альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(6) > a:nth-child(1)').onclick = () => {
        fillChangingModal('album', 'text', 'comment', album, showAlbums, 'Комментарий альбома изменена',
            'Ошибка во время изменения комментария альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(7) > a:nth-child(1)').onclick = () => {
        fillChangingModal('album', 'date', 'end', album, showAlbums, 'Дата удаления альбома изменена',
            'Ошибка во время изменения даты удаления альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(8) > a:nth-child(1)').onclick = () => {
        updateObject('album', album._id, { hide: !album.hide }, showAlbums, 'Видимость альбома изменена',
            'Ошибка во время изменения видимости альбома');
    };
    drop.querySelector('.uk-nav>li:nth-child(9)>a:nth-child(1)').onclick = () => {
        removeObject('album', album._id, showAlbums, `Альбом "${album.name}" успешно удален`,
            'Ошибка во время удаления альбома');
    };
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
function fillChangeObjectModal()


// TODO: Отрефакторить эту штуку
function fillChagingModal(baseUrl, inputType, changeKey, originalObj, successFunc,
    successMsg, errorMsg) {
    let modal = document.getElementById('changeObjModal');

    modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').setAttribute('type', inputType);
    if (inputType == 'date')
        modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').value = formatDate(originalObj[changeKey]);
    else if (inputType = 'text')
        modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').value = originalObj[changeKey];
    switch (changeKey) {
        case 'name':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Название';
            modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').onkeyup = (e) => {
                checkTextInput(e.target, 200, 'saveObjChanges');
            };
            break;
        case 'text':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Содержимое';
            modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').onkeyup = (e) => {
                checkTextInput(e.target, 200, 'saveObjChanges');
            };
            break;
        case 'comment':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Комментарий';
            modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').onkeyup = (e) => {
                checkTextInput(e.target, 300, 'saveObjChanges');
            };
            break;

        case 'end':
            modal.querySelector('div:nth-child(1) > div:nth-child(2) >  span:nth-child(1)').textContent = 'Дата удаления';
            modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').onkeyup = (e) => {
                checkDateInput(e.target, 'saveObjChanges');
            };
            break;
    }
    modal.querySelector('#saveObjChanges').onclick = () => {
        let changed = null;
        switch (inputType) {
            case 'text':
                changed = modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').value;
                break;
            case 'date':
                changed = new Date(modal.querySelector('div:nth-child(1) > div:nth-child(2) > input:nth-child(2)').value).getTime();
                break;
            default:
                break;
        }
        updateObject(baseUrl, originalObj._id, {
                [changeKey]: changed
            }, successFunc,
            successMsg, errorMsg);
        UIkit.modal(modal).hide();
    };
    UIkit.modal(modal).show();
}

function updateObject(baseUrl, objId, data, successFunc, successMsg, errorMsg) {
    let url = new URL(`${baseUrl}/update`, window.location.href)
    let params = { id: objId }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (!(res.ok))
                showAlert('uk-alert-danger', errorMsg);
            else {
                showAlert('uk-alert-primary', successMsg);
                successFunc();
            }
        })
        .catch(er => {
            showAlert('uk-alert-danger', errorMsg);
            console.error(er);
        });
}

function removeObject(baseUrl, objId, successFunc, successMsg, errorMsg) {
    let url = new URL(`${baseUrl}/remove`, window.location.href)
    let params = { id: objId }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url, {
            method: 'DELETE'
        })
        .then(res => {
            if (!(res.ok))
                showAlert('uk-alert-danger', errorMsg);
            else {
                showAlert('uk-alert-primary', successMsg);
                successFunc();
            }
        })
        .catch(er => {
            showAlert('uk-alert-danger', errorMsg);
            console.error(er)
        });
}

function showAlert(style, message) {
    let wrapper = document.createElement('id');
    document.getElementById('alert-wrapper')
    wrapper.setAttribute('id', 'alert-wrapper');
    wrapper.style.position = 'absolute';
    wrapper.style.zIndex = 1;
    wrapper.style.top = '30px';
    wrapper.style.width = '100%';
    let alertDiv = document.createElement('div');
    alertDiv.setAttribute('uk-alert', '');
    alertDiv.setAttribute('class', style + ' uk-align-center');
    let par = document.createElement('p');
    par.textContent = message;
    alertDiv.appendChild(par);
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

function createAlbumDropdown(album) {
    const dropdownMarkup = `
        <div uk-dropdown id='drop_${album._id}'>
            <ul class='uk-nav uk-dropdown-nav'>
                <li>${album.name}</li>
                <li>${album.comment}</li>
                <li class="uk-nav-divider"></li>
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

async function getAlbumPromise() {
    try {
        let res = await fetch('/album');
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function createNewText() {
    let textContent = document.getElementById('newTextContent').value;
    let textDate = new Date(document.getElementById('newTextDate').value).getTime();
    fetch('text/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textContent, end: textDate })
        }).then(res => {
            if (res.ok) {
                showAlert('uk-alert-primary', 'Объявление создано успешно');
                showTexts();
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
            UIkit.modal(document.getElementById('createText')).hide();
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
        if (texts.length == 0)
            return
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
        <div uk-dropdown id='drop_${text._id}'>
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
    drop.querySelector('.uk-nav>li:nth-child(1) > a:nth-child(1)').onclick = () => {
        fillChangingModal('textarea', 'text', 'name', text, showTexts, 'Дата удаления объявления изменена',
            'Ошибка во время изменения даты удаления объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(2) > a:nth-child(1)').onclick = () => {
        fillChangingModal('text', 'date', 'end', text, showTexts, 'Дата удаления объявления изменена',
            'Ошибка во время изменения даты удаления объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(3) > a:nth-child(1)').onclick = () => {
        updateObject('text', text._id, { hide: !text.hide }, showTexts, 'Видимость объявления изменена',
            'Ошибка во время изменения видимости объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(4)>a:nth-child(1)').onclick = () => {
        removeObject('text', text._id, showTexts, `Объявление успешно удален`,
            'Ошибка во время удаления объявления');
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadPageElements();
})