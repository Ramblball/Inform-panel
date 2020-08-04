'use strict'

class RecursiveTimer {
    constructor(fn, countdown) {
        this.fn = fn;
        this.countdown = countdown;
        this.time = null;
    }

    start() {
        let _this = this;
        _this.fn();
        _this.time = setInterval(_this.fn, _this.countdown);
    }

    stop() {
        let _this = this;
        clearTimeout(_this.time);
        _this.time = null;
    }
}

class AlbumSlideShow {
    constructor() {
        this.albumCounter = 0;
        this.fileCounter = 0;
        let _this = this;
        this.albumTimer = new RecursiveTimer(() => {
            _this.showAlbum(); }, 2000);
        this.albums = [];
        this.currentFileList = [];
    }

    async getAlbumsPromise() {
        try {
            let res = await fetch('panel/album');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }

    startShow() {
        this.getAlbumsPromise()
            .then(albums => {
                this.albums = albums;
                this.currentFileList = this.albums[this.albumCounter].file;
                this.albumTimer.start();
            });
    }

    showAlbum() {
        this.checkCounters();
        if (!this.currentFileList[this.fileCounter].type)
            this.showVideo();
        else {
            document.getElementById('img').setAttribute('src',
                `/static/${this.currentFileList[this.fileCounter].name}`);
            this.fileCounter++;
        }
    }

    checkCounters() {
        if (this.fileCounter === this.currentFileList.length) {
            this.fileCounter = 0;
            this.albumCounter++;
            if (this.albumCounter === this.albums.length) {
                this.albumCounter = 0;
                this.albumTimer.stop();
                this.startShow();
            } else
                this.currentFileList = this.albums[this.albumCounter].file;
        }
    }

    showVideo() {
        this.albumTimer.stop();
        this.swapImgVid('none', 'block');
        document.getElementById('img').setAttribute('src', '');
        document.getElementById('vid').setAttribute('src',
            `/static/${this.currentFileList[this.fileCounter].name}`);
    }

    continueSlideShow() {
        this.fileCounter++;
        document.getElementById('vid').setAttribute('src', '');
        this.swapImgVid('block', 'none');
        this.albumTimer.start();
    }

    swapImgVid(imgStl, vidStl) {
        document.getElementById("img").style.display = imgStl;
        document.getElementById("vid").style.display = vidStl;
    }
}

class TextMaquee {

    constructor() {
        this.marquee = document.querySelector('.marquee');
        this.marqueeStyle = 'scroll 1 linear';
        this.marqueeSpeed = 175;
        this.texts = [];
        this.textCounter = 0;
    }


    async getTextsPromise() {
        try {
            let res = await fetch('panel/text');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }

    startShow() {
        this.getTextsPromise()
            .then(texts => {
                console.log(texts);
                this.texts = texts;
                this.changeText();
            })
    }

    changeText() {
        if (this.textCounter == this.texts.length) {
            this.textCounter = 0;
            this.startShow();
            return;
        }
        console.log(this.marquee)
        this.marquee.style.animation = "none";
        this.marquee.textContent = this.texts[this.textCounter].text;
        this.marquee.style.animation = `${this.marqueeStyle} ${this.calculateSpeed(this.marqueeSpeed)}s`;
        this.textCounter++;
    }
    
    calculateSpeed(speed) {
        return parseInt(this.marquee.offsetWidth / speed + 1);
    }
}

let albumSlide = new AlbumSlideShow();
let textMarquee = new TextMaquee();

document.addEventListener('DOMContentLoaded', () => {
    albumSlide.startShow();
    textMarquee.startShow();
})