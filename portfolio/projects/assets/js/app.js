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

  const initMerlinAssistant = () => {
    if (!document.body || document.querySelector('[data-merlin-assistant]')) {
      return;
    }

    const pagePath = window.location.pathname.toLowerCase();
    const isHomePage = !pagePath.includes('/projects/') && (pagePath === '/' || pagePath.endsWith('/index.html'));
    const homePromptKey = 'merlinAssistantHomePromptShown';
    const autoOpenDelayMs = 9000;
    const introPauseMs = 550;
    const introLines = [
      "Hello, I'm Merlin, your personal assistant while you are visiting. Please let me know how I can help as you browse.",
      'I would be happy to schedule a chat with Dubs The Creator if there is anything he can assist with, I will inform him.',
    ];

    const assistantNode = document.createElement('aside');
    assistantNode.className = 'merlin-assistant';
    assistantNode.dataset.merlinAssistant = 'true';
    assistantNode.innerHTML = `
      <button type="button" class="merlin-bubble" data-merlin-bubble aria-label="Open Merlin assistant" aria-expanded="false">
        <span class="merlin-bubble__dot" aria-hidden="true"></span>
        <span class="merlin-bubble__label">Message Merlin</span>
      </button>

      <section class="merlin-panel" data-merlin-panel aria-hidden="true" aria-label="Merlin assistant panel">
        <div class="merlin-panel__header">
          <div class="merlin-panel__title-wrap">
            <p class="merlin-panel__title">Merlin Assistant</p>
            <p class="merlin-panel__subtitle">Send a quick note to Dubs by text or email</p>
          </div>
          <div class="merlin-panel__actions">
            <button type="button" class="merlin-action-btn" data-merlin-voice>Pause Voice</button>
            <button type="button" class="merlin-action-btn" data-merlin-close aria-label="Close assistant">Close</button>
          </div>
        </div>

        <div class="merlin-messages" data-merlin-messages></div>

        <form class="merlin-form" data-merlin-form novalidate>
          <input class="merlin-input" type="text" name="name" placeholder="Your name" maxlength="80" required />
          <input class="merlin-input" type="tel" name="phone" placeholder="Your phone (optional for text replies)" maxlength="40" />
          <input class="merlin-input" type="email" name="email" placeholder="Your email (optional)" maxlength="150" />
          <textarea class="merlin-textarea" name="message" rows="3" placeholder="How can Dubs help you?" maxlength="2000" required></textarea>
          <input class="merlin-honeypot" type="text" name="company" autocomplete="off" tabindex="-1" aria-hidden="true" />
          <input type="hidden" name="startedAt" value="" />

          <div class="merlin-form__actions">
            <button type="button" class="merlin-btn merlin-btn--ghost" data-merlin-mic>Voice to Text</button>
            <button type="submit" class="merlin-btn merlin-btn--primary" data-merlin-submit>Send Message</button>
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

    if (!bubbleButton || !panelNode || !closeButton || !voiceButton || !messagesNode || !formNode || !micButton || !submitButton || !statusNode) {
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

    const resetStartedAt = () => {
      startedAtInput.value = String(Date.now());
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
      if (isOpen) {
        messageInput.focus();
      }
    };

    appendMessage(introLines[0], 'bot');
    appendMessage(introLines[1], 'bot');
    resetStartedAt();

    let autoOpenTimer = null;

    const clearAutoOpenTimer = () => {
      if (autoOpenTimer) {
        window.clearTimeout(autoOpenTimer);
        autoOpenTimer = null;
      }
    };

    const canSpeakAssistant = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    let introPlayed = false;
    let introSpeaking = false;
    let introPaused = false;
    let introGapTimer = null;

    const normalizeAssistantSpeech = (value) => value
      .replace(/\bschedul(e|ed|es|ing)\b/gi, (match) => {
        const lower = match.toLowerCase();
        if (lower.endsWith('ing')) return 'skeduling';
        if (lower.endsWith('ed')) return 'skeduled';
        if (lower.endsWith('es')) return 'skedules';
        return 'skedule';
      })
      .replace(/\bsaas\b/gi, 'sass');

    const pickAssistantVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ['Daniel', 'Arthur', 'Oliver', 'Malcolm', 'James'];
      for (const name of preferred) {
        const selected = voices.find((voice) => voice.name === name);
        if (selected) {
          return selected;
        }
      }
      return voices.find((voice) => voice.lang === 'en-GB') || null;
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
      voiceButton.textContent = introPlayed ? 'Replay Voice' : 'Play Voice';
    };

    const playAssistantIntro = () => {
      if (!canSpeakAssistant) {
        return;
      }

      stopAssistantVoice();
      introPlayed = true;
      introSpeaking = true;
      voiceButton.textContent = 'Pause Voice';

      let lineIndex = 0;
      const speakNextLine = () => {
        if (!introSpeaking || lineIndex >= introLines.length) {
          introSpeaking = false;
          introPaused = false;
          voiceButton.textContent = 'Replay Voice';
          return;
        }

        const utteranceText = normalizeAssistantSpeech(introLines[lineIndex]);
        const utterance = new SpeechSynthesisUtterance(utteranceText);
        utterance.rate = 0.97;
        utterance.pitch = 0.9;
        utterance.lang = 'en-GB';
        const voice = pickAssistantVoice();
        if (voice) {
          utterance.voice = voice;
        }

        const onLineComplete = () => {
          if (!introSpeaking) {
            return;
          }

          lineIndex += 1;
          if (lineIndex < introLines.length) {
            introGapTimer = window.setTimeout(() => {
              introGapTimer = null;
              speakNextLine();
            }, introPauseMs);
            return;
          }

          introSpeaking = false;
          introPaused = false;
          voiceButton.textContent = 'Replay Voice';
        };

        utterance.onend = onLineComplete;
        utterance.onerror = onLineComplete;
        window.speechSynthesis.speak(utterance);
      };

      speakNextLine();
    };

    if (!canSpeakAssistant) {
      voiceButton.disabled = true;
      voiceButton.textContent = 'Voice Unavailable';
      voiceButton.title = 'Voice playback is not supported in this browser.';
    }

    const closeAssistant = () => {
      setPanelOpen(false);
      stopAssistantVoice();
      stopVoiceToText();
      setStatus('');
    };

    const openAssistant = () => {
      setPanelOpen(true);
      clearAutoOpenTimer();
      if (isHomePage) {
        sessionStorage.setItem(homePromptKey, 'true');
      }
    };

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

    bubbleButton.addEventListener('click', () => {
      const currentlyOpen = panelNode.classList.contains('is-open');
      if (currentlyOpen) {
        closeAssistant();
        return;
      }

      openAssistant();
      if (isHomePage && !introPlayed) {
        playAssistantIntro();
      }
    });

    closeButton.addEventListener('click', () => {
      closeAssistant();
    });

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

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      if (name.length < 2) {
        setStatus('Please add your name.', 'error');
        return;
      }

      if (email) {
        const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailIsValid) {
          setStatus('Please add a valid email address, or leave it blank.', 'error');
          return;
        }
      }

      if (phone) {
        const normalizedPhone = phone.replace(/[^\d]/g, '');
        if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
          setStatus('Please add a valid phone number, or leave it blank.', 'error');
          return;
        }
      }

      if (!email && !phone) {
        setStatus('Add a phone or email so Dubs can follow up.', 'error');
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
        appendMessage('Thanks, your message was sent to Dubs.', 'bot');
        formNode.reset();
        resetStartedAt();

        const channels = Array.isArray(result.channels) ? result.channels : [];
        if (channels.includes('sms') && channels.includes('email')) {
          setStatus('Sent. Merlin delivered your note by text and email.', 'success');
        } else if (channels.includes('sms')) {
          setStatus('Sent. Merlin delivered your note by text.', 'success');
        } else {
          setStatus('Sent. Merlin delivered your note by email.', 'success');
        }
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
        clearAutoOpenTimer();
        stopAssistantVoice();
        stopVoiceToText();
      });

      if (isHomePage && !sessionStorage.getItem(homePromptKey)) {
        autoOpenTimer = window.setTimeout(() => {
          sessionStorage.setItem(homePromptKey, 'true');
          openAssistant();
          playAssistantIntro();
        }, autoOpenDelayMs);
      }
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
      .replace(/\bcyber[\s-]?security\b/gi, 'sigh-burr security')
      .replace(/\bcyber\b/gi, 'sigh-burr')
      .replace(/\bschedul(e|ed|es|ing)\b/gi, (match) => {
        const lower = match.toLowerCase();
        if (lower.endsWith('ing')) return 'skeduling';
        if (lower.endsWith('ed')) return 'skeduled';
        if (lower.endsWith('es')) return 'skedules';
        return 'skedule';
      })
      .replace(/\bsaas\b/gi, 'sass')
      .replace(/\becosystem\b/gi, 'ee-ko-system')
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

