document.addEventListener('DOMContentLoaded', () => {
    let control = new Control();
    control.setUp();
})


class Control {
    constructor() {}

    setUp() {
        this.setUpButtons();
        this.setAlbums();
    }

    setUpButtons() {
        document.getElementById('logOutBtn').onclick = () => {
            fetch('/logout')
                .then(res => console.log(res))
                .catch(er => console.log(er));
        }
    }

    setAlbums() {
        let albumsPromise = this.getAlbumsPromise();
        albumsPromise.then(albums => {
            if (albums.length == 0)
                return
            let albumContainer = document.createElement('div');
            document.body.appendChild(albumContainer);
            albumContainer.setAttribute('uk-grid', '');
            albumContainer.setAttribute('class', 'uk-grid-column-small uk-child-width-1-6@s uk-text-center');
            albums.forEach(el => {
                let albumDom = this.createAlbumDom(el);
                albumContainer.appendChild(albumDom);
                this.createAlbumDropdown(el);
            });
        });
    }

    createAlbumDom(album) {
        let albumDom = document.createElement('div');
        albumDom.setAttribute('class', '');
        albumDom.setAttribute('id', `album_${album._id}`);
        let albumCard = document.createElement('div');
        albumCard.setAttribute('class', 'uk-card uk-card-default uk-card-body');
        albumCard.textContent = album.name;
        albumDom.appendChild(albumCard);
        albumDom.oncontextmenu = (e) => {
            e.preventDefault();
            UIkit.dropdown(document.getElementById(`drop_${album._id}`)).show();
        }
        return albumDom;
    }

    createAlbumDropdown(album) {
        let dropDowndom = document.createElement('div');
        dropDowndom.setAttribute('id', `drop_${album._id}`);
        let anchorTexts = [
            album.name,
            album.comment,
            'Добавить файл',
            'Изменить комментарий',
            'Изменить дату удаления',
            album.hide ? 'Показать' : 'Скрыть',
            'Удалить'
        ]
        for (let i = 0; i < 7; i++) {
            let albumDropLi = document.createElement('li');
            let albumDropAnchor = document.createElement('a');
            albumDropAnchor.textContent = anchorTexts[i];
            albumDropLi.appendChild(albumDropAnchor);
            dropDowndom.appendChild(albumDropLi);
        }
        document.getElementById(`album_${album._id}`).appendChild(dropDowndom);
        console.log(document.getElementById(`drop_${album._id}`))
        UIkit.dropdown(dropDowndom, {
            'pos': 'bottom-justify',
            'boundary': '.boundary-align',
            'boundary-align': true,
            'delay-hide': 100
        });
    }

    async getAlbumsPromise() {
        try {
            const res = await fetch('/album');
            if (!(res.ok))
                throw new Error(res);
            return await res.json();
        } catch (er) {
            return console.error(er);
        }
    }
}