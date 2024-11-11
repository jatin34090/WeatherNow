import React, { useState, useEffect } from "react";
import "./WeatherSearch.css";

const WeatherSearch = () => {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [showCities, setShowCities] = useState(false);

  const API_KEY = "440088d7a9667e3d1b42507091a7686b"; // Replace with your actual API key
  const API_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

  const fetchCities = async () => {
    if (query.length < 3) return;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      setCities(data || []);
      setError(null);
      setShowCities(true); // Show the list of cities when the query is typed
    } catch {
      setError("Error fetching cities");
    }
  };

  useEffect(() => {
    fetchCities();
  }, [query]);

  const fetchWeather = async (cityName, lat, lon) => {
    try {
      const response = await fetch(
        `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === 200) {
        console.log("data", data);
        setWeatherData(data);
        setQuery(cityName);
        setError(null);
        setShowCities(false); // Hide city list when a city is selected

        // Fetch the forecast data
        const forecastResponse = await fetch(
          `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecast = await forecastResponse.json();
        setForecastData(forecast);
      } else {
        setError("City not found");
      }
    } catch {
      setError("Error fetching weather");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setCities([]);
    setWeatherData(null);
    setForecastData(null);
    setError(null);
    setShowCities(false);
  };

  const toggleCityList = () => {
    setShowCities((prevShowCities) => !prevShowCities);
  };

  return (
    <div className="container">
      <div id="search">
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search City"
        />
        {query && (
          <span className="search-clear" onClick={clearSearch}>
            &#x2715;
          </span>
        )}
        <span className="search-dropdown" onClick={toggleCityList}>
          &#x25BC;
        </span>

        {showCities && cities.length > 0 && (
          <ul className="city-list">
            {cities.map((city, index) => (
              <li
                key={index}
                className="city-item"
                onClick={() => {
                  fetchWeather(city.name, city.lat, city.lon);
                  setShowCities(false); // Hide the city list when a city is selected
                }}
              >
                {city.name}, {city.state || ""}, {city.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {weatherData && (
        <div id="current-forecast">
          <h2 className="city">{weatherData.name}</h2>
          <h1 className="temp">{weatherData?.main?.temp?.toFixed(1)}°</h1>
          <p className="description">{weatherData?.weather[0]?.description}</p>
          <p className="min-max-temp">
            H: {weatherData?.main?.temp_max?.toFixed(1)}° L:{" "}
            {weatherData?.main?.temp_min?.toFixed(1)}°
          </p>
        </div>
      )}

      {forecastData && (
        <>
          <div id="hourly-forecast">
            <h3>Hourly Forecast</h3>
            <div className="hourly-container">
              {forecastData?.list?.slice(0, 6).map((hour, index) => (
                <div key={index}>
                  <h3 className="time">
                    {new Date(hour.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </h3>
                  <img
                    className="icon"
                    src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                    alt={hour.weather[0].description}
                  />
                  <p className="hourly-temp">{hour.main.temp.toFixed(1)}°</p>
                </div>
              ))}
            </div>
          </div>

          <div id="five-day-forecast">
            <h3>5-Day Forecast</h3>
            <div className="five-day-forecast-container">
              {forecastData?.list
                ?.filter((item, index) => index % 8 === 0)
                .map((day, index) => (
                  <div key={index} className="day-wise-forcast">
                    <h3 className="day">
                      {index === 0
                        ? "Today"
                        : new Date(day.dt * 1000).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                    </h3>
                    <img
                      className="icon"
                      src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={day.weather[0].description}
                    />
                    <p className="min-temp">{day.main.temp_min.toFixed(1)}°</p>
                    <p className="max-temp">{day.main.temp_max.toFixed(1)}°</p>
                  </div>
                ))}
            </div>
          </div>

          <div id="feels-like">
            <h3>Feels Like</h3>
            <p className="feels-like-temp">
              {weatherData?.main?.feels_like.toFixed(1)}°
            </p>
          </div>

          <div id="humidity">
            <h3>Humidity</h3>
            <p className="humidity-value">{weatherData?.main?.humidity}%</p>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherSearch;
