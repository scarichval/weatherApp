const lat = document.getElementById('lat');
const long = document.getElementById('long');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const message = document.getElementById('message');
const comment = document.getElementById('comment');
const commentsList = document.getElementById('comments-list');
const apiKey = '7c26090466da8d2c994c88106a7f9ad9';


document.addEventListener('DOMContentLoaded', loadDOM());

function getForecast() {
    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocationData);
    } else {
        alert('Geolocation is not supported by this browser.');
        message.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showLocationData(position) {
    latitude = position.coords.latitude.toFixed(5);
    longitude = position.coords.longitude.toFixed(5);

    lat.innerHTML = `Lat: ${latitude}`;
    long.innerHTML = `Long: ${longitude}`;

    getCurrentTemperature(latitude, longitude);
}

function getCurrentTemperature(latitude, longitude) {
    // const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('weather data: ', data);
            temperature.innerHTML = `Temperature: ${((data.main.temp) - 273.15).toFixed(2)}°C`;
            description.innerHTML = `Description: ${data.weather[0].description}`;
        })
        .catch(error => {
            console.log('Error fectching the weather data: ', error);
        });
}

function addComment() {
    const commentValue = comment.value;
    saveCommentsToLocalStorage(commentValue);
    ShowComment();

    comment.value = '';
}

function getDataFromLS() {
    let comments = [];

    if (localStorage.getItem('comments') === null) {
        comments = [];
    } else {
        comments = JSON.parse(localStorage.getItem('comments'));
    }

    return comments;
}

function saveCommentsToLocalStorage(theComment) {
    let comments = getDataFromLS();

    if (theComment.trim() !== '') {
        comments.push({ text: theComment, date: new Date() });
        // comments.push(theComment);
        localStorage.setItem('comments', JSON.stringify(comments));
    } else {
        alert('Please enter your comment before submitting');
    }
}

function ShowComment() {
    const comments = getDataFromLS();
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = comment.date + ": " + comment.text;
        li.classList.add('li');
        commentsList.appendChild(li);
    })
}

function loadDOM() {
    ShowComment();
}
