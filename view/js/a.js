function formatDate(date) {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    let year = d.getFullYear().toString();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}



function updateObject(baseUrl, objId, data, successFunc, successMsg, errorMsg) {
    let url = new URL(`${baseUrl}/update`, window.location.href)
    let params = {id: objId}
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
    let params = {id: objId}
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: textContent, end: textDate})
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
        fillChangeObjectModal('textarea', 'text', text, 'text', showTexts, 'Объявление изменено',
            'Ошибка во время изменения объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(2) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('date', 'end', text, 'text', showTexts, 'Дата удаления объявления изменена',
            'Ошибка во время изменения даты удаления объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(3) > a:nth-child(1)').onclick = () => {
        updateObject('text', text._id, {hide: !text.hide}, showTexts, 'Видимость объявления изменена',
            'Ошибка во время изменения видимости объявления');
    };
    drop.querySelector('.uk-nav>li:nth-child(4)>a:nth-child(1)').onclick = () => {
        removeObject('text', text._id, showTexts, `Объявление успешно удален`,
            'Ошибка во время удаления объявления');
    };
}

function uploadFiles(albumId) {
    let input = document.getElementById('file-upload');
    let files = input.files;
    let url = new URL(`file/upload`, window.location.href);
    let params = {id: albumId};
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append("files", file);
    });
    console.log(formData);
    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(res => console.log(res));
}

async function getFilesPromise(albumId) {
    let url = createUrlWithQuery('/file', {aid: albumId})
    try {
        let res = await fetch(url, {
            method: 'GET'
        });
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function createUrlWithQuery(baseUrl, queryObject) {
    let url = new URL(baseUrl, window.location.href);
    let params = queryObject;
    Object.keys(params).forEach(key => url.searchParams.append(key, queryObject[key]));
    return url;
}

function showFiles(albumId) {
    getFilesPromise(albumId)
        .then(files => {
            let fileContainer = document.getElementById('mainField');
            fileContainer.innerHTML = '';
            if (files.length == 0) {
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
    let fileDom = document.createElement('div');
    fileDom.setAttribute('id', `file_${file._id}`);
    fileDom.setAttribute('class', 'uk-card uk-card-body');
    let fileContentDom = null;
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
    fileDom.appendChild(fileContentDom);
    fileDom.innerHTML += createFileDropdown(file);
    return fileDom;
}

function createFileDropdown(file) {
    const markup = `
        <div uk-dropdown='delay-hide: 100' id='drop_${file._id}'>
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
    let drop = document.getElementById(`file_${file._id}`);
    drop.onclick = () => {
        UIkit.dropdown(drop).hide();
    };
    drop.querySelector('.uk-nav>li:nth-child(1) > a:nth-child(1)').onclick = () => {
        console.log('Показываю')
    };
    drop.querySelector('.uk-nav>li:nth-child(2) > a:nth-child(1)').onclick = () => {
        fillChangeObjectModal('text', 'comment', file, 'file', () => showFiles(albumId), 'Комментарий файла изменена',
            'Ошибка во время изменения комментария файла');
    };
    drop.querySelector('.uk-nav>li:nth-child(3) > a:nth-child(1)').onclick = () => {
        updateObject(file._id, {hide: !file.hide}, 'file', () => showFiles(albumId), 'Видимость файла изменена',
            'Ошибка во время изменения видимости файла');
    };
    drop.querySelector('.uk-nav>li:nth-child(4)>a:nth-child(1)').onclick = () => {
        removeObject('file', file._id, () => showFiles(albumId), 'Файл успешно удален',
            'Ошибка во время удаления файла');
    };
}

document.addEventListener('DOMContentLoaded', () => {
    loadPageElements();
});