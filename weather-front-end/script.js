const lat = document.getElementById('lat');
const long = document.getElementById('long');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const message = document.getElementById('message');
const comment = document.getElementById('comment');
const commentsList = document.getElementById('comments-list');
const serverUrl = "http://localhost:3000";

// When the page finishes loading, run the loadDOM function
document.addEventListener('DOMContentLoaded', loadDOM());

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${serverUrl}/api/login`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Server-side error");
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem("authToken", data.token);

        document.getElementById("login-message").textContent = "Login successful!";
        document.getElementById("login-section").style.display = "none";
        document.getElementById("comment-section").style.display = "block";

        // Fetch and display comments
        displayComment();
    })
    .catch(error => {
        console.log("Error:", error);
        document.getElementById("login-message").textContent = "login failed!";
    });
}

// Function to start the process of fetching weather data
function getForecast() {
    getLocation(); // First, get the user's location
}

// Function to get the user's location using the Geolocation API
function getLocation() {
    if (navigator.geolocation) {
        // If geolocation is supported, get the current position and pass it to showLocationData
        navigator.geolocation.getCurrentPosition(showLocationData);
    } else {
        alert('Geolocation is not supported by this browser.');
        message.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// Function to handle the position data returned by the geolocation API
function showLocationData(position) {
    const latitude = position.coords.latitude.toFixed(5);
    const longitude = position.coords.longitude.toFixed(5);

    lat.innerHTML = `Lat: ${latitude}`;
    long.innerHTML = `Long: ${longitude}`;

    getCurrentTemperature(latitude, longitude);
}

// Function to fetch weather data from the OpenWeather API using latitude and longitude
function getCurrentTemperature(latitude, longitude) {
    fetch(`${serverUrl}/api/weather?lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data.main) {
                temperature.innerHTML = `Temperature: ${((data.main.temp) - 273.15).toFixed(2)}°C`;
                description.innerHTML = `Description: ${data.weather[0].description}`;
            } else {
                temperature.innerHTML = "Unable to retrieve the temperature data";
                description.innerHTML = "";
            }
        })
        .catch(error => {
            console.log('Error fetching the weather data: ', error);
            temperature.innerHTML = "Error fetching temperature";
        });
}

// Function to add a new comment
function addComment() {
    const commentValue = comment.value;
    



    saveCommentsToLocalStorage(commentValue);
    displayComment(); // Display the updated list of comments

    comment.value = ''; // Clear the input field after submission
}

// Function to get the list of comments from local storage
function getDataFromLS() {
    let comments = [];

    if (localStorage.getItem('comments') === null) {
        comments = [];
    } else {
        comments = JSON.parse(localStorage.getItem('comments'));
    }

    return comments;
}

// Function to save comments to local storage
function saveCommentsToLocalStorage(theComment) {
    let comments = getDataFromLS();

    if (theComment.trim() !== '') {
        comments.push({ text: theComment, date: new Date() });
        localStorage.setItem('comments', JSON.stringify(comments));
    } else {
        alert('Please enter your comment before submitting');
    }
}

// Function to display comments in the comments list element
function displayComment() {
    const token = localStorage.getItem("authToken");

    fetch(`${serverUrl}/api/comments`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch comments");
        }
        return response.json();
    })
    .then(data => {
        commentsList.innerHTML = '';

        data.comments.forEach(comment => {
            const li = document.createElement('li');
            li.textContent = `${new Date(comment.date).toLocaleString()}: ${comment.comment}`;
            li.classList.add('li');
            commentsList.appendChild(li);
        });
    })
    .catch(error => {
        console.log("Error fetching comments:", error);
        document.getElementById("login-message").textContent = "Error fetching comments!";
    });
}

// Function to load comments when the page is loaded
function loadDOM() {
    const token = localStorage.getItem("authToken");

    if (token) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("comment-section").style.display = "block";
        displayComment(); // Display comments from API
    } else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("comment-section").style.display = "none";
    }
}
