async function getCoordinates(){
    // Display loading message
    let loadingMsg = document.getElementById("loadingMsg");
    loadingMsg.style.display = "block";

    // Hides error message when a new search is made
    hideErrorMsg()

    // Get user input using DOM
    const cityName = document.getElementById("cityName").value;

    let cityData;
    let lat;
    let long
    try {
        // Make network request
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);

        // Checks if response is ok
        if (!response.ok){
            throw new Error(`Error! Status: ${response.status}`);
        }
        cityData = await response.json();
        lat = cityData.results[0].latitude;
        long = cityData.results[0].longitude;

    } catch (error) {
        // Catch error
        errorMessage("Sorry, city not found");
        return;
    }

    // Remove loading message
    loadingMsg.style.display = "none";

    // Get weather report using the lat and the long
    let data = await getWeather(lat, long);

    // Update city & country details with weather report on display
    updateCityDetails(data, cityData.results[0].name, cityData.results[0].country);

    // Update 5-Day forecast
    update5DayForecast(data);
}

// Function to get weather report using the lat and lon
async function getWeather(lat, lon){
    let weatherReport;
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max` +
            `&timezone=auto`
        );

        // Checks if response is ok
        if (!response.ok){
            throw new Error(`Error! Status: ${response.status}`);
        }

        weatherReport = await response.json()
        return weatherReport
    } catch (error) {
        // Catch error
        errorMessage("Sorry, weather report not found!");
        return;
    }
}

// Funtion to Update city & country details with current weather report
function updateCityDetails(data, city, country){

    // Update city and country
    const cityCountryDetails = document.getElementById("cityCountry");
    cityCountryDetails.innerText = `${city}, ${country}`

    // Update current temperature
    const temperature = document.getElementById("temperature");
    temperature.innerText = data.current.temperature_2m;

    // Update current humidity, wind & UV index
    const humidity = document.getElementById("humidity");
    humidity.innerText = `${data.current.relative_humidity_2m}%`;

    // Update current wind info
    const wind = document.getElementById("wind");
    wind.innerText = `${data.current.wind_speed_10m} km/h`;

    // Get Uv description and update current UV Index
    let uvDesc = getUvDescription(data.daily.uv_index_max[0]);
    const uvIndex = document.getElementById("uvIndex");
    uvIndex.innerText = uvDesc;

    // Get WMO Codes and update current weather description $ icon
    const wmoCode = getWmoDesc(data.current.weather_code);
    const wmoIcon = document.getElementById("wmoIcon");
    wmoIcon.innerText = wmoCode.icon;
    const wmoDesc = document.getElementById("wmoDesc");
    wmoDesc.innerText = wmoCode.description
}

// Get Uv description
function getUvDescription(uvIndex){
    if (uvIndex <= 2) {
    return "Low";
    } else if (uvIndex <= 5) {
    return "Moderate";
    } else if (uvIndex <= 7) {
    return "High";
    } else if (uvIndex <= 10) {
    return "Very High";
    } else {
    return "Extreme";
    }
}

// Get wmo description and icon
function getWmoDesc(wmoCode){
    if (wmoCode === 0) {
        return { description: "Clear sky", icon: "☀️" };
    } else if ([1, 2, 3].includes(wmoCode)) {
        return { description: "Partly cloudy", icon: "⛅" };
    } else if ([45, 48].includes(wmoCode)) {
        return { description: "Foggy", icon: "🌫" };
    } else if ([51, 53, 55].includes(wmoCode)) {
        return { description: "Drizzle", icon: "🌦" };
    } else if ([61, 63, 65].includes(wmoCode)) {
        return { description: "Rain", icon: "🌧" };
    } else if ([71, 73, 75].includes(wmoCode)) {
        return { description: "Snow", icon: "❄️" };
    } else if ([80, 81, 82].includes(wmoCode)) {
        return { description: "Rain showers", icon: "🌦" };
    } else if (wmoCode === 95) {
        return { description: "Thunderstorm", icon: "⛈" };
    } else {
        return { description: "Unknown", icon: "❓" };
    }
}

// Function to update the 5 Day forecast
function update5DayForecast(data){
    const forecastContainer = document.getElementById("forecastContainer");

    for (let index = 0; index < 5; index++){
        let formattedDate = changeDayFormat(data.daily.time[index], index);
        let icon = getWmoDesc(data.daily.weather_code[index]);

        // Create each div forecast in html using DOM
        const newForecast = document.createElement("div");
        newForecast.classList.add("eachForecast");
        newForecast.innerHTML = `
            <p class="weekDay">${formattedDate}</p>
            <p class="weatherIcon">${icon.icon}</p>
            <p class="day-temp">
                <span class="high">${data.daily.temperature_2m_max[index]}°</span>
                <span class="low">${data.daily.temperature_2m_min[index]}°</span>
            </p>
        `
        forecastContainer.appendChild(newForecast)
    }
}

// Change date format
function changeDayFormat(date, index){
    if (index === 0) return "Today";
    const newdate = new Date(date);
    return newdate.toLocaleDateString("en-US", {weekday: "long"});
}

// Display error message
function errorMessage(error) {
    let errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = error;
    errorMsg.style.display = "block";
}

// Hide back error message
function hideErrorMsg() {
    let hideMsg = document.getElementById("errorMsg");
    hideMsg.style.display = "none";
}

// Get the search button by ID
const searchBtn = document.getElementById("searchBtn");

// Search button being triggered
searchBtn.addEventListener("click", getCoordinates)