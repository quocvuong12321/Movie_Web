let allMovies = []; // Dữ liệu tất cả các bộ phim
    let filteredMovies = []; // Dữ liệu phim sau khi lọc
    let currentPage = 1; // Trang hiện tại
    const moviesPerPage = 20; // Số phim trên mỗi trang
    let allGenres = new Set();
    let allYears = new Set();

    function getPosterPath(movieId) {
      return `assets/images/posters/${movieId}.jpg`;
    }

    function createMovieCard(movie) {
      const posterPath = getPosterPath(movie.id);
      const genres = (movie.genres || []).map(g => g.name).join(", ");
      return `
        <div class="relative w-full rounded-2xl overflow-hidden shadow-md group">
          <img src="${posterPath}" 
                 onerror="this.src='assets/images/anh3.jpg'"
                 class="w-full h-100 object-cover group-hover:scale-[1.05] transition" />
            <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <h4 class="text-base font-semibold">${movie.original_title}</h4>
              <p class="text-sm text-gray-300">${movie.release_year} | ${genres}</p>
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

    function loadMovieData() {
      fetch('data/movies.json')
        .then(res => res.json())
        .then(movies => {
          allMovies = movies;
          movies.forEach(m => {
            m.vote_average = parseFloat(m.vote_average);
            if (m.genres) {
              m.genres.forEach(g => allGenres.add(g.name));
            }
            if (m.release_year) {
              allYears.add(m.release_year);
            }
          });
          renderGenreDropdown();
          renderYearDropdown();
          filteredMovies = [...allMovies];
          renderMovies();
        });
    }

    function renderGenreDropdown() {
      const dropdown = document.getElementById("genre-filter");
      dropdown.innerHTML = `<option value="all">Tất cả thể loại</option>` +
        Array.from(allGenres).sort().map(g => `<option value="${g}">${g}</option>`).join('');
    }

    function renderYearDropdown() {
      const yearSelect = document.getElementById("year-filter");
      yearSelect.innerHTML = `<option value="all">Tất cả năm</option>` +
        Array.from(allYears).sort().map(y => `<option value="${y}">${y}</option>`).join('');
    }

    function filterMovies() {
      const selectedGenre = document.getElementById("genre-filter").value;
      const selectedYear = document.getElementById("year-filter").value;

      filteredMovies = allMovies.filter(movie => {
        const matchGenre = selectedGenre === "all" || (movie.genres && movie.genres.some(g => g.name === selectedGenre));
        const matchYear = selectedYear === "all" || movie.release_year == selectedYear;
        return matchGenre && matchYear;
      });
      currentPage = 1;
      renderMovies();
    }

    function renderMovies() {
      const start = (currentPage - 1) * moviesPerPage;
      const end = start + moviesPerPage;
      const currentMovies = filteredMovies.slice(start, end);
      const container = document.getElementById("movie-container");
      container.innerHTML = currentMovies.map(m => createMovieCard(m)).join('');
      const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
      renderPagination(totalPages);
    }

    

    function renderPagination(totalPages) {
      const paginationContainer = document.getElementById("pagination");
      let paginationHTML = '';

      // Nút Previous
      paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" class="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
          Previous
        </button>
      `;

      // Hiển thị số trang
      if (totalPages <= 10) {
        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `
            <button onclick="changePage(${i})" class="px-3 py-1 rounded-md ${currentPage === i ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}">
              ${i}
            </button>
          `;
        }
      } else {
        // Trang đầu
        paginationHTML += `
          <button onclick="changePage(1)" class="px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}">1</button>
        `;

        // Dấu ... đầu
        if (currentPage > 5) {
          paginationHTML += `<span class="px-2">...</span>`;
        }

        // Các trang ở giữa
        let start = Math.max(2, currentPage - 2);
        let end = Math.min(totalPages - 1, currentPage + 2);

        if (currentPage <= 5) {
          end = 6;
        }
        if (currentPage >= totalPages - 4) {
          start = totalPages - 5;
        }

        for (let i = start; i <= end; i++) {
          if (i > 1 && i < totalPages) {
            paginationHTML += `
              <button onclick="changePage(${i})" class="px-3 py-1 rounded-md ${currentPage === i ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}">
                ${i}
              </button>
            `;
          }
        }

        // Dấu ... cuối
        if (currentPage < totalPages - 4) {
          paginationHTML += `<span class="px-2">...</span>`;
        }

        // Trang cuối
        paginationHTML += `
          <button onclick="changePage(${totalPages})" class="px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}">${totalPages}</button>
        `;
      }

      // Nút Next
      paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" class="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>
          Next
        </button>
      `;

      paginationContainer.innerHTML = paginationHTML;
    }

    function changePage(page) {
      if (page < 1 || page > Math.ceil(filteredMovies.length / moviesPerPage)) return;
      currentPage = page;
      renderMovies();
    }

    document.addEventListener('DOMContentLoaded', function() {
      loadMovieData();
      document.getElementById('filter-btn').addEventListener('click', filterMovies);
      document.getElementById("genre-filter").addEventListener("change", filterMovies);
      document.getElementById("year-filter").addEventListener("change", filterMovies);
      const urlParams = new URLSearchParams(window.location.search);
      const genre = urlParams.get('genre');
      if (genre && genre !== "all") {
        document.getElementById('section-title').textContent = `Phim theo thể loại: ${genre}`;
      } else {
        document.getElementById('section-title').textContent = "Phim theo thể loại";
      }

      const user = JSON.parse(localStorage.getItem('currentUser'));
      const userInfoDiv = document.getElementById('user-info');
      if (user && user.fullname) {
        userInfoDiv.innerHTML = `<span>Xin chào, <b>${user.fullname}</b></span>
          <a href="#" id="logout-btn" class="hover:text-white ml-4">Đăng xuất</a>`;
        // Xử lý đăng xuất
        document.getElementById('logout-btn').onclick = function() {
          localStorage.removeItem('currentUser');
          window.location.reload();
        };
      } else {
        userInfoDiv.innerHTML = `
          <a href="index.html" class="hover:text-white">Đăng nhập</a>
          <a href="index.html" class="hover:text-white">Đăng ký</a>
        `;
      }
    });

    // Sự kiện tìm kiếm cho genres.html
    const searchInput = document.getElementById('search-input');
    const searchSuggestion = document.getElementById('search-suggestion');

    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      if (!keyword) {
        searchSuggestion.classList.add('hidden');
        return;
      }

      // Tìm phim trong allMovies (đã được load từ trước)
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

    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchSuggestion.contains(e.target)) {
        searchSuggestion.classList.add('hidden');
      }
    });

    // Cho phép nhấn Enter để tìm kiếm (nếu muốn lọc luôn trên trang)
    document.getElementById('search-btn').addEventListener('click', function(e) {
      e.preventDefault();
      const keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) return;
      const results = allMovies.filter(movie =>
        movie.original_title && movie.original_title.toLowerCase().includes(keyword)
      );
      filteredMovies = results;
      currentPage = 1;
      renderMovies();
    });
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('search-btn').click();
      }
    });

    document.addEventListener('DOMContentLoaded', function() {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.fullname) {
        document.getElementById('greeting').textContent = `Xin chào, ${user.fullname}`;
      }
    });



    let rules = [];

// Tải luật từ file rules.json
fetch('data/association_rules.json') // Hoặc đường dẫn tương ứng
  .then(res => res.json())
  .then(data => {
    rules = data;
  });


 let selectedGenres = []; // Mảng chứa các thể loại hiện tại (bao gồm thể loại ban đầu và thể loại đi kèm)

  document.getElementById('genre-filter').addEventListener('change', (e) => {
    // Khi người dùng chọn thể loại ban đầu
    const baseGenre = e.target.value.trim();
  
    // Lưu thể loại ban đầu vào mảng selectedGenres
    if (!selectedGenres.includes(baseGenre)) {
      selectedGenres = [baseGenre];  // Chỉ giữ thể loại ban đầu
    }
  
    // Hiển thị các thể loại đi kèm dựa trên thể loại ban đầu
    const suggested = getSuggestedGenres(baseGenre);
    showSuggestedGenres(suggested);
  });
  
  document.getElementById('suggested-genres').addEventListener('click', (e) => {
    if (e.target.classList.contains('suggest-btn')) {
      // Khi người dùng chọn một thể loại gợi ý
      const suggestedGenre = e.target.dataset.genre;
  
      // Thêm thể loại gợi ý vào mảng selectedGenres
      if (!selectedGenres.includes(suggestedGenre)) {
        selectedGenres.push(suggestedGenre);
      }
  
      // Lọc phim theo tất cả các thể loại trong selectedGenres
      filterMovies(selectedGenres);
    }
  });
  
  function getSuggestedGenres(baseGenre) {
    // Lọc các thể loại liên quan từ dữ liệu luật
    const suggested = rules
      .filter(rule => rule.antecedents.split(',').map(g => g.trim()).includes(baseGenre))
      .sort((a, b) => b.confidence - a.confidence)  // Sắp xếp theo confidence giảm dần
      .map(rule => rule.consequents);  // Chỉ lấy các thể loại gợi ý
  
    return [...new Set(suggested)];  // Trả về các thể loại gợi ý không trùng lặp
  }
  
  function showSuggestedGenres(genres) {
    const box = document.getElementById('suggested-genres');
    if (!box) return;
  
    if (genres.length === 0) {
      box.innerHTML = '';
      return;
    }
  
    box.innerHTML = `
      <div class="text-sm">
        <span class="text-gray-400">Thể loại thường đi kèm:</span>
        <div class="mt-2 flex flex-wrap gap-2">
          ${genres.map(g => `
            <button class="suggest-btn px-3 py-1 bg-gray-700 text-white rounded hover:bg-purple-600 transition" data-genre="${g}">
              ${g}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  


  // Hiển thị phim đã lọc
  function displayMovies(movies) {
    // Hàm hiển thị danh sách phim đã lọc ra
    const movieContainer = document.getElementById('movie-list');
    movieContainer.innerHTML = movies.map(movie => `
      <div class="movie-item">
        <h3>${movie.title}</h3>
        <p>${movie.description}</p>
      </div>
    `).join('');
  }