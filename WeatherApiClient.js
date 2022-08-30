import * as Location from 'expo-location';


const API_KEY = "e408f93a18925399e2ea9e9eaa9d2e78";

async function getCurrentLocation() {
    return await Location.getCurrentPositionAsync({});
}


export async function getDailyForecastsLatLon(lat, lon, units, count ) {
    let resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?units=${units}&lat=${lat}&lon=${lon}&cnt=${count}&appid=${API_KEY}`);
    let resp_json = await resp.json();
    return resp_json;
}

export async function getWeatherLatLon(lat, lon, units, count ) {
    let resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=${units}&lat=${lat}&lon=${lon}&cnt=${count}&appid=${API_KEY}`);
    let resp_json = await resp.json();
    return resp_json;
}


export async function getDailyForecasts(units, count) {
    let current_location = await getCurrentLocation();
    let lat = current_location.coords.latitude;
    let lon = current_location.coords.longitude;
    return await getDailyForecastsLatLon(lat, lon, units, count)
}



export async function getGeocoding(searchQuery, limit) {
    let resp = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=${limit}&appid=${API_KEY}`);
    if (resp.status === 200) {
        return await resp.json();
    }
}