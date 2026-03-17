// Project gallery (slideshow + modal)
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const viewportImg = root.querySelector('[data-gallery-main]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const thumbButtons = Array.from(root.querySelectorAll('[data-thumb]'));

  const modal = document.querySelector('[data-modal]');
  const modalImg = modal?.querySelector('[data-modal-img]');
  const modalPrev = modal?.querySelector('[data-modal-prev]');
  const modalNext = modal?.querySelector('[data-modal-next]');
  const modalClose = modal?.querySelector('[data-modal-close]');
  const modalBackdrop = modal?.querySelector('[data-modal-backdrop]');

  if (!viewportImg || thumbButtons.length === 0) return;

  const images = thumbButtons.map(btn => btn.getAttribute('data-full'));
  let index = 0;

  function getProjectName() {
    // Extract project name from the first image path
    const pathParts = images[0]?.split('/') || [];
    const projectFolder = pathParts[pathParts.length - 2] || 'Project';
    return projectFolder.charAt(0).toUpperCase() + projectFolder.slice(1);
  }

  function setActive(i) {
    index = (i + images.length) % images.length;
    const src = images[index];
    if (viewportImg && src) {
      viewportImg.src = src;
      const projectName = getProjectName();
      viewportImg.alt = `${projectName} project image ${index + 1}`;
    }
    thumbButtons.forEach((b, bi) => b?.classList?.toggle('active', bi === index));
  }

  function openModal(i = index) {
    if (!modal || !modalImg) return;
    setActive(i);
    const src = images[index];
    if (src) {
      modalImg.src = src;
      const projectName = getProjectName();
      modalImg.alt = `${projectName} project image ${index + 1} (expanded)`;
    }

    // Update modal title
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
      const projectName = getProjectName();
      modalTitle.textContent = `${projectName} • Image Viewer`;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function modalSet(i) {
    setActive(i);
    if (modalImg) {
      const src = images[index];
      if (src) {
        modalImg.src = src;
        const projectName = getProjectName();
        modalImg.alt = `${projectName} project image ${index + 1} (expanded)`;
      }
    }
  }

  // Add event listeners with null checks
  if (prevBtn) prevBtn.addEventListener('click', () => setActive(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setActive(index + 1));

  thumbButtons.forEach((btn, i) => {
    if (btn) btn.addEventListener('click', () => openModal(i));
  });

  if (viewportImg) {
    viewportImg.addEventListener('click', () => openModal(index));
    viewportImg.style.cursor = 'zoom-in';
  }

  if (modalPrev) modalPrev.addEventListener('click', () => modalSet(index - 1));
  if (modalNext) modalNext.addEventListener('click', () => modalSet(index + 1));
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') modalSet(index - 1);
    if (e.key === 'ArrowRight') modalSet(index + 1);
  });

  // Initialize gallery after a short delay to ensure images are ready
  setTimeout(() => setActive(0), 100);
});
