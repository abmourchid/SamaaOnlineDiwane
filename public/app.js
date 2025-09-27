// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const titlesList = document.getElementById('titlesList');
  const poemDetail = document.getElementById('poemDetail');
  const poemTitle = document.getElementById('poemTitle');
  const poemContent = document.getElementById('poemContent');
  const backBtn = document.getElementById('backBtn');

  // Function to load poem titles
  /*
  function loadTitles(query = '') {
    const url = query ? `/api/search?q=${encodeURIComponent(query)}` : '/api/poems';
    fetch(url)
      .then(response => response.json())
      .then(titles => {
        titlesList.innerHTML = '<ul>' + titles.map(title => `<li onclick="showPoem('${title}')">${title}</li>`).join('') + '</ul>';
      })
      .catch(err => {
        console.error(err);
        titlesList.innerHTML = '<p>خطأ في تحميل القصائد</p>';
      });
  }
*/
 // Function to load poem titles
function loadTitles(query = '') {
  if (typeof query !== 'string') query = ''; // Ensure query is a string
  const url = query.trim() ? `/api/search?q=${encodeURIComponent(query.trim())}` : '/api/poems';
  fetch(url)
    .then(response => response.json())
    .then(titles => {
      titlesList.innerHTML = '<ul>' + titles.map(title => `<li onclick="showPoem('${title}')">${title}</li>`).join('') + '</ul>';
    })
    .catch(err => {
      console.error(err);
      titlesList.innerHTML = '<p>خطأ في تحميل القصائد</p>';
    });
}

  // Initial load
  loadTitles();

  // Search button click
  searchBtn.addEventListener('click', () => {
    loadTitles(searchInput.value);
  });
/*
  // Show poem detail
  window.showPoem = function(title) {
    fetch(`/api/poem?title=${encodeURIComponent(title)}`)
      .then(response => response.json())
      .then(data => {
        poemTitle.textContent = title;
        poemContent.textContent = data.content;
        titlesList.classList.add('hidden');
        poemDetail.classList.remove('hidden');
      })
      .catch(err => {
        console.error(err);
        alert('خطأ في تحميل القصيدة');
      });
  };
*/
    // Show poem detail
    window.showPoem = function(title) {
    if (!title || typeof title !== 'string') {
        alert('عنوان القصيدة غير صالح');
        return;
    }
    fetch(`/api/poem?title=${encodeURIComponent(title.trim())}`)
        .then(response => response.json())
        .then(data => {
        poemTitle.textContent = title;
        poemContent.textContent = data.content;
        titlesList.classList.add('hidden');
        poemDetail.classList.remove('hidden');
        })
        .catch(err => {
        console.error(err);
        alert('خطأ في تحميل القصيدة');
        });
    };

  // Back button to list
  backBtn.addEventListener('click', () => {
    poemDetail.classList.add('hidden');
    titlesList.classList.remove('hidden');
    loadTitles(searchInput.value); // Reload with current search
  });
});