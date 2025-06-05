const TMDB_API_KEY = 'f4c3b9dfc52b4928b8d4abd84549aab6';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const trendingMoviesSlider = document.getElementById('trending-movies-slider');
const topMoviesGrid = document.getElementById('top-movies-grid');
const topTvSeriesGrid = document.getElementById('top-tv-series-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResultsDiv = document.getElementById('search-results');

// New: Sidebar genre navigation
const genreNav = document.querySelector('.genre-nav');

const sliderSection = document.querySelector('.slider-section');
const topMoviesCategory = topMoviesGrid.closest('.category');
const topTvSeriesCategory = topTvSeriesGrid.closest('.category');

const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

let currentSlidePosition = 0;
const cardWidth = 220;

let allGenres = []; // To store fetched genres

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

    card.addEventListener('click', () => {
        const mediaType = media.media_type === 'movie' ? 'movie' : 'tv';
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

// --- Fetch Genres ---
async function fetchGenres(type) {
    const url = `${TMDB_BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error(`Error fetching ${type} genres:`, error);
        return [];
    }
}

// --- Populate Genre Sidebar (Updated Function) ---
async function populateGenreSidebar() {
    const movieGenres = await fetchGenres('movie');
    const tvGenres = await fetchGenres('tv');

    const combinedGenres = [...movieGenres, ...tvGenres];
    const uniqueGenresMap = new Map();
    combinedGenres.forEach(genre => uniqueGenresMap.set(genre.id, genre.name));

    allGenres = Array.from(uniqueGenresMap.values()).map((name, index) => ({ id: Array.from(uniqueGenresMap.keys())[index], name: name }));
    allGenres.sort((a, b) => a.name.localeCompare(b.name));

    // Clear existing genres except "All Genres"
    const allGenresLink = genreNav.querySelector('.genre-link[data-genre-id=""]');
    genreNav.innerHTML = '';
    genreNav.appendChild(allGenresLink); // Re-add "All Genres" link

    allGenres.forEach(genre => {
        const link = document.createElement('a');
        link.href = "#"; // Prevent page reload
        link.classList.add('genre-link');
        link.dataset.genreId = genre.id;
        link.textContent = genre.name;
        genreNav.appendChild(link);
    });

    // Add click listeners to all genre links
    genreNav.querySelectorAll('.genre-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const selectedId = event.target.dataset.genreId;
            filterMediaByGenre(selectedId);

            // Update active class for styling
            genreNav.querySelectorAll('.genre-link').forEach(l => l.classList.remove('active-genre'));
            event.target.classList.add('active-genre');
        });
    });
}

// --- Filter Media by Genre (Updated Function) ---
async function filterMediaByGenre(selectedGenreId) {
    // Reset search input
    searchInput.value = '';

    // Hide main sections and show search results to display filtered content
    sliderSection.style.display = 'none';
    topMoviesCategory.style.display = 'none';
    topTvSeriesCategory.style.display = 'none';
    searchResultsDiv.classList.add('active');

    if (selectedGenreId === "") { // "All Genres" selected
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('active');
        sliderSection.style.display = 'block';
        topMoviesCategory.style.display = 'block';
        topTvSeriesCategory.style.display = 'block';
        fetchTrendingMovies();
        fetchTopMovies();
        fetchTopTvSeries();
        return;
    } else {
        const moviesUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreId}&language=en-US&sort_by=popularity.desc&page=1`;
        const tvUrl = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${selectedGenreId}&language=en-US&sort_by=popularity.desc&page=1`;

        try {
            const [moviesResponse, tvResponse] = await Promise.all([
                fetch(moviesUrl),
                fetch(tvUrl)
            ]);

            const moviesData = await moviesResponse.json();
            const tvData = await tvResponse.json();

            const combinedResults = [...moviesData.results, ...tvData.results];
            if (combinedResults.length > 0) {
                combinedResults.forEach(item => {
                    if (!item.media_type) {
                        item.media_type = moviesData.results.includes(item) ? 'movie' : 'tv';
                    }
                });
                displayMedia(combinedResults, searchResultsDiv);
            } else {
                const selectedGenreName = allGenres.find(g => g.id == selectedGenreId)?.name || 'selected genre';
                searchResultsDiv.innerHTML = `<p>No movies or TV series found for "${selectedGenreName}".</p>`;
            }

        } catch (error) {
            console.error('Error filtering by genre:', error);
            searchResultsDiv.innerHTML = '<p>Error filtering content by genre. Please try again.</p>';
        }
    }
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

// --- Search functionality (Modified to reset genre filter) ---
async function searchMoviesAndTv(event) {
    event.preventDefault();
    const query = searchInput.value.trim();

    // Reset active genre link when performing a search
    genreNav.querySelectorAll('.genre-link').forEach(l => l.classList.remove('active-genre'));
    genreNav.querySelector('.genre-link[data-genre-id=""]').classList.add('active-genre'); // Set "All Genres" as active

    if (!query) {
        alert('Please enter a movie or TV series title to search.');
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('active');
        sliderSection.style.display = 'block';
        topMoviesCategory.style.display = 'block';
        topTvSeriesCategory.style.display = 'block';
        return;
    }

    sliderSection.style.display = 'none';
    topMoviesCategory.style.display = 'none';
    topTvSeriesCategory.style.display = 'none';

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
    if (document.body.id === 'home-page') {
        populateGenreSidebar(); // Populate genres on load
        fetchTrendingMovies();
        fetchTopMovies();
        fetchTopTvSeries();
    }
    
    searchForm.addEventListener('submit', searchMoviesAndTv);

    prevArrow.addEventListener('click', () => slide('prev'));
    nextArrow.addEventListener('click', () => slide('next'));

    logoutButton.addEventListener('click', handleLogout);
    checkLoginStatus();
});