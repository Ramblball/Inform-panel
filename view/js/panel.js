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
        // _this.time = setInterval(_this.fn, _this.countdown);
        _this.time = setTimeout(function tick() {
            _this.fn();
            _this.time = setTimeout(tick, _this.countdown)
        }, _this.countdown);
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
        this.placeComment();
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

    placeComment() {
        if (this.currentFileList[this.fileCounter].comment !== " ")
            document.getElementById("comment").textContent = this.currentFileList[this.fileCounter].comment;
        else if (this.albums[this.albumCounter].comment !== " ")
            document.getElementById("comment").textContent = this.albums[this.albumCounter].comment;
        else
            document.getElementById("comment").textContent = this.albums[this.albumCounter].name;
    
    }
}

class TextMarquee {

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
        if (this.textCounter === this.texts.length) {
            this.textCounter = 0;
            this.startShow();
            return;
        }
        this.marquee.style.animation = "none";
        this.marquee.textContent = this.texts[this.textCounter].text;
        this.marquee.style.animation = `${this.marqueeStyle} ${this.calculateSpeed(this.marqueeSpeed)}s`;
        this.textCounter++;
    }
    
    calculateSpeed(speed) {
        return Math.ceil(this.marquee.offsetWidth / speed);
    }
}

class Events {
    constructor() {
        this.eventCounter = 0;
        this.events = [];
        this.eventTimer = new RecursiveTimer(() => this.displayEvents(), 8000);
    }

    startShow() {
        this.setDay();
        // this.getEventsPromise()
        //     .then(events => {
        //         this.events = events;
        //         this.eventTimer.start();
        //     });
    }

    displayEvents() {
        let event = this.events[this.eventCounter++];
        document.getElementById("event").textContent = this.parseEvent(event);
    }

    async getEventsPromise() {
        try {
            let res = await fetch('panel/event');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }

    parseEvent(event) {
        return event[1] === '' ? event[0]
            : `Сегодня день рождение отмечает: ${event[0]} из ${event[1]} класса`;
    }

    setDay() {
        let date = new Date();
        let rusMonths = [
            "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
        document.getElementById("day").textContent = date.getDate() + ' ' + rusMonths[date.getMonth()].toUpperCase();
    }
}

let albumSlide = new AlbumSlideShow();
let textMarquee = new TextMarquee();
let eventShow = new Events();

document.addEventListener('DOMContentLoaded', () => {
    albumSlide.startShow();
    textMarquee.startShow();
    eventShow.startShow();
})