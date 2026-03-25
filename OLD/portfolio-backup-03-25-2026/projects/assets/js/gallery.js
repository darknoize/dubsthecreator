// Project gallery (slideshow + modal)
window.galleryInit = function() {
  // ...existing code...
  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const viewportImg = root.querySelector('[data-gallery-main]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');
  const thumbsTrack = root.querySelector('.gallery-thumbs');
  const thumbButtons = Array.from(root.querySelectorAll('[data-thumb]'));

  const modal = document.querySelector('[data-modal]');
  const modalImg = modal?.querySelector('[data-modal-img]');
  const modalBody = modal?.querySelector('.modal-body');
  const modalPrev = modal?.querySelector('[data-modal-prev]');
  const modalNext = modal?.querySelector('[data-modal-next]');
  const modalClose = modal?.querySelector('[data-modal-close]');
  const modalBackdrop = modal?.querySelector('[data-modal-backdrop]');

  if (!viewportImg || thumbButtons.length === 0) return;

  const images = thumbButtons.map(btn => btn.getAttribute('data-full'));
  let index = 0;

  function ensureRotateHint(container) {
    if (!container) return null;

    let hint = container.querySelector('.rotate-hint');
    if (hint) return hint;

    hint = document.createElement('div');
    hint.className = 'rotate-hint';
    hint.hidden = true;
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<span class="rotate-hint__icon">↻</span><span class="rotate-hint__text">Rotate device for full size</span>';
    container.appendChild(hint);
    return hint;
  }

  const viewportHint = ensureRotateHint(viewportImg.closest('.gallery-viewport'));
  const modalHint = ensureRotateHint(modalBody);

  function isPortraitMobileViewport() {
    return window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches;
  }

  function isLandscapeImage(img) {
    if (!img?.naturalWidth || !img?.naturalHeight) {
      return false;
    }

    return img.naturalWidth / img.naturalHeight >= 1.18;
  }

  function syncRotateHint(img, hint) {
    if (!img || !hint) return;

    const applyState = () => {
      hint.hidden = !(isPortraitMobileViewport() && isLandscapeImage(img));
    };

    hint.hidden = true;

    if (img.complete && img.naturalWidth) {
      applyState();
      return;
    }

    img.addEventListener('load', applyState, { once: true });
    img.addEventListener('error', () => {
      hint.hidden = true;
    }, { once: true });
  }

  function syncAllRotateHints() {
    syncRotateHint(viewportImg, viewportHint);
    syncRotateHint(modalImg, modalHint);
  }

  function getProjectName() {
    // Extract project name from the first image path
    const pathParts = images[0]?.split('/') || [];
    const projectFolder = pathParts[pathParts.length - 2] || 'Project';
    return projectFolder.charAt(0).toUpperCase() + projectFolder.slice(1);
  }

  function syncThumbOverflowState() {
    if (!thumbsTrack) {
      return false;
    }

    const overflowing = thumbsTrack.scrollWidth - thumbsTrack.clientWidth > 1;
    thumbsTrack.classList.toggle('is-centered', !overflowing);
    return overflowing;
  }

  function alignActiveThumb(behavior = 'smooth') {
    const activeThumb = thumbButtons[index];
    if (!thumbsTrack || !activeThumb) {
      return;
    }

    const overflowing = syncThumbOverflowState();
    if (!overflowing) {
      thumbsTrack.scrollTo({
        left: 0,
        behavior: 'auto',
      });
      return;
    }

    const trackLeft = thumbsTrack.scrollLeft;
    const trackRight = trackLeft + thumbsTrack.clientWidth;
    const thumbLeft = activeThumb.offsetLeft;
    const thumbRight = thumbLeft + activeThumb.offsetWidth;

    if (thumbLeft < trackLeft) {
      thumbsTrack.scrollTo({
        left: thumbLeft,
        behavior,
      });
      return;
    }

    if (thumbRight > trackRight) {
      thumbsTrack.scrollTo({
        left: thumbRight - thumbsTrack.clientWidth,
        behavior,
      });
    }
  }

  function setActive(i, thumbBehavior = 'smooth') {
    index = (i + images.length) % images.length;
    const src = images[index];
    if (viewportImg && src) {
      viewportImg.src = src;
      const projectName = getProjectName();
      viewportImg.alt = `${projectName} project image ${index + 1}`;
      syncRotateHint(viewportImg, viewportHint);
    }
    thumbButtons.forEach((b, bi) => b?.classList?.toggle('active', bi === index));
    alignActiveThumb(thumbBehavior);
  }

  function openModal(i = index) {
    if (!modal || !modalImg) return;
    setActive(i, 'smooth');
    const src = images[index];
    if (src) {
      modalImg.src = src;
      const projectName = getProjectName();
      modalImg.alt = `${projectName} project image ${index + 1} (expanded)`;
      syncRotateHint(modalImg, modalHint);
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
    if (modalHint) {
      modalHint.hidden = true;
    }
  }

  function modalSet(i) {
    setActive(i, 'smooth');
    if (modalImg) {
      const src = images[index];
      if (src) {
        modalImg.src = src;
        const projectName = getProjectName();
        modalImg.alt = `${projectName} project image ${index + 1} (expanded)`;
        syncRotateHint(modalImg, modalHint);
      }
    }
  }

  // Add event listeners with null checks
  if (prevBtn) prevBtn.addEventListener('click', () => setActive(index - 1, 'smooth'));
  if (nextBtn) nextBtn.addEventListener('click', () => setActive(index + 1, 'smooth'));

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

  window.addEventListener('resize', syncAllRotateHints, { passive: true });
  window.addEventListener('resize', () => {
    syncThumbOverflowState();
    alignActiveThumb('auto');
  }, { passive: true });

  // Initialize gallery after a short delay to ensure images are ready
  setTimeout(() => setActive(0, 'auto'), 100);
};
// Run on initial load
document.addEventListener('DOMContentLoaded', window.galleryInit);
