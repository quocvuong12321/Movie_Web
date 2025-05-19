let allMovies = []; // Dữ liệu tất cả các bộ phim
let filteredMovies = []; // Dữ liệu phim sau khi lọc
let currentPage = 1; // Trang hiện tại
const moviesPerPage = 20; // Số phim trên mỗi trang
let allGenres = new Set();
let allYears = new Set();
let allCountries = new Set();
let selectedGenres = []; // Mảng chứa các thể loại đã chọn
let rules = []; // Mảng chứa các luật kết hợp

// Mapping từ mã ngôn ngữ sang tên quốc gia
const languageToCountry = {
  'en': 'Anh, Mỹ',
  'vi': 'Việt Nam',
  'ja': 'Nhật Bản',
  'ko': 'Hàn Quốc',
  'zh': 'Trung Quốc',
  'fr': 'Pháp',
  'de': 'Đức',
  'es': 'Tây Ban Nha',
  'it': 'Ý',
  'ru': 'Nga',
  'hi': 'Ấn Độ',
  'th': 'Thái Lan',
  'id': 'Indonesia',
  'ms': 'Malaysia',
  'tl': 'Philippines'
};

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
  // Hiển thị thông báo đang tải
  const container = document.getElementById("movie-container");
  if (container) {
    container.innerHTML = '<div class="text-center text-gray-400">Đang tải dữ liệu phim...</div>';
  }

  fetch('data/movies.json')
    .then(res => {
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu phim');
      }
      return res.json();
    })
    .then(movies => {
      if (!Array.isArray(movies) || movies.length === 0) {
        throw new Error('Dữ liệu phim không hợp lệ');
      }

      allMovies = movies;
      movies.forEach(m => {
        m.vote_average = parseFloat(m.vote_average) || 0;
        if (m.genres) {
          m.genres.forEach(g => allGenres.add(g.name));
        }
        if (m.release_year) {
          allYears.add(m.release_year);
        }
        if (m.original_language && languageToCountry[m.original_language]) {
          allCountries.add(languageToCountry[m.original_language]);
        }
      });

      // Render các dropdown
      renderGenreDropdown();
      renderYearDropdown();
      renderCountryDropdown();

      // Khởi tạo danh sách phim
      filteredMovies = [...allMovies];
      renderMovies();

      // Áp dụng bộ lọc từ URL nếu có
      applyFiltersFromURL();
    })
    .catch(error => {
      console.error('Lỗi khi tải dữ liệu:', error);
      if (container) {
        container.innerHTML = `<div class="text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu phim: ${error.message}</div>`;
      }
    });
}

function renderGenreDropdown() {
  const dropdown = document.getElementById("genre-filter");
  if (dropdown) {
    dropdown.innerHTML = `<option value="all">Tất cả thể loại</option>` +
      Array.from(allGenres).sort().map(g => `<option value="${g}">${g}</option>`).join('');
  }
}

function renderYearDropdown() {
  const yearSelect = document.getElementById("year-filter");
  if (yearSelect) {
    yearSelect.innerHTML = `<option value="all">Tất cả năm</option>` +
      Array.from(allYears).sort().map(y => `<option value="${y}">${y}</option>`).join('');
  }
}

function renderCountryDropdown() {
  const dropdown = document.getElementById("country-filter");
  if (dropdown) {
    // Thêm tất cả các quốc gia vào dropdown
    const countries = Array.from(allCountries).sort();
    dropdown.innerHTML = `
      <option value="all">Tất cả quốc gia</option>
      ${countries.map(country => `
        <option value="${country}">${country}</option>
      `).join('')}
    `;
  }
}

function filterMovies() {
  const genreFilter = document.getElementById("genre-filter");
  const yearFilter = document.getElementById("year-filter");
  const countryFilter = document.getElementById("country-filter");

  if (!genreFilter || !yearFilter || !countryFilter) {
    console.error("Không tìm thấy các phần tử filter");
    return;
  }

  const selectedGenre = genreFilter.value;
  const selectedYear = yearFilter.value;
  const selectedCountry = countryFilter.value;

  // Tạo URL mới với các tham số
  let newUrl = new URL(window.location.href);
  let params = newUrl.searchParams;

  // Xóa tất cả các tham số cũ
  params.delete('genre');
  params.delete('year');
  params.delete('country');
  params.delete('genres');

  // Thêm các tham số mới nếu không phải là "all"
  if (selectedGenre !== "all") {
    params.set('genre', selectedGenre);
  }
  if (selectedYear !== "all") {
    params.set('year', selectedYear);
  }
  if (selectedCountry !== "all") {
    params.set('country', selectedCountry);
  }
  if (selectedGenres.length > 0) {
    params.set('genres', selectedGenres.join(','));
  }

  // Cập nhật URL mà không reload trang
  window.history.replaceState({}, '', newUrl.toString());

  // Lọc phim
  filteredMovies = allMovies.filter(movie => {
    // Kiểm tra năm phát hành
    const matchYear = selectedYear === "all" || movie.release_year == selectedYear;
    
    // Kiểm tra quốc gia
    const matchCountry = selectedCountry === "all" || 
      (movie.original_language && languageToCountry[movie.original_language] === selectedCountry);

    // Kiểm tra thể loại
    let matchGenre = true;
    if (selectedGenre !== "all") {
      matchGenre = movie.genres && movie.genres.some(g => g.name === selectedGenre);
    }

    // Kiểm tra các thể loại đi kèm
    let matchSelectedGenres = true;
    if (selectedGenres.length > 0) {
      matchSelectedGenres = selectedGenres.every(genre => 
        movie.genres && movie.genres.some(g => g.name === genre)
      );
    }

    // Kết hợp tất cả các điều kiện
    return matchYear && matchCountry && matchGenre && matchSelectedGenres;
  });

  // Cập nhật tiêu đề section
  const sectionTitle = document.getElementById('section-title');
  if (sectionTitle) {
    let title = "Phim theo thể loại";
    if (selectedGenre !== "all") {
      title = `Phim theo thể loại: ${selectedGenre}`;
      if (selectedGenres.length > 0) {
        title += ` + ${selectedGenres.join(', ')}`;
      }
    }
    if (selectedCountry !== "all") {
      title = `Phim ${selectedCountry}`;
    }
    sectionTitle.textContent = title;
  }

  // Hiển thị số lượng phim đã lọc
  const resultText = document.getElementById('filter-result');
  if (resultText) {
    resultText.textContent = `Tìm thấy ${filteredMovies.length} phim`;
  }

  currentPage = 1;
  renderMovies();
}

function renderMovies() {
  const container = document.getElementById("movie-container");
  if (!container) return;

  if (filteredMovies.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400">Không tìm thấy phim nào phù hợp với bộ lọc</div>';
    return;
  }

  const start = (currentPage - 1) * moviesPerPage;
  const end = start + moviesPerPage;
  const currentMovies = filteredMovies.slice(start, end);
  
  container.innerHTML = currentMovies.map(m => createMovieCard(m)).join('');
  
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

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

function getSuggestedGenres(baseGenre) {
  if (!rules || rules.length === 0) return [];
  
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
          <button class="suggest-btn px-3 py-1 ${selectedGenres.includes(g) ? 'bg-purple-600' : 'bg-gray-700'} text-white rounded hover:bg-purple-600 transition" data-genre="${g}">
            ${g}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function addGenre(genre) {
  if (!selectedGenres.includes(genre)) {
    selectedGenres.push(genre);
  } else {
    selectedGenres = selectedGenres.filter(g => g !== genre);
  }

  // Cập nhật URL
  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (selectedGenres.length > 0) {
    params.set('genres', selectedGenres.join(','));
  } else {
    params.delete('genres');
  }
  window.history.replaceState({}, '', url.toString());

  // Cập nhật UI và lọc lại phim
  const baseGenre = document.getElementById('genre-filter').value;
  if (baseGenre !== 'all') {
    showSuggestedGenres(getSuggestedGenres(baseGenre));
  }
  filterMovies();
}

function applyFiltersFromURL() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  // Lấy các tham số từ URL
  const genre = params.get('genre');
  const year = params.get('year');
  const country = params.get('country');
  const genres = params.get('genres');

  // Áp dụng các giá trị vào các dropdown
  if (genre) {
    document.getElementById("genre-filter").value = genre;
  }
  if (year) {
    document.getElementById("year-filter").value = year;
  }
  if (country) {
    document.getElementById("country-filter").value = country;
  }
  
  // Khôi phục các thể loại đã chọn từ URL
  if (genres) {
    selectedGenres = genres.split(',');
  }

  // Áp dụng bộ lọc nếu có tham số
  if (genre || year || country || genres) {
    filterMovies();
  }
}

// Đợi DOM load xong trước khi thực thi
document.addEventListener('DOMContentLoaded', function() {
  // Tải dữ liệu phim
  loadMovieData();

  // Tải dữ liệu luật kết hợp
  fetch('data/association_rules.json')
    .then(res => res.json())
    .then(data => {
      rules = data;
    })
    .catch(error => {
      console.error('Lỗi khi tải dữ liệu luật:', error);
    });

  // Thêm event listeners cho các nút filter
  const filterBtn = document.getElementById('filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', filterMovies);
  }

  // Thêm event listener cho genre filter
  const genreFilter = document.getElementById('genre-filter');
  if (genreFilter) {
    genreFilter.addEventListener('change', (e) => {
      const selectedGenre = e.target.value;
      
      // Nếu chọn "Tất cả thể loại"
      if (selectedGenre === "all") {
        selectedGenres = [];
        // Reset màu sắc của các nút thể loại gợi ý
        document.querySelectorAll('.suggest-btn').forEach(btn => {
          btn.classList.remove('bg-purple-600');
          btn.classList.add('bg-gray-700');
        });
        // Xóa phần hiển thị thể loại gợi ý
        const suggestedBox = document.getElementById('suggested-genres');
        if (suggestedBox) {
          suggestedBox.innerHTML = '';
        }
        const sectionTitle = document.getElementById('section-title');
        if (sectionTitle) {
          sectionTitle.textContent = "Phim theo thể loại";
        }
      } else {
        // Hiển thị các thể loại đi kèm dựa trên thể loại đã chọn
        const suggested = getSuggestedGenres(selectedGenre);
        showSuggestedGenres(suggested);
      }
      
      filterMovies();
    });
  }

  // Thêm event listener cho suggested genres
  const suggestedBox = document.getElementById('suggested-genres');
  if (suggestedBox) {
    suggestedBox.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggest-btn')) {
        const suggestedGenre = e.target.dataset.genre;
        addGenre(suggestedGenre);
      }
    });
  }

  // Thêm event listeners cho các dropdown khác
  const yearFilter = document.getElementById('year-filter');
  if (yearFilter) {
    yearFilter.addEventListener('change', filterMovies);
  }

  const countryFilter = document.getElementById('country-filter');
  if (countryFilter) {
    countryFilter.addEventListener('change', filterMovies);
  }

  // Xử lý tìm kiếm
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const searchSuggestion = document.getElementById('search-suggestion');

  if (searchInput && searchBtn && searchSuggestion) {
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      if (!keyword) {
        searchSuggestion.classList.add('hidden');
        return;
      }

      // Tìm phim trong allMovies
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

    searchBtn.addEventListener('click', function(e) {
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
        searchBtn.click();
      }
    });

    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchSuggestion.contains(e.target)) {
        searchSuggestion.classList.add('hidden');
      }
    });
  }

  // Xử lý đăng nhập/đăng xuất
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const userInfoDiv = document.getElementById('user-info');
  if (userInfoDiv) {
    if (user && user.fullname) {
      userInfoDiv.innerHTML = `<span>Xin chào, <b>${user.fullname}</b></span>
        <a href="#" id="logout-btn" class="hover:text-white ml-4">Đăng xuất</a>`;
      
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.onclick = function() {
          localStorage.removeItem('currentUser');
          window.location.reload();
        };
      }
    } else {
      userInfoDiv.innerHTML = `
        <a href="index.html" class="hover:text-white">Đăng nhập</a>
        <a href="index.html" class="hover:text-white">Đăng ký</a>
      `;
    }
  }
});