let allMovies = [];  // Thêm biến toàn cục để chứa tất cả các phim
let filteredMovies = [];
let filterPage = 0;
const FILTER_PER_PAGE = 20;
let isFiltering = false;

let genresList = [];
let allGenres = new Set();
let topGrossMovies = [];
let topGrossPage = 0;

function getPosterPath(movieId) {
  const posterPath = `assets/images/posters/${movieId}.jpg`;
  return posterPath;
}

function createMovieCard(movie, isTopRated = false) {
  const posterPath = getPosterPath(movie.id);
  const genres = (movie.genres || []).map(g => g.name).join(", ");

  if (isTopRated) {
    return `
      <div class="relative w-full rounded-2xl overflow-hidden shadow-md group">
        <img src="${posterPath}" 
             onerror="this.src='assets/images/anh3.jpg'"
             class="w-full h-100 object-cover group-hover:scale-[1.05] transition" />
        <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <h4 class="text-base font-semibold">${movie.original_title}</h4>
          <p class="text-sm text-gray-300">
            ${movie.release_year} | 
            ${(movie.genres || []).map(g => 
              `<a href="genres.html?genre=${encodeURIComponent(g.name)}" class="hover:text-purple-400">${g.name}</a>`
            ).join(', ')}
          </p>
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90 opacity-0 group-hover:opacity-100 transition duration-300 z-10"></div>
        <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 pb-8 pt-12 opacity-0 group-hover:opacity-100 transition duration-300 z-20">
          <h4 class="text-lg font-semibold">${movie.original_title}</h4>
          <p class="text-sm text-yellow-400">${movie.runtime || 'Không có mô tả'} phút</p>
          <div class="mt-4 flex justify-center gap-3 flex-wrap md:flex-nowrap">
            <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-2 min-w-[80px] justify-center">
              <i class="ph ph-play"></i> Xem ngay
            </button>
            <a href="movie_detail.html?id=${movie.id}" class="border border-white/30 hover:border-white text-white py-1 px-3 rounded-full text-sm flex items-center gap-2 min-w-[90px] justify-center">
              <i class="ph ph-info"></i> Chi tiết
            </a>
          </div>
          <div class="flex gap-2 flex-wrap mt-3 text-xs text-gray-300">
            <span class="bg-white/10 px-2 py-1 rounded">${genres}</span>
            <span class="bg-white/10 px-2 py-1 rounded">${movie.release_year}</span>
            <span class="bg-white/10 px-2 py-1 rounded">${movie.vote_average.toFixed(1)}/10</span>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
    <div class="relative w-full rounded-2xl overflow-hidden shadow-md group">
      <img src="${posterPath}" 
          onerror="this.src='assets/images/anh1.jpg'"
          class="w-full h-100 object-cover group-hover:scale-[1.05] transition" />
      <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <h4 class="text-base font-semibold">${movie.original_title}</h4>
        <p class="text-sm text-gray-300">
          ${movie.release_year} | 
          ${(movie.genres || []).map(g => 
            `<a href="genres.html?genre=${encodeURIComponent(g.name)}" class="hover:text-purple-400">${g.name}</a>`
          ).join(', ')}
        </p>
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90 opacity-0 group-hover:opacity-100 transition duration-300 z-10"></div>
      <div class="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 pb-8 pt-12 opacity-0 group-hover:opacity-100 transition duration-300 z-20">
        <h4 class="text-lg font-semibold">${movie.original_title}</h4>
        <p class="text-sm text-yellow-400">${movie.runtime || 'Không có mô tả'} phút</p>
        <div class="mt-4 flex justify-center gap-3 flex-wrap md:flex-nowrap">
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded-full text-sm flex items-center gap-2 min-w-[80px] justify-center">
            <i class="ph ph-play"></i> Xem ngay
          </button>
          <a href="movie_detail.html?id=${movie.id}" class="border border-white/30 hover:border-white text-white py-1 px-3 rounded-full text-sm flex items-center gap-2 min-w-[90px] justify-center">
            <i class="ph ph-info"></i> Chi tiết
          </a>
        </div>
        <div class="flex gap-2 flex-wrap mt-3 text-xs text-gray-300">
          <span class="bg-white/10 px-2 py-1 rounded">${genres}</span>
          <span class="bg-white/10 px-2 py-1 rounded">${movie.release_year}</span>
          <span class="bg-white/10 px-2 py-1 rounded">${movie.vote_average.toFixed(1)}/10</span>
        </div>
      </div>
    </div>
    `;
  }
}

function renderMovies() {
  const container = document.getElementById("top-rated-movies");
  if (filteredMovies.length === 0) {
    container.innerHTML = `<div class="text-center text-gray-400 col-span-4 py-8">Không tìm thấy phim nào phù hợp.</div>`;
    return;
  }
  const moviesToShow = filteredMovies.slice(0, 20);
  container.innerHTML = moviesToShow.map(m => createMovieCard(m, true)).join('');
}

function renderGenreDropdown() {
  const dropdown = document.getElementById("genre-dropdown");
  dropdown.innerHTML = genresList.map(g => `
    <li>
      <a href="genres.html?genre=${encodeURIComponent(g)}" class="block px-4 py-2 w-full text-left text-sm hover:bg-[#444]">
        ${g}
      </a>
    </li>
  `).join('');
}

function renderCountryDropdown() {
  const dropdown = document.getElementById("country-dropdown");
  if (!dropdown) return;
  
  dropdown.innerHTML = countriesList.map(country => `
    <li onclick="filterByCountry('${country}')" class="text-left hover:text-purple-400 cursor-pointer px-4 py-2 hover:bg-[#444] rounded transition-colors duration-200">
      ${country}
    </li>
  `).join('');
}

function filterByGenre(genre) {
  console.log("Filtering by genre: " + genre); 
  filteredMovies = allMovies.filter(m =>
    (m.genres || []).some(g => g.name === genre)
  );
  filterPage = 0;
  isFiltering = true;   
  renderFiltered();
  document.getElementById("section-title").textContent = `Thể loại: ${genre}`;
  document.getElementById("back-button").classList.remove("hidden");
}

function filterByCountry(country) {
  const languageCode = Object.entries(languageToCountry).find(([_, name]) => name === country)?.[0];
  
  if (languageCode) {
    filteredMovies = allMovies.filter(movie => 
      movie.original_language === languageCode
    );
    filterPage = 0;
    isFiltering = true;
    renderFiltered();
    
    document.getElementById("section-title").textContent = `Quốc gia: ${country}`;
    document.getElementById("back-button").classList.remove("hidden");
  }
}

function renderFiltered() {
  const container = document.getElementById("top-rated-movies");
  const start = filterPage * FILTER_PER_PAGE;
  const end = start + FILTER_PER_PAGE;
  const current = filteredMovies.slice(start, end);

  container.innerHTML = current.map(m => createMovieCard(m, true)).join('');

  document.querySelector('button[onclick="prevTopRated()"]').style.display = filterPage === 0 ? 'none' : 'block';
  document.querySelector('button[onclick="nextTopRated()"]').style.display =
    (filterPage + 1) * FILTER_PER_PAGE >= filteredMovies.length ? 'none' : 'block';
}

function resetFilter() {
  isFiltering = false;
  filterPage = 0;
  document.getElementById("section-title").textContent = "Top Rated Movies";
  document.getElementById("back-button").classList.add("hidden");
  renderTopRated();
}

const MOVIES_PER_PAGE = 4;
let topRatedMovies = [];
let topRatedPage = 0;

function renderTopRated() {
  const container = document.getElementById("top-rated-movies");
  const start = topRatedPage * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  const currentMovies = topRatedMovies.slice(start, end);

  container.innerHTML = currentMovies.map(m => createMovieCard(m, true)).join('');
  document.querySelector('button[onclick="prevTopRated()"]').style.display = topRatedPage === 0 ? 'none' : 'block';
  document.querySelector('button[onclick="nextTopRated()"]').style.display =
    (topRatedPage + 1) * MOVIES_PER_PAGE >= topRatedMovies.length ? 'none' : 'block';
}

function renderTopGross() {
  const container = document.getElementById("top-gross-movies");
  const start = topGrossPage * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  const currentMovies = topGrossMovies.slice(start, end);

  container.innerHTML = currentMovies.map(m => createMovieCard(m)).join('');
  document.querySelector('button[onclick="prevTopGross()"]').style.display = topGrossPage === 0 ? 'none' : 'block';
  document.querySelector('button[onclick="nextTopGross()"]').style.display =
    (topGrossPage + 1) * MOVIES_PER_PAGE >= topGrossMovies.length ? 'none' : 'block';
}

function nextTopRated() {
  if (isFiltering) {
    if ((filterPage + 1) * FILTER_PER_PAGE < filteredMovies.length) {
      filterPage++;
      renderFiltered();
    }
  } else {
    if ((topRatedPage + 1) * MOVIES_PER_PAGE < topRatedMovies.length) {
      topRatedPage++;
      renderTopRated();
    }
  }
}

function prevTopRated() {
  if (isFiltering) {
    if (filterPage > 0) {
      filterPage--;
      renderFiltered();
    }
  } else {
    if (topRatedPage > 0) {
      topRatedPage--;
      renderTopRated();
    }
  }
}

function nextTopGross() {
  if ((topGrossPage + 1) * MOVIES_PER_PAGE < topGrossMovies.length) {
    topGrossPage++;
    renderTopGross();
  }
}

function prevTopGross() {
  if (topGrossPage > 0) {
    topGrossPage--;
    renderTopGross();
  }
}

let recentMovies = [];
let recentPage = 0;

function renderRecent() {
  const container = document.getElementById("recent-movies");
  const start = recentPage * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  const currentMovies = recentMovies.slice(start, end);

  container.innerHTML = currentMovies.map(m => createMovieCard(m, false)).join('');
  document.querySelector('button[onclick="prevRecent()"]').style.display = recentPage === 0 ? 'none' : 'block';
  document.querySelector('button[onclick="nextRecent()"]').style.display =
    (recentPage + 1) * MOVIES_PER_PAGE >= recentMovies.length ? 'none' : 'block';
}

function nextRecent() {
  if ((recentPage + 1) * MOVIES_PER_PAGE < recentMovies.length) {
    recentPage++;
    renderRecent();
  }
}

function prevRecent() {
  if (recentPage > 0) {
    recentPage--;
    renderRecent();
  }
}

function loadMovieData() {
  fetch('data/movies.json')
    .then(res => res.json())
    .then(movies => {
      allMovies = movies;
      filteredMovies = movies;
      renderMovies(); 
      
      movies.forEach(m => {
        m.vote_average = parseFloat(m.vote_average);
        if (m.genres) {
          m.genres.forEach(g => allGenres.add(g.name));
        }
      });

      genresList = Array.from(allGenres).sort();
      renderGenreDropdown();

      // Lọc các phim có lượt đánh giá cao nhất
      topRatedMovies = [...movies]
        .filter(m => !isNaN(m.vote_average))
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 12);

      topRatedPage = 0;
      renderTopRated();
      // lọc các phim gần đây
      recentMovies = [...movies]
        .filter(m => m.release_date)
        .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        .slice(0, 12);

      recentPage = 0;
      renderRecent();
      // Lọc các phim có doanh thu cao nhất
      topGrossMovies = [...movies]
        .filter(m => !isNaN(m.revenue))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 12);

      topGrossPage = 0;
      renderTopGross();

      const featuredMovie = topRatedMovies[0];
      const featuredPosterPath = getPosterPath(featuredMovie.id);
      document.getElementById('featured-poster').src = featuredPosterPath;
      document.getElementById('featured-poster').onerror = function () {
        this.src = 'assets/images/poster.jpg';
      };
      const genres = (featuredMovie.genres || []).map(g => g.name).join(", ");
      document.getElementById('featured-movie').innerHTML = `
        <h2 class="text-2xl font-bold">${featuredMovie.original_title}</h2>
        <p class="text-sm text-gray-300 mb-3">${featuredMovie.release_year} | ${genres} | Rating: ${featuredMovie.vote_average}</p>
        <div class="flex gap-3 items-center relative">
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm">Xem ngay</button>
        </div>
      `;
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  loadMovieData();
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user && user.fullname) {
    document.getElementById('greeting').textContent = `Xin chào, ${user.fullname}`;
  }

  const searchInput = document.getElementById('search-input');
  const searchSuggestion = document.getElementById('search-suggestion');

  searchInput.addEventListener('input', function() {
    const keyword = this.value.trim().toLowerCase();
    if (!keyword) {
      searchSuggestion.classList.add('hidden');
      return;
    }

    const movieResults = allMovies.filter(movie =>
      movie.original_title && movie.original_title.toLowerCase().includes(keyword)
    ).slice(0, 5);

    let html = '';
    if (movieResults.length > 0) {
      html += `<div class="p-3 border-b border-gray-700 text-gray-300">Danh sách phim</div>`;
      html += movieResults.map(m => `
        <div class="flex items-center gap-3 px-4 py-2 hover:bg-[#222] cursor-pointer" onclick="window.location='movie_detail.html?id=${m.id}'">
           <img src="assets/images/posters/${m.id}.jpg" onerror="this.src='assets/images/anh1.jpg'" class="w-12 h-16 object-cover rounded" />
          <div>
            <div class="font-semibold">${m.original_title}</div>
            <div class="text-sm text-gray-400">${m.title || ''}</div>
            <div class="text-xs text-gray-500">${m.release_year ? 'Năm: ' + m.release_year : ''} ${m.runtime ? '• ' + m.runtime + ' phút' : ''}</div>
          </div>
        </div>
      `).join('');
    }

    if (!html) {
      html = `<div class="p-4 text-gray-400 text-center">Không tìm thấy kết quả</div>`;
    }

    searchSuggestion.innerHTML = html;
    searchSuggestion.classList.remove('hidden');
  });

  document.getElementById('search-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('search-btn').click();
    }
  });

  document.getElementById('search-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    if (!keyword) return;

    const results = allMovies.filter(movie => 
      (movie.original_title && movie.original_title.toLowerCase().includes(keyword)) ||
      (movie.cast && movie.cast.some(cast => cast.toLowerCase().includes(keyword)))
    );

    filteredMovies = results;
    renderMovies();
  });

  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchSuggestion.contains(e.target)) {
      searchSuggestion.classList.add('hidden');
    }
  });
}); 