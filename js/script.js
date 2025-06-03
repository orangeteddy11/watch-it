const TMDB_API_KEY = 'f4c3b9dfc52b4928b8d4abd84549aab6';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const trendingMoviesSlider = document.getElementById('trending-movies-slider'); // New element for the slider
const topMoviesGrid = document.getElementById('top-movies-grid');
const topTvSeriesGrid = document.getElementById('top-tv-series-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResultsDiv = document.getElementById('search-results');

// New elements for slider navigation
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

// New elements for login/logout
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

// Video Player Modal Elements
const videoPlayerModal = document.getElementById('videoPlayerModal');
const closeButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');
const videoFrame = document.getElementById('videoFrame');
const modalOverview = document.getElementById('modalOverview');

let currentSlidePosition = 0; // To track slider position
const cardWidth = 220; // Card width + gap (200px width + 20px gap) - adjust if your card/gap changes

// --- Helper function to create a movie/TV series card ---
function createMediaCard(media) {
    const card = document.createElement('div');
    card.classList.add('card');
    // Store media data on the card for later use when clicked
    card.dataset.title = media.title || media.name || 'N/A';
    card.dataset.overview = media.overview || 'No overview available.';
    // A generic YouTube trailer URL for demonstration
    // You might want to replace this with a more dynamic one if integrating with trailer APIs
    card.dataset.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0'; // Rick Astley - Never Gonna Give You Up

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

    // Add click listener to open modal
    card.addEventListener('click', () => openVideoModal(card.dataset.title, card.dataset.overview, card.dataset.videoUrl));

    return card;
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

// --- Fetch and Display Trending Movies for Slider ---
async function fetchTrendingMovies() {
    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Display only the first 10-15 for the slider to keep it manageable
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
    event.preventDefault(); // Prevent default form submission
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a movie or TV series title to search.');
        // Hide search results if query is empty
        searchResultsDiv.innerHTML = '';
        searchResultsDiv.classList.remove('active');
        // Show initial categories again
        document.querySelector('.slider-section').style.display = 'block'; // Show slider
        topMoviesGrid.closest('.category').style.display = 'block';
        topTvSeriesGrid.closest('.category').style.display = 'block';
        return;
    }

    // Hide initial categories when search results are active
    document.querySelector('.slider-section').style.display = 'none'; // Hide slider
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

// --- Slider Navigation Logic ---
function slide(direction) {
    const totalCards = trendingMoviesSlider.children.length;
    const containerWidth = trendingMoviesSlider.offsetWidth; // Visible width of the slider track
    const cardsPerView = Math.floor(containerWidth / cardWidth);

    if (direction === 'next') {
        currentSlidePosition += cardsPerView;
        if (currentSlidePosition >= totalCards) {
            currentSlidePosition = 0; // Loop back to start
        }
    } else if (direction === 'prev') {
        currentSlidePosition -= cardsPerView;
        if (currentSlidePosition < 0) {
            currentSlidePosition = Math.max(0, totalCards - cardsPerView); // Go to end, or just 0 if few cards
        }
    }

    const transformValue = -currentSlidePosition * cardWidth;
    trendingMoviesSlider.style.transform = `translateX(${transformValue}px)`;
}

// --- Login/Logout Functionality (Simulated) ---
function checkLoginStatus() {
    // In a real app, this would check a cookie or local storage for a session token
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Simple flag for demonstration

    if (isLoggedIn) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block'; // Show logout
    } else {
        loginButton.style.display = 'inline-block'; // Show login
        logoutButton.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn'); // Clear the flag
    checkLoginStatus(); // Update button visibility
    alert('You have been logged out.');
    // In a real app, you'd also redirect to login page or home after logout
}

// --- Video Player Modal Functions ---
function openVideoModal(title, overview, videoUrl) {
    modalTitle.textContent = title;
    modalOverview.textContent = overview;
    videoFrame.src = videoUrl; // Set the video source
    videoPlayerModal.style.display = 'block'; // Show the modal
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

function closeVideoModal() {
    videoPlayerModal.style.display = 'none'; // Hide the modal
    videoFrame.src = ''; // Stop the video by clearing its source
    document.body.style.overflow = ''; // Restore scrolling
}

// --- Initialize when the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies(); // Fetch movies for the new slider
    fetchTopMovies();
    fetchTopTvSeries();
    searchForm.addEventListener('submit', searchMoviesAndTv);

    // Slider event listeners
    prevArrow.addEventListener('click', () => slide('prev'));
    nextArrow.addEventListener('click', () => slide('next'));

    // Login/Logout event listeners
    logoutButton.addEventListener('click', handleLogout);

    // Video Player Modal event listeners
    closeButton.addEventListener('click', closeVideoModal);
    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === videoPlayerModal) {
            closeVideoModal();
        }
    });

    // Initial check for login status
    checkLoginStatus();
});