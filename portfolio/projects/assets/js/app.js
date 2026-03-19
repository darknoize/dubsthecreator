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
    const label = isReading ? button.dataset.activeLabel : button.dataset.defaultLabel;
    const speakerSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; margin-right:4px; vertical-align:middle;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a6 6 0 0 1 0 8.07M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
    button.innerHTML = speakerSvg + label;
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

  const normalizeSpeechText = (value) => value.replace(/\s+/g, ' ').trim();

  const applySpeechPronunciationFixes = (value) => value
    // Force known brand/domain pronunciations that default voices misread.
    .replace(/\bpiceus\b/gi, 'Pie-see-us')
    .replace(/\bcycle\b/gi, 'sigh-kull')
    .replace(/\bcyber[\s-]?security\b/gi, 'sigh-ber security')
    .replace(/\bcyber\b/gi, 'sigh-ber')
    .replace(/\bmi(?:cro|co)[\s-]?services?\b/gi, (match) => (
      /services/i.test(match) ? 'my-crow services' : 'my-crow service'
    ));

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer British male voices (Daniel = macOS/iOS Siri en-GB male)
    const preferred = ['Daniel', 'Arthur', 'Oliver', 'Malcolm', 'James'];
    for (const name of preferred) {
      const v = voices.find(v => v.name === name);
      if (v) return v;
    }
    return voices.find(v => v.lang === 'en-GB') || null;
  };

  const stopReadAloud = () => {
    window.speechSynthesis.cancel();
    clearReadButtonStates();
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

    const segments = [];
    clone.querySelectorAll('h1, h2, h3, h4, p, li').forEach((el) => {
      if (el.matches('p') && el.querySelector('li')) {
        return;
      }

      const text = normalizeSpeechText(el.textContent || '');
      if (text) {
        segments.push(text);
      }
    });

    if (segments.length > 0) {
      return segments.join('. ');
    }

    return normalizeSpeechText(clone.textContent || '');
  };

  const shouldCancelForNavigation = (anchor) => {
    if (!anchor || !anchor.href) {
      return false;
    }

    if (anchor.target && anchor.target.toLowerCase() === '_blank') {
      return false;
    }

    if (anchor.hasAttribute('download')) {
      return false;
    }

    let linkUrl;
    try {
      linkUrl = new URL(anchor.href, window.location.href);
    } catch {
      return false;
    }

    const isSameDocument =
      linkUrl.origin === window.location.origin
      && linkUrl.pathname === window.location.pathname
      && linkUrl.search === window.location.search;

    if (isSameDocument && linkUrl.hash) {
      return false;
    }

    return !isSameDocument;
  };

  readButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isAlreadyReading = button.classList.contains('is-reading');

      if (isAlreadyReading) {
        stopReadAloud();
        return;
      }

      let readText = extractReadableText(button.dataset.readTarget);
      if (!readText) {
        return;
      }

      readText = applySpeechPronunciationFixes(readText);

      stopReadAloud();

      const utterance = new SpeechSynthesisUtterance(readText);
      utterance.rate = 0.95;
      utterance.pitch = 0.85;
      utterance.lang = 'en-GB';
      const voice = pickVoice();
      if (voice) utterance.voice = voice;

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

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = event.target.closest('a[href]');
    if (shouldCancelForNavigation(anchor)) {
      stopReadAloud();
    }
  });

  window.addEventListener('beforeunload', stopReadAloud);
  window.addEventListener('pagehide', stopReadAloud);
});

