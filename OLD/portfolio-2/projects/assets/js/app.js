// WW Portfolio handoff - minimal interactions
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('[data-filter]');
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    // Placeholder: hook this into project filtering (tags/categories)
  }));
});
