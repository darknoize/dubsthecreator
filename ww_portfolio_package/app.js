(function(){
  const chips = Array.from(document.querySelectorAll('[data-chip]'));
  const cards = Array.from(document.querySelectorAll('[data-tags]'));
  function setActive(key){
    chips.forEach(c => c.setAttribute('aria-selected', c.dataset.chip === key ? 'true':'false'));
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
      card.style.display = (key === 'all' || tags.includes(key)) ? '' : 'none';
    });
  }
  chips.forEach(c => c.addEventListener('click', ()=> setActive(c.dataset.chip)));
  setActive('all');
})();
