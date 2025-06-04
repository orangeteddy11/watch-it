const TMDB_API_KEY = 'f4c3b9dfc52b4928b8d4abd84549aab6'; // Make sure this key is the same as in detail.html

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const trendingMoviesSlider = document.getElementById('trending-movies-slider');
const topMoviesGrid = document.getElementById('top-movies-grid');
const topTvSeriesGrid = document.getElementById('top-tv-series-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResultsDiv = document.getElementById('search-results');

const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

let currentSlidePosition = 0;
const cardWidth = 220;

// --- Helper function to create a movie/TV series card ---
function createMediaCard(media) {
    const card = document.createElement('div');
    card.classList.add('card');

    const posterPath = media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';
    const title = media.title || media.name || 'N/A';
    const releaseDate = media.release_date || media.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const overview = media.overview ? media.overview.substring(0, 100) + '...' : 'No overview available.';

    card.innerHTML = `
        <img src="${posterPath}" alt="${title} Poster">
        <h3>${title} (${year})</h3>
        <p>${overview}</p>
    `;

    // New: Add click listener to navigate to detail.html
    card.addEventListener('click', () => {
        const mediaType = media.media_type === 'movie' ? 'movie' : 'tv'; // Ensure correct type for TMDB
        window.location.href = `detail.html?id=${media.id}&type=${mediaType}`;
    });

    return card;
}

// --- Generic display function for media ---
function displayMedia(mediaItems, container) {
    container.innerHTML = '';
    if (mediaItems.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }
    mediaItems.forEach(item => {
        container.appendChild(createMediaCard(item));
    });
}

// --- Fetch and Display Trending Movies for Slider ---
async function fetchTrendingMovies() {
    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayMedia(data.results.slice(0, 15), trendingMoviesSlider);
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        trendingMoviesSlider.innerHTML = '<p>Could not load trending movies.</p>';
    }
}

// --- Fetch and Display Top Movies (for the grid below slider) ---
async function fetchTopMovies() {
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayMedia(data.results, topMoviesGrid);
    } catch (error) {
        console.error('Error fetching top movies:', error);
        topMoviesGrid.innerHTML = '<p>Could not load top movies.</p>';
    }
}

// --- Fetch and Display Top TV Series ---
async function fetchTopTvSeries() {
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayMedia(data.results, topTvSeriesGrid);
    } catch (error) {
        console.error('Error fetching top TV series:', error);
        topTvSeriesGrid.innerHTML = '<p>Could not load top TV series.</p>';
    }
}

// --- Search functionality ---
async function searchMoviesAndTv(event) {
    event.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a movie or TV series title to search.');
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('active');
        document.querySelector('.slider-section').style.display = 'block';
        topMoviesGrid.closest('.category').style.display = 'block';
        topTvSeriesGrid.closest('.category').style.display = 'block';
        return;
    }

    document.querySelector('.slider-section').style.display = 'none';
    topMoviesGrid.closest('.category').style.display = 'none';
    topTvSeriesGrid.closest('.category').style.display = 'none';

    searchResultsDiv.classList.add('active');

    const searchUrl = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        displayMedia(filteredResults, searchResultsDiv);
    } catch (error) {
        console.error('Error searching for movies/TV series:', error);
        searchResultsDiv.innerHTML = '<p>Error searching. Please try again.</p>';
    }
}

// --- Slider Navigation Logic ---
function slide(direction) {
    const totalCards = trendingMoviesSlider.children.length;
    const containerWidth = trendingMoviesSlider.offsetWidth;
    const cardsPerView = Math.floor(containerWidth / cardWidth);

    if (direction === 'next') {
        currentSlidePosition += cardsPerView;
        if (currentSlidePosition >= totalCards) {
            currentSlidePosition = 0;
        }
    } else if (direction === 'prev') {
        currentSlidePosition -= cardsPerView;
        if (currentSlidePosition < 0) {
            currentSlidePosition = Math.max(0, totalCards - cardsPerView);
        }
    }

    const transformValue = -currentSlidePosition * cardWidth;
    trendingMoviesSlider.style.transform = `translateX(${transformValue}px)`;
}

// --- Login/Logout Functionality (Simulated) ---
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    } else {
        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    checkLoginStatus();
    alert('You have been logged out.');
}

// --- Initialize when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    // Only run these fetches if we are on the index.html page
    if (document.body.id === 'home-page') { // Add an ID to your body tag in index.html for this check
        fetchTrendingMovies();
        fetchTopMovies();
        fetchTopTvSeries();
    }
    
    searchForm.addEventListener('submit', searchMoviesAndTv);

    // Slider event listeners
    prevArrow.addEventListener('click', () => slide('prev'));
    nextArrow.addEventListener('click', () => slide('next'));

    // Login/Logout event listeners
    logoutButton.addEventListener('click', handleLogout);

    // Initial check for login status
    checkLoginStatus();
});