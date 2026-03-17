// Scroll button functionality for iPhone preview
document.addEventListener('DOMContentLoaded', () => {
  // Outcomes phone
  const upBtn = document.getElementById('mobileScrollUp');
  const downBtn = document.getElementById('mobileScrollDown');
  const viewport = document.getElementById('viewport');

  if (upBtn && downBtn && viewport) {
    upBtn.addEventListener('click', () => {
      viewport.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtn.addEventListener('click', () => {
      viewport.scrollBy({ top: 200, behavior: 'smooth' });
    });

    // Optional: pointer events for touch devices
    upBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewport.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewport.scrollBy({ top: 200, behavior: 'smooth' });
    });
  }

  // Overview phone
  const upBtnOverview = document.getElementById('mobileScrollUpOverview');
  const downBtnOverview = document.getElementById('mobileScrollDownOverview');
  const viewportOverview = document.getElementById('viewport-overview');

  if (upBtnOverview && downBtnOverview && viewportOverview) {
    upBtnOverview.addEventListener('click', () => {
      viewportOverview.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnOverview.addEventListener('click', () => {
      viewportOverview.scrollBy({ top: 200, behavior: 'smooth' });
    });

    // Optional: pointer events for touch devices
    upBtnOverview.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportOverview.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnOverview.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportOverview.scrollBy({ top: 200, behavior: 'smooth' });
    });
  }

  // Examples left phone
  const upBtnExamplesLeft = document.getElementById('mobileScrollUpExamplesLeft');
  const downBtnExamplesLeft = document.getElementById('mobileScrollDownExamplesLeft');
  const viewportExamplesLeft = document.getElementById('viewport-examples-left');

  if (upBtnExamplesLeft && downBtnExamplesLeft && viewportExamplesLeft) {
    upBtnExamplesLeft.addEventListener('click', () => {
      viewportExamplesLeft.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnExamplesLeft.addEventListener('click', () => {
      viewportExamplesLeft.scrollBy({ top: 200, behavior: 'smooth' });
    });

    upBtnExamplesLeft.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportExamplesLeft.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnExamplesLeft.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportExamplesLeft.scrollBy({ top: 200, behavior: 'smooth' });
    });
  }

  // Examples right phone
  const upBtnExamplesRight = document.getElementById('mobileScrollUpExamplesRight');
  const downBtnExamplesRight = document.getElementById('mobileScrollDownExamplesRight');
  const viewportExamplesRight = document.getElementById('viewport-examples-right');

  if (upBtnExamplesRight && downBtnExamplesRight && viewportExamplesRight) {
    upBtnExamplesRight.addEventListener('click', () => {
      viewportExamplesRight.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnExamplesRight.addEventListener('click', () => {
      viewportExamplesRight.scrollBy({ top: 200, behavior: 'smooth' });
    });

    upBtnExamplesRight.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportExamplesRight.scrollBy({ top: -200, behavior: 'smooth' });
    });

    downBtnExamplesRight.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      viewportExamplesRight.scrollBy({ top: 200, behavior: 'smooth' });
    });
  }
});