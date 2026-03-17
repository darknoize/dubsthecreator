(() => {
  const viewport = document.getElementById('viewport');
  const btnUp = document.getElementById('mobileScrollUp');
  const btnDown = document.getElementById('mobileScrollDown');

  // Responsive step: ~8% of visible screen, clamped to sane bounds
  function stepPx(){
    const v = viewport.clientHeight || 600;
    return Math.max(64, Math.min(140, Math.round(v * 0.08)));
  }

  function scrollByStep(dir){
    viewport.scrollBy({ top: stepPx() * dir, left: 0, behavior: 'smooth' });
  }

  btnUp.addEventListener('click', () => scrollByStep(-1));
  btnDown.addEventListener('click', () => scrollByStep(1));

  // Hold-to-scroll behavior
  let holdTimer = null;
  function startHold(dir){
    stopHold();
    holdTimer = setInterval(() => {
      viewport.scrollBy({ top: 18 * dir, left: 0, behavior: 'auto' });
    }, 16); // ~60fps
  }
  function stopHold(){
    if (holdTimer) clearInterval(holdTimer);
    holdTimer = null;
  }

  [[-1, btnUp], [1, btnDown]].forEach(([dir, el]) => {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startHold(dir);
    });
  });

  ['pointerup','pointercancel','pointerleave'].forEach(evt => {
    btnUp.addEventListener(evt, stopHold);
    btnDown.addEventListener(evt, stopHold);
  });

  // Keyboard support when viewport focused
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); scrollByStep(1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); scrollByStep(-1); }
    if (e.key === 'Home') { e.preventDefault(); viewport.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.key === 'End') { e.preventDefault(); viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' }); }
  });

  const img = document.getElementById('screenImage');
  img.addEventListener('error', () => {
    console.warn('Missing image asset at assets/screen.png. Replace it with your tall screenshot.');
  });
})();
