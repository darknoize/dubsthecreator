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

  const images = thumbButtons.map(btn => btn.getAttribute('data-full'));
  let index = 0;

  function setActive(i) {
    index = (i + images.length) % images.length;
    const src = images[index];
    viewportImg.src = src;
    viewportImg.alt = `PICEUS project image ${index + 1}`;
    thumbButtons.forEach((b, bi) => b.classList.toggle('active', bi === index));
  }

  function openModal(i = index) {
    if (!modal || !modalImg) return;
    setActive(i);
    modalImg.src = images[index];
    modalImg.alt = `PICEUS project image ${index + 1} (expanded)`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function modalSet(i) {
    setActive(i);
    if (modalImg) {
      modalImg.src = images[index];
      modalImg.alt = `PICEUS project image ${index + 1} (expanded)`;
    }
  }

  prevBtn?.addEventListener('click', () => setActive(index - 1));
  nextBtn?.addEventListener('click', () => setActive(index + 1));

  thumbButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => openModal(i));
  });

  viewportImg?.addEventListener('click', () => openModal(index));
  if (viewportImg) viewportImg.style.cursor = 'zoom-in';

  modalPrev?.addEventListener('click', () => modalSet(index - 1));
  modalNext?.addEventListener('click', () => modalSet(index + 1));
  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') modalSet(index - 1);
    if (e.key === 'ArrowRight') modalSet(index + 1);
  });

  setActive(0);
});
