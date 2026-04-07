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

  const primaryFilterFrontOrder = [
    'All',
    'AI Governance',
    'Sports Tech',
    'FinTech',
    'Cybersecurity',
    'Enterprise Systems',
    'Healthcare',
    'Education',
  ];

  const normalizeFilterLabel = (value) => value.replace(/\s+/g, ' ').trim();

  const syncPrimaryFilterOrder = (filterRow) => {
    const tags = Array.from(filterRow.querySelectorAll('.tag-lrg'));
    if (tags.length === 0) {
      return;
    }

    const labels = tags.map((tag) => normalizeFilterLabel(tag.textContent || ''));
    const hasRequestedFrontOrder = primaryFilterFrontOrder.every((label) => labels.includes(label));
    if (!hasRequestedFrontOrder) {
      return;
    }

    const tagByLabel = new Map(tags.map((tag) => [normalizeFilterLabel(tag.textContent || ''), tag]));
    const orderedLabels = [
      ...primaryFilterFrontOrder.filter((label) => tagByLabel.has(label)),
      ...labels.filter((label) => !primaryFilterFrontOrder.includes(label)),
    ];

    orderedLabels.forEach((label) => {
      const tag = tagByLabel.get(label);
      if (tag) {
        filterRow.appendChild(tag);
      }
    });
  };

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
    syncPrimaryFilterOrder(filterRow);
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

  const preferredSpeechVoiceNames = ['Daniel', 'Arthur', 'Oliver', 'Malcolm', 'James'];
  const assistantSpeechProfile = {
    lang: 'en-GB',
    rate: 1.0,
    pitch: 0.9,
    volume: 1,
  };
  const readAloudSpeechProfile = {
    lang: 'en-GB',
    rate: 0.95,
    pitch: 0.85,
    volume: 1,
  };

  const normalizeSpeechVoiceKey = (voice) => `${voice?.name || ''} ${voice?.voiceURI || ''} ${voice?.lang || ''}`.toLowerCase();

  const resolvePreferredSpeechVoice = (preferredLang = 'en-GB') => {
    if (!('speechSynthesis' in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    if (!Array.isArray(voices) || voices.length === 0) {
      return null;
    }

    const preferredVoice = preferredSpeechVoiceNames
      .map((name) => name.toLowerCase())
      .map((nameKey) => voices.find((voice) => normalizeSpeechVoiceKey(voice).includes(nameKey)))
      .find(Boolean);

    const preferredLangKey = preferredLang.toLowerCase();
    return preferredVoice
      || voices.find((voice) => voice.localService && (voice.lang || '').toLowerCase().startsWith(preferredLangKey))
      || voices.find((voice) => (voice.lang || '').toLowerCase().startsWith(preferredLangKey))
      || voices.find((voice) => voice.localService && (voice.lang || '').toLowerCase().startsWith('en'))
      || voices.find((voice) => (voice.lang || '').toLowerCase().startsWith('en'))
      || null;
  };

  const normalizeSpeechDeliveryText = (value) => value
    .replace(/\s*[•]\s*/g, ', ')
    .replace(/\s*[–—]+\s*/g, ', ')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/,\s*,+/g, ', ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const applySpeechUtteranceSettings = (utterance, profile) => {
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    utterance.lang = profile.lang;

    const voice = resolvePreferredSpeechVoice(profile.lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || profile.lang;
    }
  };

  const initMerlinAssistant = () => {
    if (!document.body || document.querySelector('[data-merlin-assistant]')) {
      return;
    }

    const pagePath = window.location.pathname.toLowerCase();
    const isHomePage = !pagePath.includes('/projects/') && (pagePath === '/' || pagePath.endsWith('/index.html'));
    const primaryIntroKey = 'merlinAssistantPrimaryIntroPlayed';
    const messageLimitKey = 'merlinAssistantMessageCount';
    const messageLimitMax = 10;
    const introPauseMs = 420;
    const introLines = [
      "Hello, I'm Merlin, your personal assistant while you are visiting. Tell me how I can help while you browse.",
      'If you would like, I can send a message to Dubs or help schedule a call.',
    ];
    const secondaryPrompt = 'Tell me how I can help. I will send a message to Dubs and he will respond shortly.';

    const assistantNode = document.createElement('aside');
    assistantNode.className = 'merlin-assistant';
    assistantNode.dataset.merlinAssistant = 'true';
    assistantNode.innerHTML = `
      <button type="button" class="merlin-bubble" data-merlin-bubble aria-label="Open contact panel" aria-expanded="false">
        <span class="merlin-bubble__dot" aria-hidden="true"></span>
        <span class="merlin-bubble__label">Contact</span>
      </button>

      <section class="merlin-panel" data-merlin-panel aria-hidden="true" aria-label="Merlin assistant panel">
        <div class="merlin-panel__header">
          <div class="merlin-panel__title-wrap">
            <p class="merlin-panel__title">Merlin Assistant</p>
            <p class="merlin-panel__subtitle">Leave Dubs a message</p>
          </div>
          <div class="merlin-panel__actions">
            <button type="button" class="merlin-action-btn" data-merlin-close aria-label="Close assistant">Close</button>
          </div>
        </div>

        <div class="merlin-messages" data-merlin-messages></div>

        <form class="merlin-form" data-merlin-form novalidate>
          <input class="merlin-input" type="text" name="name" placeholder="Your name" maxlength="80" required />
          <input class="merlin-input" type="tel" name="phone" placeholder="Your phone" maxlength="40" required />
          <input class="merlin-input" type="email" name="email" placeholder="Your email" maxlength="150" required />
          <textarea class="merlin-textarea" name="message" rows="3" placeholder="Tell Merlin how Dubs can help." maxlength="2000" minlength="10" required></textarea>
          <input class="merlin-honeypot" type="text" name="company" autocomplete="off" tabindex="-1" aria-hidden="true" />
          <input type="hidden" name="startedAt" value="" />

          <div class="merlin-form__actions">
            <button type="button" class="merlin-btn merlin-btn--ghost" data-merlin-mic>Voice to Text</button>
            <button type="submit" class="merlin-btn merlin-btn--primary" data-merlin-submit>Leave Message</button>
          </div>

          <p class="merlin-status" data-merlin-status aria-live="polite"></p>
        </form>
      </section>
    `;
    document.body.appendChild(assistantNode);

    const bubbleButton = assistantNode.querySelector('[data-merlin-bubble]');
    const panelNode = assistantNode.querySelector('[data-merlin-panel]');
    const closeButton = assistantNode.querySelector('[data-merlin-close]');
    const voiceButton = assistantNode.querySelector('[data-merlin-voice]');
    const messagesNode = assistantNode.querySelector('[data-merlin-messages]');
    const formNode = assistantNode.querySelector('[data-merlin-form]');
    const micButton = assistantNode.querySelector('[data-merlin-mic]');
    const submitButton = assistantNode.querySelector('[data-merlin-submit]');
    const statusNode = assistantNode.querySelector('[data-merlin-status]');

    if (!bubbleButton || !panelNode || !closeButton || !messagesNode || !formNode || !micButton || !submitButton || !statusNode) {
      return;
    }

    const startedAtInput = formNode.querySelector('input[name="startedAt"]');
    const nameInput = formNode.querySelector('input[name="name"]');
    const phoneInput = formNode.querySelector('input[name="phone"]');
    const emailInput = formNode.querySelector('input[name="email"]');
    const messageInput = formNode.querySelector('textarea[name="message"]');
    const honeypotInput = formNode.querySelector('input[name="company"]');

    if (!startedAtInput || !nameInput || !phoneInput || !emailInput || !messageInput || !honeypotInput) {
      return;
    }

    const shouldAutofocusMessage = typeof window.matchMedia === 'function'
      ? !window.matchMedia('(pointer: coarse)').matches
      : true;

    const resetStartedAt = () => {
      startedAtInput.value = String(Date.now());
    };

    const getStoredMessageCount = () => {
      const count = Number(window.localStorage.getItem(messageLimitKey) || '0');
      return Number.isFinite(count) && count > 0 ? count : 0;
    };

    const setStoredMessageCount = (count) => {
      window.localStorage.setItem(messageLimitKey, String(Math.max(0, count)));
    };

    const appendMessage = (text, role = 'bot') => {
      const message = document.createElement('p');
      message.className = `merlin-message merlin-message--${role}`;
      message.textContent = text;
      messagesNode.appendChild(message);
      messagesNode.scrollTop = messagesNode.scrollHeight;
    };

    const setStatus = (text, state = '') => {
      statusNode.textContent = text;
      if (state) {
        statusNode.dataset.state = state;
      } else {
        statusNode.removeAttribute('data-state');
      }
    };

    const setPanelOpen = (isOpen) => {
      panelNode.classList.toggle('is-open', isOpen);
      panelNode.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      bubbleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && !messageInput.disabled && shouldAutofocusMessage) {
        try {
          messageInput.focus({ preventScroll: true });
        } catch {
          messageInput.focus();
        }
      }
    };

    const renderBotMessages = (lines) => {
      messagesNode.innerHTML = '';
      lines.forEach((line) => appendMessage(line, 'bot'));
    };

    let primaryIntroPlayed = sessionStorage.getItem(primaryIntroKey) === 'true';
    if (primaryIntroPlayed) {
      renderBotMessages([secondaryPrompt]);
    } else {
      renderBotMessages(introLines);
    }

    resetStartedAt();

    const canSpeakAssistant = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    let introSpeaking = false;
    let introPaused = false;
    let introGapTimer = null;

    const normalizeAssistantSpeech = (value) => value
      .replace(/\bschedul(e|ed|es|ing)\b/gi, (match) => {
        const lower = match.toLowerCase();
        if (lower.endsWith('ing')) return 'sked-jooling';
        if (lower.endsWith('ed')) return 'sked-joold';
        if (lower.endsWith('es')) return 'sked-jools';
        return 'sked-jool';
      })
      .replace(/\bpiceus\b/gi, 'Pie-see-us')
      .replace(/\bseo\/sem\b/gi, 'S E O and S E M')
      .replace(/\bseo\b/gi, 'S E O')
      .replace(/\bsem\b/gi, 'S E M')
      .replace(/\bslas\b/gi, "S L A's")
      .replace(/\bsla\b/gi, 'S L A')
      .replace(/\blead\b/gi, 'leed')
      .replace(/\bhipaa\b/gi, 'hip-uh')
      .replace(/\biot\b/gi, 'I O T')
      .replace(/\buga\b/gi, 'U G A')
      .replace(/\buva\b/gi, 'U V A')
      .replace(/\blifecycle\b/gi, 'life cycle')
      .replace(/\becosystem\b/gi, 'E-co-system')
      .replace(/\bsaas\b/gi, 'sass');

    const setIdleVoiceButtonLabel = () => {
      if (!voiceButton) {
        return;
      }
      voiceButton.textContent = primaryIntroPlayed ? 'Replay Prompt' : 'Play Voice';
    };

    const showSecondaryPrompt = () => {
      renderBotMessages([secondaryPrompt]);
    };

    const syncMessageLimitState = () => {
      const limitReached = getStoredMessageCount() >= messageLimitMax;
      [nameInput, phoneInput, emailInput, messageInput].forEach((field) => {
        field.disabled = limitReached;
      });

      submitButton.disabled = limitReached;
      micButton.disabled = limitReached || !hasVoiceToText;

      if (limitReached) {
        setStatus('Message limit reached. Please wait before sending another note.', 'error');
      }
    };

    const stopAssistantVoice = () => {
      if (!canSpeakAssistant) {
        return;
      }

      if (introGapTimer) {
        window.clearTimeout(introGapTimer);
        introGapTimer = null;
      }

      window.speechSynthesis.cancel();
      introSpeaking = false;
      introPaused = false;
      setIdleVoiceButtonLabel();
    };

    const playAssistantIntro = () => {
      if (!canSpeakAssistant) {
        return;
      }

      stopAssistantVoice();
      introSpeaking = true;
      if (voiceButton) {
        voiceButton.textContent = 'Pause Voice';
      }

      const promptLines = primaryIntroPlayed ? [secondaryPrompt] : introLines;

      let lineIndex = 0;
      const speakNextLine = () => {
        if (!introSpeaking || lineIndex >= promptLines.length) {
          introSpeaking = false;
          introPaused = false;
          if (!primaryIntroPlayed) {
            primaryIntroPlayed = true;
            sessionStorage.setItem(primaryIntroKey, 'true');
            showSecondaryPrompt();
          }
          setIdleVoiceButtonLabel();
          return;
        }

        const utteranceText = normalizeSpeechDeliveryText(normalizeAssistantSpeech(promptLines[lineIndex]));
        const utterance = new SpeechSynthesisUtterance(utteranceText);
        applySpeechUtteranceSettings(utterance, assistantSpeechProfile);

        const onLineComplete = () => {
          if (!introSpeaking) {
            return;
          }

          lineIndex += 1;
          if (lineIndex < promptLines.length) {
            introGapTimer = window.setTimeout(() => {
              introGapTimer = null;
              speakNextLine();
            }, introPauseMs);
            return;
          }

          introSpeaking = false;
          introPaused = false;
          setIdleVoiceButtonLabel();
        };

        utterance.onend = onLineComplete;
        utterance.onerror = onLineComplete;
        window.speechSynthesis.speak(utterance);
      };

      speakNextLine();
    };

    if (voiceButton) {
      if (!canSpeakAssistant) {
        voiceButton.disabled = true;
        voiceButton.textContent = 'Voice Unavailable';
        voiceButton.title = 'Voice playback is not supported in this browser.';
      } else {
        setIdleVoiceButtonLabel();
      }
    }

    const closeAssistant = () => {
      setPanelOpen(false);
      stopAssistantVoice();
      stopVoiceToText();
      setStatus('');
    };

    const openAssistant = () => {
      setPanelOpen(true);
    };

    const handleContactTriggerClick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      openAssistant();
    };

    const bindContactTriggers = () => {
      const contactTriggers = document.querySelectorAll('a[data-contact-merlin], button[data-contact-merlin], a[href="#contact"]');
      contactTriggers.forEach((trigger) => {
        if (trigger.dataset.merlinTriggerBound === 'true') {
          return;
        }

        trigger.dataset.merlinTriggerBound = 'true';
        trigger.addEventListener('click', handleContactTriggerClick);
      });
    };
    bindContactTriggers();

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasVoiceToText = typeof SpeechRecognitionAPI !== 'undefined';
    let recognition = null;
    let listening = false;

    function stopVoiceToText() {
      if (recognition && listening) {
        listening = false;
        recognition.stop();
      }
      micButton.textContent = 'Voice to Text';
    }

    if (hasVoiceToText) {
      recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        listening = true;
        micButton.textContent = 'Stop Listening';
        setStatus('Listening... speak your message.', 'info');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const part = event.results[index][0].transcript;
          if (event.results[index].isFinal) {
            finalTranscript += `${part.trim()} `;
          } else {
            interimTranscript += part;
          }
        }

        if (finalTranscript.trim()) {
          const merged = [messageInput.value.trim(), finalTranscript.trim()]
            .filter(Boolean)
            .join(' ');
          messageInput.value = merged;
          setStatus('Voice captured. Continue speaking or send the message.', 'info');
          return;
        }

        if (interimTranscript.trim()) {
          setStatus(`Listening: ${interimTranscript.trim()}`, 'info');
        }
      };

      recognition.onerror = () => {
        listening = false;
        micButton.textContent = 'Voice to Text';
        setStatus('Voice input ran into an issue. You can type instead.', 'error');
      };

      recognition.onend = () => {
        listening = false;
        micButton.textContent = 'Voice to Text';
      };
    } else {
      micButton.disabled = true;
      micButton.title = 'Voice transcription is not supported in this browser.';
    }

    syncMessageLimitState();

    bubbleButton.addEventListener('click', () => {
      const currentlyOpen = panelNode.classList.contains('is-open');
      if (currentlyOpen) {
        closeAssistant();
        return;
      }

      openAssistant();
    });

    closeButton.addEventListener('click', () => {
      closeAssistant();
    });

    if (voiceButton) {
      voiceButton.addEventListener('click', () => {
        if (!canSpeakAssistant) {
          return;
        }

        if (!introSpeaking) {
          playAssistantIntro();
          return;
        }

        if (!introPaused && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          introPaused = true;
          voiceButton.textContent = 'Resume Voice';
          return;
        }

        if (introPaused) {
          window.speechSynthesis.resume();
          introPaused = false;
          voiceButton.textContent = 'Pause Voice';
          return;
        }

        stopAssistantVoice();
      });
    }

    micButton.addEventListener('click', () => {
      if (!recognition) {
        return;
      }

      if (listening) {
        stopVoiceToText();
        setStatus('Voice capture stopped.', 'info');
        return;
      }

      try {
        recognition.start();
      } catch {
        setStatus('Microphone is busy. Try again in a moment.', 'info');
      }
    });

    formNode.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (getStoredMessageCount() >= messageLimitMax) {
        syncMessageLimitState();
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (name.length < 2) {
        setStatus('Please add your name.', 'error');
        return;
      }

      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailIsValid) {
        setStatus('Please add a valid email address.', 'error');
        return;
      }

      const normalizedPhone = phone.replace(/[^\d]/g, '');
      if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
        setStatus('Please add a valid phone number.', 'error');
        return;
      }

      if (message.length < 10) {
        setStatus('Please share a little more detail in your message.', 'error');
        return;
      }

      submitButton.disabled = true;
      setStatus('Sending your message to Dubs...', 'info');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            message,
            company: honeypotInput.value,
            startedAt: Number(startedAtInput.value),
            pageUrl: window.location.href,
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Message could not be sent right now.');
        }

        appendMessage(message, 'user');
        appendMessage('Thank you. Merlin has delivered your note to Dubs.', 'bot');
        formNode.reset();
        resetStartedAt();
        setStoredMessageCount(getStoredMessageCount() + 1);
        syncMessageLimitState();
        setStatus('Sent. Merlin delivered your message to Dubs.', 'success');
      } catch (error) {
        setStatus(error.message || 'Unable to send message right now. Please try again.', 'error');
      } finally {
        submitButton.disabled = false;
        stopVoiceToText();
      }
    });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panelNode.classList.contains('is-open')) {
          closeAssistant();
        }
      });

      document.addEventListener('click', (event) => {
        if (!panelNode.classList.contains('is-open')) {
          return;
        }

        if (assistantNode.contains(event.target)) {
          return;
        }

        closeAssistant();
      });

      window.addEventListener('pagehide', () => {
        stopAssistantVoice();
        stopVoiceToText();
      });
    };

    initMerlinAssistant();

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
      const speakerIconOnlySvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a6 6 0 0 1 0 8.07M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
      const isIconOnly = button.dataset.iconOnly === 'true';
      button.innerHTML = isIconOnly ? speakerIconOnlySvg : `${speakerSvg}${label}`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', isReading ? 'true' : 'false');
    };

    const createFollowAlongPanel = () => {
      let panel = document.querySelector('[data-follow-along-panel]');
      if (!panel) {
        panel = document.createElement('aside');
        panel.className = 'follow-along-panel';
        panel.hidden = true;
        panel.dataset.followAlongPanel = 'true';
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = `
          <div class="follow-along__eyebrow">Follow Along</div>
          <div class="follow-along__context" data-follow-along-context></div>
          <div class="follow-along__body" data-follow-along-body></div>
        `;
        document.body.appendChild(panel);
      }

      return {
        panel,
        context: panel.querySelector('[data-follow-along-context]'),
        body: panel.querySelector('[data-follow-along-body]'),
      };
    };

    const followAlongPanel = createFollowAlongPanel();
    let followAlongWords = [];
    let activeFollowAlongWord = null;

    const getFollowAlongContextLabel = (button) => {
      const rawLabel = button?.dataset.defaultLabel || '';
      const cleanedLabel = rawLabel
        .replace(/^Read\s+/i, '')
        .replace(/\s+from the beginning$/i, '')
        .replace(/\s+aloud$/i, '')
        .trim();

      return cleanedLabel || 'Current section';
    };

    const setActiveFollowAlongWord = (charIndex) => {
      if (followAlongWords.length === 0) {
        return;
      }

      let nextWord = followAlongWords[0];
      for (const entry of followAlongWords) {
        if (charIndex < entry.start) {
          break;
        }

        nextWord = entry;
        if (charIndex < entry.end) {
          break;
        }
      }

      if (activeFollowAlongWord?.node === nextWord.node) {
        return;
      }

      if (activeFollowAlongWord?.node) {
        activeFollowAlongWord.node.classList.remove('is-active');
      }

      activeFollowAlongWord = nextWord;
      activeFollowAlongWord.node.classList.add('is-active');
      activeFollowAlongWord.node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    const showFollowAlongPanel = (button, text) => {
      if (!followAlongPanel.body) {
        return;
      }

      followAlongPanel.context.textContent = getFollowAlongContextLabel(button);
      followAlongPanel.body.textContent = '';
      followAlongWords = [];
      activeFollowAlongWord = null;

      const fragment = document.createDocumentFragment();
      const tokenPattern = /\S+|\s+/g;
      let match;
      while ((match = tokenPattern.exec(text))) {
        const token = match[0];
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          continue;
        }

        const wordNode = document.createElement('span');
        wordNode.className = 'follow-along__word';
        wordNode.textContent = token;
        fragment.appendChild(wordNode);
        followAlongWords.push({
          start: match.index,
          end: match.index + token.length,
          node: wordNode,
        });
      }

      followAlongPanel.body.appendChild(fragment);
      followAlongPanel.panel.hidden = false;
      followAlongPanel.panel.setAttribute('aria-hidden', 'false');
      followAlongPanel.panel.classList.add('is-visible');
      setActiveFollowAlongWord(0);
    };

    const hideFollowAlongPanel = () => {
      if (!followAlongPanel.body) {
        return;
      }

      followAlongWords = [];
      activeFollowAlongWord = null;
      followAlongPanel.panel.classList.remove('is-visible');
      followAlongPanel.panel.hidden = true;
      followAlongPanel.panel.setAttribute('aria-hidden', 'true');
      followAlongPanel.context.textContent = '';
      followAlongPanel.body.textContent = '';
      followAlongPanel.body.scrollTop = 0;
    };

    const initResumeModal = () => {
      const resumeLinks = Array.from(document.querySelectorAll('a[href*="William_Weems_Product_UX_UI_AI_Leadership_CV.pdf"]'));
      if (resumeLinks.length === 0 || document.querySelector('[data-resume-modal]')) {
        return;
      }

      let resumePdfUrl;
      try {
        resumePdfUrl = new URL(resumeLinks[0].getAttribute('href'), window.location.href);
      } catch {
        return;
      }

      const resumePageUrl = new URL(resumePdfUrl.href);
      resumePageUrl.pathname = resumePageUrl.pathname.replace(/\/[^/]+\.pdf$/i, '/index.html');

      const modal = document.createElement('div');
      modal.className = 'resume-modal';
      modal.dataset.resumeModal = 'true';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="resume-modal__backdrop" data-resume-modal-close></div>
        <div class="resume-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title">
          <div class="resume-modal__top">
            <div>
              <p class="resume-modal__eyebrow">Resume</p>
              <p class="resume-modal__title" id="resume-modal-title">William Weems</p>
            </div>
            <div class="resume-modal__actions">
              <a class="resume-modal__link" data-resume-download href="${resumePdfUrl.href}" download="William_Weems_Product_UX_UI_AI_Leadership_CV.pdf">Download PDF</a>
              <button type="button" class="resume-modal__close" data-resume-modal-close aria-label="Close resume">Close</button>
            </div>
          </div>
          <iframe class="resume-modal__frame" data-resume-frame title="William Weems resume"></iframe>
        </div>
      `;
      document.body.appendChild(modal);

      const frame = modal.querySelector('[data-resume-frame]');
      const downloadLink = modal.querySelector('[data-resume-download]');
      const closeTargets = modal.querySelectorAll('[data-resume-modal-close]');
      const closeButton = modal.querySelector('.resume-modal__close');
      let previousActiveElement = null;
      let frameLoaded = false;

      const stopSiteSpeech = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        document.querySelectorAll('[data-read-target]').forEach((button) => {
          setReadButtonState(button, false);
        });
      };

      const openModal = () => {
        previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        stopSiteSpeech();

        if (downloadLink) {
          downloadLink.href = resumePdfUrl.href;
        }

        if (frame && !frameLoaded) {
          frame.src = resumePageUrl.href;
          frameLoaded = true;
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('resume-modal-open');

        window.requestAnimationFrame(() => {
          if (!closeButton) {
            return;
          }

          try {
            closeButton.focus({ preventScroll: true });
          } catch {
            closeButton.focus();
          }
        });
      };

      const closeModal = () => {
        if (!modal.classList.contains('is-open')) {
          return;
        }

        stopSiteSpeech();
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('resume-modal-open');

        if (previousActiveElement && document.contains(previousActiveElement)) {
          try {
            previousActiveElement.focus({ preventScroll: true });
          } catch {
            previousActiveElement.focus();
          }
        }
      };

      resumeLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
          }

          event.preventDefault();
          openModal();
        });
      });

      closeTargets.forEach((target) => {
        target.addEventListener('click', closeModal);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
          closeModal();
        }
      });

      window.addEventListener('pagehide', closeModal);
    };

    initResumeModal();

    const normalizeSpeechText = (value) => value.replace(/\s+/g, ' ').trim();
    const readButtons = [];
    const projectTitle = normalizeSpeechText(document.querySelector('.hero h1')?.textContent || 'Project');

    readSectionsConfig.forEach(({ sectionId, defaultLabel, activeLabel }) => {
      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      const sectionTitle = section.querySelector('.sectionTitle');
      if (!sectionTitle) {
        return;
      }

      const buttonContainer = section.querySelector('.card') || sectionTitle;

      let button = buttonContainer.querySelector('.read-trigger[data-read-target]');
      if (!button) {
        button = document.createElement('button');
        button.className = 'read-trigger';
        buttonContainer.appendChild(button);
      }

      button.type = 'button';
      button.classList.add('read-trigger--section-icon');
      button.dataset.readTarget = sectionId;
      const sectionHeading = normalizeSpeechText(sectionTitle.querySelector('h1, h2, h3, h4')?.textContent || defaultLabel.replace(/^Read\s+/i, '').replace(/\s+Aloud$/i, '') || sectionId);
      button.dataset.defaultLabel = `Read ${sectionHeading}`;
      button.dataset.activeLabel = `Stop reading ${sectionHeading}`;
      button.dataset.iconOnly = 'true';
      setReadButtonState(button, false);
      readButtons.push(button);
    });

    const overviewSection = document.getElementById('overview');
    const outcomesSection = document.getElementById('outcomes');
    if ((overviewSection || outcomesSection) && !document.querySelector('[data-project-read-fab]')) {
      const projectReadButton = document.createElement('button');
      projectReadButton.type = 'button';
      projectReadButton.className = 'project-read-fab';
      projectReadButton.dataset.readTarget = 'project';
      projectReadButton.dataset.defaultLabel = `Read ${projectTitle} from the beginning`;
      projectReadButton.dataset.activeLabel = `Stop reading ${projectTitle}`;
      projectReadButton.dataset.iconOnly = 'true';
      projectReadButton.dataset.projectReadFab = 'true';
      document.body.appendChild(projectReadButton);
      setReadButtonState(projectReadButton, false);
      readButtons.push(projectReadButton);
    }

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

    const speechStateNames = {
      AL: 'Alabama',
      AK: 'Alaska',
      AZ: 'Arizona',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DE: 'Delaware',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'Tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virginia',
      WI: 'Wisconsin',
      WY: 'Wyoming',
      DC: 'District of Columbia',
    };

    const expandStateAbbreviationsForSpeech = (value) => value.replace(
      /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/gi,
      (_, abbreviation) => `, ${speechStateNames[abbreviation.toUpperCase()] || abbreviation}`
    );

    const replaceDividerSlashesForSpeech = (value) => value.replace(
      /(^|[\s(])([A-Za-z][A-Za-z0-9.+-]*)\s*\/\s*([A-Za-z][A-Za-z0-9.+-]*)(?=$|[\s),.:;!?])/g,
      (_, prefix, left, right) => `${prefix}${left} and ${right}`
    );

    const applySpeechPronunciationFixes = (value) => normalizeSpeechDeliveryText(replaceDividerSlashesForSpeech(
      expandStateAbbreviationsForSpeech(value)
        // Force known brand/domain pronunciations that default voices misread.
        .replace(/\bpiceus\b/gi, 'Pie-see-us')
        .replace(/\brecords\b/gi, 'reh-cords')
        .replace(/\bseo\/sem\b/gi, 'S E O and S E M')
        .replace(/\bseo\b/gi, 'S E O')
        .replace(/\bsem\b/gi, 'S E M')
        .replace(/\bslas\b/gi, "S L A's")
        .replace(/\bsla\b/gi, 'S L A')
        .replace(/\blead\b/gi, 'leed')
        .replace(/\bhipaa\b/gi, 'hip-uh')
        .replace(/\biot\b/gi, 'I O T')
        .replace(/\buga\b/gi, 'U G A')
        .replace(/\buva\b/gi, 'U V A')
        .replace(/\blive\b/gi, 'lyve')
        .replace(/\bcycle\b/gi, 'sigh-kull')
        .replace(/\blifecycle\b/gi, 'life cycle')
        .replace(/\bcyber[\s-]?security\b/gi, 'sigh-burr security')
        .replace(/\bcyber\b/gi, 'sigh-burr')
        .replace(/\bux\/ui\b/gi, 'U X U I')
        .replace(/\bschedul(e|ed|es|ing)\b/gi, (match) => {
          const lower = match.toLowerCase();
          if (lower.endsWith('ing')) return 'sked-jooling';
          if (lower.endsWith('ed')) return 'sked-joold';
          if (lower.endsWith('es')) return 'sked-jools';
          return 'sked-jool';
        })
        .replace(/\bsaas\b/gi, 'sass')
        .replace(/\becosystem\b/gi, 'E-co-system')
        .replace(/\bmi(?:cro|co)[\s-]?services?\b/gi, (match) => (
          /services/i.test(match) ? 'my-crow services' : 'my-crow service'
        ))
        .replace(/\bat&t\b/gi, 'A T & T')
    ));

    const stopReadAloud = () => {
      window.speechSynthesis.cancel();
      clearReadButtonStates();
    };

    const extractSegmentsFromSource = (source) => {
      if (!source) {
        return [];
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
        return segments;
      }

      const fallbackText = normalizeSpeechText(clone.textContent || '');
      return fallbackText ? [fallbackText] : [];
    };

    const extractProjectReadableText = () => {
      const segments = [];
      const heroSection = Array.from(document.querySelectorAll('main.page .hero')).find((section) => section.querySelector('h1'));
      const projectSources = [heroSection, overviewSection, outcomesSection].filter(Boolean);

      projectSources.forEach((source) => {
        segments.push(...extractSegmentsFromSource(source));
      });

      return segments.join('. ');
    };

    const extractReadableText = (targetId) => {
      if (targetId === 'project') {
        return extractProjectReadableText();
      }

      const source = document.getElementById(targetId);
      const segments = extractSegmentsFromSource(source);
      if (segments.length > 0) {
        return segments.join('. ');
      }

      return '';
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
        applySpeechUtteranceSettings(utterance, readAloudSpeechProfile);

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

