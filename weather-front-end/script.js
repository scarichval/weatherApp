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
        // If geolocation is not supported, show an error message
        alert('Geolocation is not supported by this browser.');
        message.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// Function to handle the position data returned by the geolocation API
function showLocationData(position) {
    // Get latitude and longitude from the position object and round them to 5 decimal places
    const latitude = position.coords.latitude.toFixed(5);
    const longitude = position.coords.longitude.toFixed(5);

    // Display latitude and longitude in the HTML
    lat.innerHTML = `Lat: ${latitude}`;
    long.innerHTML = `Long: ${longitude}`;

    // Call function to fetch the current temperature using the coordinates
    getCurrentTemperature(latitude, longitude);
}

// Function to fetch weather data from the OpenWeather API using latitude and longitude
function getCurrentTemperature(latitude, longitude) {

    // Fetch weather data from the API
    fetch(`${serverUrl}/api/weather?lat=${latitude}&lon=${longitude}`)
        .then(response => response.json()) // Parse the JSON data from the response
        .then(data => {
            if (data.main) {
                // Display temperature (in Celsius) and description in the HTML
                console.log('weather data: ', data); // Log data for debugging
                temperature.innerHTML = `Temperature: ${((data.main.temp) - 273.15).toFixed(2)}°C`; // Convert from Kelvin to Celsius
                description.innerHTML = `Description: ${data.weather[0].description}`; // Display weather description

            } else {
                temperature.innerHTML = "Unable to retrieve the temperature data"
                description.innerHTML = "";
            }
        })
        .catch(error => {
            // Handle any errors in the fetch request
            console.log('Error fetching the weather data: ', error);
            temperature.innerHTML = "Error fetching temperature";
        });
}

// Function to add a new comment
function addComment() {
    const commentValue = comment.value; // Get the comment from the input field
    saveCommentsToLocalStorage(commentValue); // Save the comment to local storage
    ShowComment(); // Display the updated list of comments

    comment.value = ''; // Clear the input field after submission
}

// Function to get the list of comments from local storage
function getDataFromLS() {
    let comments = [];

    // If no comments are found in local storage, return an empty array
    if (localStorage.getItem('comments') === null) {
        comments = [];
    } else {
        // Otherwise, parse the comments from local storage
        comments = JSON.parse(localStorage.getItem('comments'));
    }

    return comments; // Return the array of comments
}

// Function to save comments to local storage
function saveCommentsToLocalStorage(theComment) {
    let comments = getDataFromLS(); // Get the current list of comments

    // Only save the comment if it's not empty
    if (theComment.trim() !== '') {
        // Add the comment along with the current date
        comments.push({ text: theComment, date: new Date() });
        localStorage.setItem('comments', JSON.stringify(comments)); // Save the updated list back to local storage
    } else {
        // Alert the user if they try to submit an empty comment
        alert('Please enter your comment before submitting');
    }
}

// Function to display comments in the comments list element
function ShowComment() {
    const comments = getDataFromLS(); // Get the list of comments from local storage
    commentsList.innerHTML = ''; // Clear the current list

    // Loop through each comment and create an <li> element for it
    comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = `${comment.date}: ${comment.text}`; // Display the date and comment text
        li.classList.add('li'); // Add a CSS class for styling
        commentsList.appendChild(li); // Add the <li> to the comments list
    });
}

// Function to load comments when the page is loaded
function loadDOM() {
    ShowComment(); // Display the comments from local storage
}

