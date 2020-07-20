document.addEventListener('DOMContentLoaded', () => {
    let a = new A();
    a.loadPageElements();
});


class A {
    loadPageElements() {
        this.showAlbums();
    }

    showAlbums() {
        this.getAlbumPromise()
            .then(albums => {
                if (albums.length == 0)
                    return
                let albumContainer = document.getElementById('mainField');
                albumContainer.setAttribute('uk-grid', '');
                albumContainer.classList.add('uk-child-width-1-5');
                albums.forEach(el => {
                    let albumDom = this.createAlbumDom(el);
                    albumContainer.appendChild(albumDom);
                    this.fillAlbumDropdown(el);
                });
            });
    }

    createAlbumDom(album) {
        let albumDom = document.createElement('div');
        albumDom.setAttribute('id', `album_${album._id}`);
        let albumCard = document.createElement('div');
        albumCard.setAttribute('class', 'uk-card uk-card-default uk-card-body');
        albumCard.textContent = album.name;
        albumDom.appendChild(albumCard);
        let albumDropdown = this.createAlbumDropdown(album);
        albumDom.innerHTML += albumDropdown;
        return albumDom;
    }

    fillAlbumDropdown(album) {
        let drop = document.getElementById(`drop_${album._id}`);
        console.log(drop)
        drop.childNodes[7].onclick = () => {
            let url = new URL(window.location.href + 'remove'),
                params = { id: album._id }
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
            fetch(url, {
                    method: 'DELETE'
                })
                .then(res => {
                    console.log(res);
                    this.showAlbums();
                })
                .catch(er => console.error(er));
        }
    }

    createAlbumDropdown(album) {
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
        let parser = new DOMParser();
        return parser.parseFromString(dropdownMarkup, 'text/html');
    }

    async getAlbumPromise() {
        try {
            let res = await fetch('/album');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }
}