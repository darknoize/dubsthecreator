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

  const centerActiveFilter = (filterRow, behavior = 'auto') => {
    const activeTag = filterRow.querySelector('.tag-lrg.active');
    if (!activeTag) {
      return;
    }

    const maxScrollLeft = filterRow.scrollWidth - filterRow.clientWidth;
    const targetLeft = activeTag.offsetLeft - (filterRow.clientWidth - activeTag.offsetWidth) / 2;
    const nextScrollLeft = Math.min(Math.max(targetLeft, 0), Math.max(maxScrollLeft, 0));

    filterRow.scrollTo({
      left: nextScrollLeft,
      behavior,
    });
  };

  const filterRows = document.querySelectorAll('.filters');
  filterRows.forEach((filterRow) => {
    requestAnimationFrame(() => centerActiveFilter(filterRow));

    window.addEventListener('load', () => centerActiveFilter(filterRow));

    filterRow.querySelectorAll('.tag-lrg').forEach((tag) => {
      tag.addEventListener('focus', () => centerActiveFilter(filterRow, 'smooth'));
    });
  });

  const readSectionsConfig = [
    {
      sectionId: 'overview',
      defaultLabel: 'Read Overview Aloud',
      activeLabel: 'Stop Reading Overview',
    },
    {
      sectionId: 'outcomes',
      defaultLabel: 'Read Outcomes Aloud',
      activeLabel: 'Stop Reading Outcomes',
    },
  ];

  const setReadButtonState = (button, isReading) => {
    button.classList.toggle('is-reading', isReading);
    button.textContent = isReading ? button.dataset.activeLabel : button.dataset.defaultLabel;
    button.setAttribute('aria-pressed', isReading ? 'true' : 'false');
  };

  const readButtons = [];

  readSectionsConfig.forEach(({ sectionId, defaultLabel, activeLabel }) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    const sectionTitle = section.querySelector('.sectionTitle');
    if (!sectionTitle) {
      return;
    }

    let button = sectionTitle.querySelector('.read-trigger[data-read-target]');
    if (!button) {
      button = document.createElement('button');
      button.className = 'read-trigger';
      sectionTitle.appendChild(button);
    }

    button.type = 'button';
    button.dataset.readTarget = sectionId;
    button.dataset.defaultLabel = defaultLabel;
    button.dataset.activeLabel = activeLabel;
    setReadButtonState(button, false);
    readButtons.push(button);
  });

  if (readButtons.length === 0) {
    return;
  }

  const canSpeak = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  if (!canSpeak) {
    readButtons.forEach((button) => {
      button.disabled = true;
      button.title = 'Read aloud is not supported in this browser.';
    });
    return;
  }

  const clearReadButtonStates = () => {
    readButtons.forEach((button) => {
      setReadButtonState(button, false);
    });
  };

  const extractReadableText = (targetId) => {
    const source = document.getElementById(targetId);
    if (!source) {
      return '';
    }

    const clone = source.cloneNode(true);
    clone.querySelectorAll('.read-trigger, script, style, [aria-hidden="true"]').forEach((el) => {
      el.remove();
    });

    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  };

  readButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isAlreadyReading = button.classList.contains('is-reading');

      if (isAlreadyReading) {
        window.speechSynthesis.cancel();
        clearReadButtonStates();
        return;
      }

      const readText = extractReadableText(button.dataset.readTarget);
      if (!readText) {
        return;
      }

      window.speechSynthesis.cancel();
      clearReadButtonStates();

      const utterance = new SpeechSynthesisUtterance(readText);
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setReadButtonState(button, true);
      };

      utterance.onend = () => {
        setReadButtonState(button, false);
      };

      utterance.onerror = () => {
        setReadButtonState(button, false);
      };

      window.speechSynthesis.speak(utterance);
    });
  });

  window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
  });
});

