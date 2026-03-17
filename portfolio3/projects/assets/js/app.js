// WW Portfolio handoff - minimal interactions
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('[data-filter]');
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    // Placeholder: hook this into project filtering (tags/categories)
  }));

  // Handle smooth navigation for internal links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.includes('mailto:')) return;

    e.preventDefault();

    // Load the page content
    fetch(href)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main.page');

        if (newMain) {
          const currentMain = document.querySelector('main.page');
          currentMain.innerHTML = newMain.innerHTML;

          // Update page title
          const newTitle = doc.querySelector('title');
          if (newTitle) {
            document.title = newTitle.textContent;
          }

          // Update URL without reload
          history.pushState(null, '', href);

          // Re-initialize any scripts or event listeners if needed
          // For now, we'll assume the content doesn't need re-initialization
        }
      })
      .catch(error => {
        console.error('Error loading page:', error);
        // Fallback to normal navigation
        window.location.href = href;
      });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    // Reload the page for back/forward navigation
    window.location.reload();
  });
});

// WW Portfolio handoff - minimal interactions
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('[data-filter]');
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    // Placeholder: hook this into project filtering (tags/categories)
  }));
});

