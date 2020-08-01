"use strict"

const slideShowTime = 8000;
const animationSettings = "scroll 1 linear";
const marqueeSpeed = 175;
const eventInterval = 8000;
var eventJson = new Array();
var marquee = document.querySelector(".marquee");
var slideShow = null;
var albumsList = new Array();
var filesList = new Array();
var announcementList = new Array();
var albumCounter = 0;
var fileCounter = 0;
var announcmentCounter = 0;

getAlbums();
setDay();
getHolidays();
getTexts();
setTimeout(function () {
    slideShow = setInterval(showImages, slideShowTime);
}, 200);

async function getAlbumsPromise() {
    try {
        let res = await fetch('/album');
        return await res.json();
    } catch (e) {
        throw e;
    }
}

function showImages() {
    if (albumsList[albumCounter].length == 0)
        checkAlbumPosition();
    if (filesList[fileCounter].status)
        showVideo();
    else {
        placeComment();
        document.getElementById("img").setAttribute("src", `/static/${filesList[fileCounter].filename}`);
        fileCounter++;
    }
    checkAlbumPosition();
}

function placeComment() {
    if (filesList[fileCounter].comment != " ")
        document.getElementById("comment").textContent = filesList[fileCounter].comment;
    else if (albumsList[albumCounter].comment != " ")
        document.getElementById("comment").textContent = albumsList[albumCounter].comment;
    else
        document.getElementById("comment").textContent = albumsList[albumCounter].name;

}

function showVideo() {
    swapImgVid("none", "block");
    clearInterval(slideShow);
    placeComment();
    document.getElementById("img").setAttribute("src", '');
    document.getElementById("vid").setAttribute("src", `/static/${filesList[fileCounter].filename}`);
}

function continueSlideShow() {
    fileCounter++;
    document.getElementById("vid").setAttribute("src", "");
    swapImgVid("block", "none");
    slideShow = setInterval(showImages, slideShowTime);
}

function swapImgVid(imgStl, vidStl) {
    document.getElementById("img").style.display = imgStl;
    document.getElementById("vid").style.display = vidStl;
}

function getTexts() {
    marquee.style.animation = "none";
    axios.get("/slide/text")
        .then(res => {
            announcementList = res.data;
            marquee.textContent = announcementList[announcmentCounter].text;
            marquee.style.animation = animationSettings + " " + calculateSpeed(marqueeSpeed);
        })
        .catch(er => {
            console.error(er);
        });
}

function changeAnnouncment() {
    announcmentCounter++;
    if (announcmentCounter == announcementList.length) {
        getTexts();
        announcmentCounter = 0;
    }
    marquee.style.animation = "none";
    marquee.textContent = announcementList[announcmentCounter].text;
    marquee.style.animation = animationSettings + " " + calculateSpeed(marqueeSpeed);
}

function calculateSpeed(speed) {
    return parseInt(marquee.offsetWidth / speed + 1) + 's';
}

function setDay() {
    let date = new Date();
    let rusMonths = [
        "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    document.getElementById("day").textContent = date.getDate() + ' ' + rusMonths[date.getMonth()].toUpperCase();
}

function displayHolidays() {
    let eventCounter = 0;
    document.getElementById("holyday").textContent = parseEvent(eventJson, eventCounter);
    eventCounter++;
    setInterval(() => {
        if (eventJson[eventCounter][0] == "") {
            eventCounter++;
        }
        if (eventCounter == eventJson.length) {
            eventCounter = 0;
        }
        document.getElementById("holyday").textContent = parseEvent(eventJson, eventCounter);
        eventCounter++;
    }, eventInterval);
}

function parseEvent(eventToday, eventCounter) {
    if (eventToday[eventCounter][1] == "") {
        return eventToday[eventCounter][0];
    } else {
        return `Сегодня день рождение отмечает: ${eventToday[eventCounter][0]} из ${eventToday[eventCounter][1]} класса`;
    }
}

function getHolidays() {
    axios.get("/slide/eventofday")
        .then((res) => {
            eventJson = res.data;
            displayHolidays();
        })
        .catch((er) => {
            console.error(er);
        });
}

function checkAlbumPosition() {
    if (fileCounter == filesList.length) {
        fileCounter = 0;
        albumCounter++;
        if (albumCounter == albumsList.length)
            albumCounter = 0;
        getAlbums();
    }
}

function sortTwoFiles(fileOne, fileTwo) {
    const posA = fileOne.position;
    const posB = fileTwo.position;
    let comparison = 0;
    if (posA >= posB) {
        comparison = 1;
    } else if (posA < posB) {
        comparison = -1;
    }
    return comparison;
}

document.addEventListener('DOMContentLoaded', () => {
    startShow();
})