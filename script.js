
let isCelsius = true;

document.addEventListener('DOMContentLoaded', () => {
  getWeatherByLocation();

  document.getElementById('unit-toggle').addEventListener('click', toggleUnits);

  document.getElementById('searchBox').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      getWeatherByCity(this.value);
    }
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    updateBackgroundTheme();
  });
});

function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(`${latitude},${longitude}`);
    },
    err => {
      console.warn('Location denied. Defaulting to New York.');
      fetchWeather('New York');
    }
  );
}

function getWeatherByCity(city) {
  fetchWeather(city);
}

function fetchWeather(query) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5&aqi=no&alerts=no`;

  fetch(url)
    .then(res => res.json())
    .then(data => updateWeather(data))
    .catch(err => console.error('Failed to fetch weather:', err));
}

function updateWeather(data) {
  const current = data.current;
  const forecast = data.forecast.forecastday;
  const location = data.location;

  document.getElementById('cityName').textContent = location.name;
  document.getElementById('weatherDescription').textContent = current.condition.text;
  document.getElementById('weatherIcon').src = current.condition.icon;

  updateTemperature(current.temp_c, current.temp_f);
  updateDetails(current);
  updateBackground(current.condition.text, location.localtime);
  updateHourly(forecast[0].hour, location.localtime);
  update5Day(forecast);
}

function updateTemperature(tempC, tempF) {
  const tempEl = document.getElementById('temperature');
  const temp = isCelsius ? tempC : tempF;
  tempEl.textContent = isCelsius ? `${tempC}°C` : `${tempF}°F`;

  // Optional: Gradient effect
  if (temp <= 0) {
    tempEl.style.background = 'linear-gradient(90deg, #00f, #0ff)';
  } else if (temp <= 15) {
    tempEl.style.background = 'linear-gradient(90deg, #0ff, #0f0)';
  } else if (temp <= 25) {
    tempEl.style.background = 'linear-gradient(90deg, #0f0, #ff0)';
  } else if (temp <= 35) {
    tempEl.style.background = 'linear-gradient(90deg, #ff0, #f90)';
  } else {
    tempEl.style.background = 'linear-gradient(90deg, #f90, #f00)';
  }

  tempEl.style.webkitBackgroundClip = 'text';
  tempEl.style.webkitTextFillColor = 'transparent';
}

function updateDetails(current) {
  document.getElementById('realFeel').textContent = `Real Feel: ${isCelsius ? current.feelslike_c : current.feelslike_f}°`;
  document.getElementById('humidity').textContent = `Humidity: ${current.humidity}%`;
  document.getElementById('wind').textContent = `Wind: ${current.wind_kph} km/h`;
  document.getElementById('uv').textContent = `UV Index: ${current.uv}`;
  document.getElementById('rain').textContent = `Chance of Rain: ${current.precip_mm} mm`;
}

function updateHourly(hours, localtime) {
  const box = document.getElementById('hourlyBox');
  box.innerHTML = '';
  const nowHour = new Date(localtime).getHours();

  for (let i = nowHour; i < nowHour + 12; i++) {
    if (i >= hours.length) break;
    const hour = hours[i];
    const div = document.createElement('div');
    div.classList.add('hour');
    div.innerHTML = `
      <p>${new Date(hour.time).toLocaleTimeString([], { hour: 'numeric', hour12: true })}</p>
      <img src="${hour.condition.icon}" />
      <p>${isCelsius ? hour.temp_c + '°C' : hour.temp_f + '°F'}</p>
    `;
    box.appendChild(div);
  }
}

function update5Day(forecast) {
  const box = document.getElementById('forecastContainer');
  box.innerHTML = '';
  forecast.forEach(day => {
    const noon = day.hour.find(h => h.time.includes('12:00'));
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <p>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
      <img src="${noon.condition.icon}" />
      <p>${isCelsius ? noon.temp_c + '°C' : noon.temp_f + '°F'}</p>
    `;
    box.appendChild(div);
  });
}

function toggleUnits() {
  isCelsius = !isCelsius;
  const city = document.getElementById('cityName').textContent;
  if (city) fetchWeather(city);
  document.getElementById('unit-toggle').textContent = isCelsius ? '°C' : '°F';
}

function updateBackground(condition, localtime) {
  const hour = new Date(localtime).getHours();
  const isNight = hour < 6 || hour > 18;
  const video = document.getElementById('background-video');

  let videoName = 'clear';

  if (isNight) {
    videoName = 'nighttime';
  } else {
    const cond = condition.toLowerCase();
    if (cond.includes('sunny')) videoName = 'sunny';
    else if (cond.includes('cloud')) videoName = 'cloudy';
    else if (cond.includes('rain') || cond.includes('drizzle')) videoName = 'rain';
    else if (cond.includes('snow')) videoName = 'snow';
    else if (cond.includes('thunder')) videoName = 'thunder';
    else if (cond.includes('fog') || cond.includes('mist')) videoName = 'foggy';
  }

  video.src = `videos/${videoName}.mp4`;
}

function updateBackgroundTheme() {
  const isLight = document.body.classList.contains('light-theme');
  const video = document.getElementById('background-video');
  video.style.opacity = isLight ? 0.8 : 0.5;
}