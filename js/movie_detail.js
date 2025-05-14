let allMovies = [];  // Thêm biến toàn cục để chứa tất cả các phim
    let filteredMovies = [];
    let filterPage = 0;
    const FILTER_PER_PAGE = 20;
    let isFiltering = false;
    function getPosterPath(movieId) {
      const posterPath = `assets/images/posters/${movieId}.jpg`;
      return posterPath;
    }
    function renderMovies() {
      // Hiển thị kết quả tìm kiếm vào khu vực top-rated-movies
      const container = document.getElementById("top-rated-movies");
      if (filteredMovies.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 col-span-4 py-8">Không tìm thấy phim nào phù hợp.</div>`;
        return;
      }
      
    }
    function loadMovieData() {
      fetch('data/movies.json')
        .then(res => res.json())
        .then(movies => {
          allMovies = movies;
          filteredMovies = movies;  // Gán filteredMovies để sử dụng cho tìm kiếm
          renderMovies(); 
        });
    }
    // Cho phép nhấn Enter để tìm kiếm
    document.getElementById('search-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('search-btn').click();
      }
    });
    // Hàm xử lý sự kiện tìm kiếm
    document.getElementById('search-btn').addEventListener('click', function(e) {
      e.preventDefault();
      const keyword = document.getElementById('search-input').value.trim().toLowerCase();
      if (!keyword) return;
      filteredMovies = results;
      renderMovies();
    });
    function renderFiltered() {
      const container = document.getElementById("top-rated-movies");
      const start = filterPage * FILTER_PER_PAGE;
      const end = start + FILTER_PER_PAGE;
      const current = filteredMovies.slice(start, end);
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
    document.addEventListener('DOMContentLoaded', loadMovieData);
    const searchInput = document.getElementById('search-input');
    const searchSuggestion = document.getElementById('search-suggestion');
    searchInput.addEventListener('input', function() {
      const keyword = this.value.trim().toLowerCase();
      if (!keyword) {
        searchSuggestion.classList.add('hidden');
        return;
      }
      // Tìm phim theo tên
      const movieResults = allMovies.filter(movie =>
        movie.original_title && movie.original_title.toLowerCase().includes(keyword)
      ).slice(0, 5); // Giới hạn 5 phim
      // Render kết quả tìm kiếm
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
      // Nếu không có kết quả
      if (!html) {
        html = `<div class="p-4 text-gray-400 text-center">Không tìm thấy kết quả</div>`;
      }
      searchSuggestion.innerHTML = html;
      searchSuggestion.classList.remove('hidden');
    });
    // Ẩn popup khi click ra ngoài
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !searchSuggestion.contains(e.target)) {
        searchSuggestion.classList.add('hidden');
      }
    });
    document.addEventListener('DOMContentLoaded', function() {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user && user.fullname) {
        document.getElementById('greeting').textContent = `Xin chào, ${user.fullname}`;
      }
    });

    // Hàm lấy đường dẫn poster từ movie.id
    function getPosterPath(movieId) {
      return `assets/images/posters/${movieId}.jpg`;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = Number(urlParams.get('id'));
    fetch('data/movies.json')
      .then(response => response.json())
      .then(movies => {
        const movie = movies.find(m => m.id === movieId);

        if (!movie) {
          document.getElementById('movie-detail').innerHTML = '<p>Không tìm thấy phim.</p>';
          return;
        }
        const formatMoney = num => Number(num).toLocaleString('vi-VN', { style: 'currency', currency: 'USD' });
        const genres = (movie.genres || []).map(g => g.name).join(', ');
        const productionCompanies = (movie.production_companies || []).join(', ');
        const cast = (movie.cast || []).map(actor => actor.name).join(', ');
        const crew = movie.crew ? `${movie.crew.name} (ID: ${movie.crew.id})` : 'Không rõ';
        // Gán hình ảnh poster từ movie.id
        const posterPath = getPosterPath(movie.id);
        const posterImg = document.getElementById('movie-poster');
        posterImg.src = posterPath;

         // Gọi API dự đoán doanh thu cho từng phim
          getPredictedRevenue(movie.id);

        // Hiển thị thông tin chi tiết phim
        document.getElementById('movie-detail').innerHTML = `
          <h1 class="text-3xl font-bold mb-4">${movie.original_title} (${movie.release_year})</h1>
          <p><strong>Ngôn ngữ gốc:</strong> ${movie.original_language}</p>
          <p><strong>Ngày phát hành:</strong> ${movie.release_date}</p>
          <p><strong>Thể loại:</strong> ${genres}</p>
          <p><strong>Hãng sản xuất:</strong> ${productionCompanies}</p>
          <p><strong>Thời lượng:</strong> ${movie.runtime} phút</p>
          <p><strong>Kinh phí:</strong> ${Math.round(movie.budget).toLocaleString('vi-VN')}$</p>
          <p><strong>Doanh thu:</strong> ${Math.round(movie.revenue).toLocaleString('vi-VN')}$</p>
          <p><strong>Độ phổ biến:</strong> ${movie.popularity}</p>
          <p><strong>Điểm đánh giá:</strong> ${movie.vote_average} (${movie.vote_count} lượt đánh giá)</p>
          <p><strong>Diễn viên:</strong> ${cast}</p>
          <p><strong>Đạo diễn:</strong> ${crew}</p>
          <div class="movie-card" id="movie-${movie.id}">
            <p><strong>Dự đoán doanh thu:</strong> <span id="revenue-${movie.id}">Đang tải...</span></p>
          </div>
          <br/><br/>
          <div class="flex justify-center">
            <a href="#" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-20 py-4 rounded-lg text-base">
              Xem phim
            </a>
          </div>        `;
      })
      .catch(error => {
        document.getElementById('movie-detail').innerHTML = '<p class="text-red-500">Lỗi tải dữ liệu phim.</p>';
        console.error(error);
      });



function getPredictedRevenue(movieId) {
  fetch(`http://127.0.0.1:5000/predict_revenue/${movieId}`)
    .then(response => {
      if (!response.ok) throw new Error("Không tìm thấy phim hoặc lỗi server");
      return response.json();
    })
    .then(data => {
      const revenue = Math.round(data.predicted_revenue).toLocaleString('vi-VN')+'$';
      document.getElementById(`revenue-${movieId}`).innerText = revenue;
    })
    .catch(error => {
      document.getElementById(`revenue-${movieId}`).innerText = 'Không thể dự đoán';
      console.error(error);
    });
}


