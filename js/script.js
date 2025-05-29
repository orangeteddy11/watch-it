const TMDB_API_KEY = 'f4c3b9dfc52b4928b8d4abd84549aab6';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const topMoviesGrid = document.getElementById('top-movies-grid');
const topTvSeriesGrid = document.getElementById('top-tv-series-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResultsDiv = document.getElementById('search-results');

// --- Helper function to create a movie/TV series card ---
function createMediaCard(media) {
    const card = document.createElement('div');
    card.classList.add('card');

    const posterPath = media.poster_path ? `${TMDB_IMAGE_BASE_URL}${media.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';
    const title = media.title || media.name || 'N/A'; // Use title for movies, name for TV series
    const releaseDate = media.release_date || media.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const overview = media.overview ? media.overview.substring(0, 100) + '...' : 'No overview available.';

    card.innerHTML = `
        <img src="${posterPath}" alt="${title} Poster">
        <h3>${title} (${year})</h3>
        <p>${overview}</p>
    `;
    return card;
}

// --- Fetch and Display Top Movies ---
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

// --- Generic display function for media ---
function displayMedia(mediaItems, container) {
    container.innerHTML = ''; // Clear existing content
    if (mediaItems.length === 0) {
        container.innerHTML = '<p>No results found.</p>';
        return;
    }
    mediaItems.forEach(item => {
        container.appendChild(createMediaCard(item));
    });
}

// --- Search functionality ---
async function searchMoviesAndTv(event) {
    event.preventDefault(); // Prevent default form submission
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a movie or TV series title to search.');
        // Hide search results if query is empty
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('active');
        // Show initial categories again
        topMoviesGrid.closest('.category').style.display = 'block';
        topTvSeriesGrid.closest('.category').style.display = 'block';
        return;
    }

    // Hide initial categories when search results are active
    topMoviesGrid.closest('.category').style.display = 'none';
    topTvSeriesGrid.closest('.category').style.display = 'none';

    searchResultsDiv.classList.add('active'); // Show search results container

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

// --- Initialize when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    fetchTopMovies();
    fetchTopTvSeries();
    searchForm.addEventListener('submit', searchMoviesAndTv);
});