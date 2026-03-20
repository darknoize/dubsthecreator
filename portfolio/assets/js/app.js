// WW Portfolio handoff - minimal interactions
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('[data-filter]');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((item) => item.classList.remove('active'));
      pill.classList.add('active');
      // Placeholder: hook this into project filtering (tags/categories)
    });
  });

  const centerFilterTag = (filterRow, tag, behavior = 'auto') => {
    if (!tag) {
      return;
    }

    const maxScrollLeft = filterRow.scrollWidth - filterRow.clientWidth;
    const targetLeft = tag.offsetLeft - (filterRow.clientWidth - tag.offsetWidth) / 2;
    const nextScrollLeft = Math.min(Math.max(targetLeft, 0), Math.max(maxScrollLeft, 0));

    filterRow.scrollTo({
      left: nextScrollLeft,
      behavior,
    });
  };

  const centerActiveFilter = (filterRow, behavior = 'auto') => {
    const activeTag = filterRow.querySelector('.tag-lrg.active');
    centerFilterTag(filterRow, activeTag, behavior);
  };

  const filterRows = document.querySelectorAll('.filters');
  filterRows.forEach((filterRow) => {
    requestAnimationFrame(() => centerActiveFilter(filterRow));

    window.addEventListener('load', () => centerActiveFilter(filterRow));

    filterRow.querySelectorAll('.tag-lrg').forEach((tag) => {
      tag.addEventListener('focus', () => {
        // Keep keyboard navigation in view without hijacking pointer clicks.
        if (!tag.matches(':focus-visible')) {
          return;
        }

        centerFilterTag(filterRow, tag, 'smooth');
      });
    });
  });
});
