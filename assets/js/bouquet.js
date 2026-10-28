(() => {
  const bouquet = document.getElementById('bouquet');
  if (!bouquet) return;

  const body = document.body;
  const book = document.getElementById('book');
  const siteHead = document.querySelector('.site-head');
  const cover = document.getElementById('cover');
  const turnPage = document.getElementById('turnPage');
  const stepper = document.getElementById('bouquetStepper');
  const steps = [...document.querySelectorAll('.bouquet-step')];
  const flowerGrid = document.getElementById('flowerGrid');
  const flowerTray = document.getElementById('flowerTray');
  const countEl = document.getElementById('bouquetCount');
  const nextFlowers = document.getElementById('nextFlowers');
  const bouquetSlot3 = document.getElementById('bouquetSlot3');
  const bouquetSlot5 = document.getElementById('bouquetSlot5');
  const bouquetCanvas = document.getElementById('bouquetCanvas');
  const flowersGroup = document.getElementById('bouquetFlowers');
  const shapeCount = document.getElementById('shapeCount');
  const rewrapButton = document.getElementById('rewrapBouquet');
  const nextBouquet = document.getElementById('nextBouquet');
  const backToFlowers = document.getElementById('backToFlowers');
  const bgOptions = document.getElementById('bgOptions');
  const styleOptions = document.getElementById('styleOptions');
  const recipientInput = document.getElementById('recipientInput');
  const messageInput = document.getElementById('messageInput');
  const senderInput = document.getElementById('senderInput');
  const cardPreview = document.getElementById('cardPreview');
  const previewTo = document.getElementById('previewTo');
  const previewMessage = document.getElementById('previewMessage');
  const previewFrom = document.getElementById('previewFrom');
  const backBouquet = document.getElementById('backBouquet');
  const generateCard = document.getElementById('generateCard');
  const shareScene = document.getElementById('shareScene');
  const shareCard = document.getElementById('shareCard');
  const shareTo = document.getElementById('shareTo');
  const shareMessage = document.getElementById('shareMessage');
  const shareFrom = document.getElementById('shareFrom');
  const backCard = document.getElementById('backCard');
  const copyLinkButton = document.getElementById('copyLink');
  const enterButton = document.getElementById('enterBouquet');
  const skipButton = document.getElementById('skipBouquet');
  const copyStatus = document.getElementById('copyStatus');
  const quizModal = document.getElementById('quizModal');
  const quizTitle = document.getElementById('quizTitle');
  const quizForm = document.getElementById('quizForm');
  const quizAnswer1 = document.getElementById('quizAnswer1');
  const quizAnswer2 = document.getElementById('quizAnswer2');
  const quizAnswer3 = document.getElementById('quizAnswer3');
  const quizFail = document.getElementById('quizFail');
  let quizFailed = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const skipped = document.documentElement.classList.contains('skip-bouquet');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const flowers = [
    { id: 'anemone', name: 'Anemone', cn: '银莲花', meaning: 'Anticipation & sincerity', color: '#a7c4d6', size: 'medium', symbol: 'flower-anemone' },
    { id: 'carnation', name: 'Carnation', cn: '康乃馨', meaning: 'Love & admiration', color: '#d97d6e', size: 'medium', symbol: 'flower-carnation' },
    { id: 'dahlia', name: 'Dahlia', cn: '大丽花', meaning: 'Elegance & dignity', color: '#b64d6d', size: 'big', symbol: 'flower-dahlia' },
    { id: 'daisy', name: 'Daisy', cn: '雏菊', meaning: 'Innocence & joy', color: '#f1e7cd', size: 'small', symbol: 'flower-daisy' },
    { id: 'lily', name: 'Lily', cn: '百合', meaning: 'Purity & devotion', color: '#8b7cc0', size: 'medium', symbol: 'flower-lily' },
    { id: 'orchid', name: 'Orchid', cn: '兰花', meaning: 'Rare beauty & strength', color: '#b98fc4', size: 'small', symbol: 'flower-orchid' },
    { id: 'peony', name: 'Peony', cn: '芍药', meaning: 'Prosperity & romance', color: '#e8a4ad', size: 'big', symbol: 'flower-peony' },
    { id: 'ranunculus', name: 'Ranunculus', cn: '洋牡丹', meaning: 'Charm & radiance', color: '#e9c07a', size: 'medium', symbol: 'flower-ranunculus' },
    { id: 'rose', name: 'Rose', cn: '玫瑰', meaning: 'Deep love & passion', color: '#a62c39', size: 'big', symbol: 'flower-rose' },
    { id: 'sunflower', name: 'Sunflower', cn: '向日葵', meaning: 'Loyalty & warmth', color: '#e5b432', size: 'big', symbol: 'flower-sunflower' },
    { id: 'tulip', name: 'Tulip', cn: '郁金香', meaning: 'Perfect love', color: '#df8a3f', size: 'small', symbol: 'flower-tulip' },
    { id: 'zinnia', name: 'Zinnia', cn: '百日菊', meaning: 'Lasting affection', color: '#c64d7d', size: 'medium', symbol: 'flower-zinnia' }
  ];

  const backgrounds = [
    { id: 'morning', name: 'Morning', color: '#f3e8d4' },
    { id: 'garden', name: 'Garden', color: '#dce6d8' },
    { id: 'dusk', name: 'Dusk', color: '#dfcbd0' },
    { id: 'night', name: 'Night', color: '#1b2229' },
    { id: 'blossom', name: 'Blossom', color: '#eed1d6' }
  ];

  const cardStyles = [
    { id: 'parchment', name: 'Parchment', color: '#f4ead3' },
    { id: 'ivory', name: 'Ivory', color: '#fbf7ee' },
    { id: 'blush', name: 'Blush', color: '#f4e1e4' },
    { id: 'sage', name: 'Sage', color: '#e5ebe0' },
    { id: 'slate', name: 'Slate', color: '#30343a' },
    { id: 'postcard', name: 'Postcard', color: '#f7efe0' }
  ];

  const state = {
    counts: {},
    arrangement: 1,
    background: 'morning',
    cardStyle: 'parchment',
    recipient: '王芊予',
    message: '生日快乐。\n愿你新的一岁，有花、有光、有自由。',
    sender: '永远站在你这边的人'
  };

  const slots = [
    { x: 250, y: 138, r: -3, s: 1.42 },
    { x: 185, y: 172, r: -9, s: 1.34 },
    { x: 315, y: 172, r: 8, s: 1.36 },
    { x: 120, y: 235, r: -15, s: 1.2 },
    { x: 380, y: 235, r: 14, s: 1.22 },
    { x: 215, y: 232, r: -4, s: 1.42 },
    { x: 285, y: 232, r: 4, s: 1.38 },
    { x: 165, y: 292, r: -7, s: 1.28 },
    { x: 335, y: 292, r: 8, s: 1.3 },
    { x: 250, y: 300, r: 1, s: 1.36 },
    { x: 250, y: 100, r: 0, s: 1.02 },
    { x: 145, y: 210, r: -12, s: .98 },
    { x: 355, y: 210, r: 12, s: .98 },
    { x: 205, y: 350, r: -4, s: .96 },
    { x: 295, y: 350, r: 4, s: .96 }
  ];
  const slotOrder = [0, 1, 2, 5, 6, 7, 8, 9, 3, 4, 10, 11, 12, 13, 14];
  const buttons = new Map();
  const bgButtons = new Map();
  const styleButtons = new Map();
  let entered = false;
  let currentStep = 1;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const totalBlooms = () => Object.values(state.counts).reduce((sum, value) => sum + value, 0);

  const setBehindInert = (inert) => {
    if (book) book.inert = inert;
    if (siteHead) siteHead.inert = inert;
  };

  const focusCover = () => {
    if (!cover) return;
    try {
      cover.focus({ preventScroll: true });
    } catch (error) {}
  };

  let allowPageTurn = false;

  const finish = (enterStory = false) => {
    bouquet.hidden = true;
    bouquet.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-bouquet');
    setBehindInert(false);
    window.scrollTo(0, 0);
    if (enterStory) {
      document.dispatchEvent(new CustomEvent('birthday:story-direct'));
    } else {
      focusCover();
    }
  };

  const enterSite = () => {
    if (entered) return;
    entered = true;
    finish(true);
  };

  const openBouquet = () => {
    if (skipped || !bouquet.hidden) return;
    entered = false;
    bouquet.hidden = false;
    bouquet.removeAttribute('aria-hidden');
    body.classList.add('is-bouquet');
    setBehindInert(true);
    bouquet.scrollTo(0, 0);
    setStep(1, false);
  };

  turnPage?.addEventListener('click', (event) => {
    if (skipped || allowPageTurn || entered || !bouquet.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openBouquet();
  }, true);

  const seededShuffle = (items, seed) => {
    const copy = [...items];
    let value = Math.max(1, seed || 1) >>> 0;
    const random = () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const svgEl = (name, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  };

  const updateFlowers = () => {
    const total = totalBlooms();
    if (countEl) countEl.textContent = `${total} / 15 selected`;
    if (nextFlowers) nextFlowers.disabled = total < 12;

    buttons.forEach((button, id) => {
      const count = state.counts[id] || 0;
      const badge = button.querySelector('.flower-choice__badge');
      button.classList.toggle('is-selected', count > 0);
      button.setAttribute('aria-pressed', String(count > 0));
      button.setAttribute('aria-label', `Add ${flowers.find((f) => f.id === id)?.name || id}${count ? `, ${count} selected` : ''}`);
      if (badge) badge.textContent = count > 0 ? `×${count}` : '';
      button.disabled = count === 0 && total >= 15;
    });

    if (flowerTray) {
      flowerTray.replaceChildren();
      flowers.filter((flower) => (state.counts[flower.id] || 0) > 0).forEach((flower) => {
        const chip = document.createElement('span');
        chip.className = 'flower-chip';
        chip.innerHTML = `<b>${flower.name} ×${state.counts[flower.id]}</b><button type="button" aria-label="Remove one ${flower.name}" data-remove="${flower.id}">−</button>`;
        flowerTray.appendChild(chip);
      });
      flowerTray.hidden = !flowers.some((flower) => (state.counts[flower.id] || 0) > 0);
    }
  };

  const buildFlowers = () => {
    flowers.forEach((flower, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flower-choice';
      button.dataset.id = flower.id;
      button.style.setProperty('--flower', flower.color);
      button.style.setProperty('--i', index);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `
        <span class="flower-choice__art" aria-hidden="true">
          <svg viewBox="0 0 120 120"><use href="#${flower.symbol}"></use></svg>
        </span>
        <span class="flower-choice__name">${flower.name}<em>${flower.cn}</em></span>
        <span class="flower-choice__meaning">${flower.meaning}</span>
        <span class="flower-choice__badge" aria-hidden="true"></span>
      `;
      button.addEventListener('click', () => {
        const count = state.counts[flower.id] || 0;
        const total = totalBlooms();
        if (total >= 15) return;
        state.counts[flower.id] = count + 1;
        updateFlowers();
      });
      buttons.set(flower.id, button);
      flowerGrid?.appendChild(button);
    });

    flowerTray?.addEventListener('click', (event) => {
      const target = event.target.closest('[data-remove]');
      if (!target) return;
      const id = target.dataset.remove;
      const count = state.counts[id] || 0;
      if (count <= 1) delete state.counts[id];
      else state.counts[id] = count - 1;
      updateFlowers();
    });
  };

  const updateCard = () => {
    const recipient = state.recipient.trim() || '王芊予';
    const message = state.message.trim() || '生日快乐。';
    const sender = state.sender.trim() || '永远站在你这边的人';

    if (previewTo) previewTo.textContent = `To ${recipient},`;
    if (previewMessage) previewMessage.textContent = message;
    if (previewFrom) previewFrom.textContent = `— ${sender}`;
    if (shareTo) shareTo.textContent = `To ${recipient},`;
    if (shareMessage) shareMessage.textContent = message;
    if (shareFrom) shareFrom.textContent = `— ${sender}`;

    if (cardPreview) cardPreview.className = `card-preview card-style-${state.cardStyle}`;
    if (shareCard) shareCard.className = `card-preview share-card card-style-${state.cardStyle}`;
    if (shareScene) shareScene.className = `share-scene bg-${state.background}`;

    styleButtons.forEach((button, id) => {
      button.classList.toggle('is-selected', id === state.cardStyle);
    });
    bgButtons.forEach((button, id) => {
      button.classList.toggle('is-selected', id === state.background);
    });
  };

  const buildCardOptions = () => {
    backgrounds.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bg-choice';
      button.dataset.id = item.id;
      button.style.setProperty('--swatch', item.color);
      button.innerHTML = `<i aria-hidden="true"></i>${item.name}`;
      button.addEventListener('click', () => {
        state.background = item.id;
            });
      bgButtons.set(item.id, button);
      bgOptions?.appendChild(button);
    });

    cardStyles.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'style-choice';
      button.dataset.id = item.id;
      button.style.setProperty('--swatch', item.color);
      button.innerHTML = `<i aria-hidden="true"></i>${item.name}`;
      button.addEventListener('click', () => {
        state.cardStyle = item.id;
            });
      styleButtons.set(item.id, button);
      styleOptions?.appendChild(button);
    });

    recipientInput?.addEventListener('input', () => {
      state.recipient = recipientInput.value;
        });
    messageInput?.addEventListener('input', () => {
      state.message = messageInput.value;
        });
    senderInput?.addEventListener('input', () => {
      state.sender = senderInput.value;
        });

    if (recipientInput) recipientInput.value = state.recipient;
    if (messageInput) messageInput.value = state.message;
    if (senderInput) senderInput.value = state.sender;
    };

  const renderBouquet = () => {
    if (!flowersGroup) return;
    flowersGroup.replaceChildren();

    const chosen = [];
    flowers.forEach((flower) => {
      const count = state.counts[flower.id] || 0;
      for (let i = 0; i < count; i += 1) chosen.push(flower);
    });
    const sizeOrder = ['big', 'medium', 'small'];
    const orderedFlowers = sizeOrder.flatMap((size, index) =>
      seededShuffle(chosen.filter((flower) => flower.size === size), state.arrangement + index * 13)
    );
    const orderedSlots = slots
      .map((slot) => ({ ...slot, center: Math.hypot(slot.x - 250, slot.y - 240) }))
      .sort((a, b) => a.center - b.center)
      .slice(0, orderedFlowers.length);

    orderedFlowers.forEach((flower, index) => {
      const slot = orderedSlots[index];
      if (!slot) return;

      const group = svgEl('g', {
        transform: `translate(${slot.x} ${slot.y}) rotate(${slot.r}) scale(${slot.s})`
      });
      const use = svgEl('use', {
        href: `#${flower.symbol}`,
        x: '-60',
        y: '-60',
        width: '120',
        height: '120'
      });
      use.style.color = flower.color;
      group.appendChild(use);
      flowersGroup.appendChild(group);
    });

    if (shapeCount) shapeCount.textContent = `${chosen.length} blooms · 10.28`;
  };

  const setStep = (step, focus = true) => {
    currentStep = step;
    steps.forEach((section) => {
      const active = Number(section.dataset.step) === step;
      section.hidden = !active;
      section.inert = !active;
    });
    stepper?.querySelectorAll('[data-step]').forEach((item) => {
      const value = Number(item.dataset.step);
      item.classList.toggle('is-active', value === step);
      item.classList.toggle('is-done', value < step);
    });

    if (step === 2) {
      if (bouquetSlot3) bouquetSlot3.appendChild(bouquetCanvas);
      renderBouquet();
    }
    if (step === 4) {
      if (bouquetSlot5) bouquetSlot5.appendChild(bouquetCanvas);
      renderBouquet();
        }

    bouquet.scrollTo({ top: 0, behavior: 'auto' });
    if (focus) {
      const title = steps.find((section) => Number(section.dataset.step) === step)?.querySelector('h2');
      if (title) {
        title.setAttribute('tabindex', '-1');
        try {
          title.focus({ preventScroll: true });
        } catch (error) {}
      }
    }
  };

  const encodeState = () => {
    const counts = {};
    flowers.forEach((flower) => {
      if (state.counts[flower.id]) counts[flower.id] = state.counts[flower.id];
    });
    return btoa(unescape(encodeURIComponent(JSON.stringify({
      counts,
      arrangement: state.arrangement,
      background: state.background,
      cardStyle: state.cardStyle,
      recipient: state.recipient,
      message: state.message,
      sender: state.sender
    }))));
  };

  const decodeState = (raw) => {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (!parsed || typeof parsed !== 'object') return false;
      const counts = {};
      flowers.forEach((flower) => {
        const count = Number(parsed.counts?.[flower.id] || 0);
        if (count > 0) counts[flower.id] = Math.min(15, Math.floor(count));
      });
      if (totalBloomsFor(counts) < 12 || totalBloomsFor(counts) > 15) return false;
      state.counts = counts;
      if (backgrounds.some((item) => item.id === parsed.background)) state.background = parsed.background;
      if (cardStyles.some((item) => item.id === parsed.cardStyle)) state.cardStyle = parsed.cardStyle;
      if (typeof parsed.arrangement === 'number') state.arrangement = Math.max(1, Math.floor(parsed.arrangement));
      if (typeof parsed.recipient === 'string' && parsed.recipient.trim()) state.recipient = parsed.recipient.slice(0, 20);
      if (typeof parsed.message === 'string' && parsed.message.trim()) state.message = parsed.message.slice(0, 120);
      if (typeof parsed.sender === 'string' && parsed.sender.trim()) state.sender = parsed.sender.slice(0, 30);
      return true;
    } catch (error) {
      return false;
    }
  };

  function totalBloomsFor(counts) {
    return Object.values(counts).reduce((sum, value) => sum + value, 0);
  }

  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    url.searchParams.set('bouquet', encodeState());
    return url.toString();
  };

  const copyLink = async () => {
    const url = shareUrl();
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch (error) {
      copied = false;
    }

    if (!copied) {
      const area = document.createElement('textarea');
      area.value = url;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(area);
      area.select();
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      area.remove();
    }

    if (copyStatus) copyStatus.textContent = copied ? '链接已复制。' : '链接已生成，可以直接复制。';
    copyLinkButton.textContent = copied ? 'Link copied' : 'Link ready';
    if (!copied) {
      const link = document.getElementById('shareLink');
      if (link) {
        link.textContent = url;
        link.hidden = false;
      }
    }
    window.setTimeout(() => { copyLinkButton.textContent = 'Create link'; }, 2000);
  };

  const restartHome = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    window.location.replace(url.toString());
  };

  const openQuiz = () => {
    if (!quizModal || entered) return;
    quizFailed = false;
    if (quizTitle) {
      quizTitle.textContent = '先回答三个小问题';
      quizTitle.classList.remove('is-fail-link');
      quizTitle.removeAttribute('role');
      quizTitle.removeAttribute('tabindex');
    }
    quizForm.hidden = false;
    quizFail.hidden = true;
    if (quizAnswer1) quizAnswer1.value = '';
    if (quizAnswer2) quizAnswer2.value = '';
    if (quizAnswer3) quizAnswer3.value = '';
    quizModal.hidden = false;
    body.classList.add('quiz-open');
    bouquet.inert = true;
    quizModal.scrollTop = 0;
    window.setTimeout(() => {
      quizAnswer1?.focus({ preventScroll: true });
      quizModal.scrollTop = 0;
    }, 40);
  };

  quizForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const clean = (value) => value.trim().replace(/\s+/g, '').replace(/[，。,.!?！？、·]/g, '').toLowerCase();
    const name = clean(quizAnswer1?.value || '');
    const age = clean(quizAnswer2?.value || '');
    const expectedName = clean('你像天外来物一样求之不得，我在世俗里的名字不重要了');
    const expectedBirthday = clean('咪');
    const expectedCode = clean('1717');
    const nameOk = name === expectedName;
    const ageOk = age === expectedBirthday;
    const codeOk = clean(quizAnswer3?.value || '') === expectedCode;
    if (nameOk && ageOk && codeOk) {
      document.dispatchEvent(new CustomEvent('birthday:stop-birthday-song'));
      quizModal.hidden = true;
      body.classList.remove('quiz-open');
      bouquet.inert = false;
      enterSite();
      return;
    }
    quizFailed = true;
    quizForm.hidden = true;
    quizFail.hidden = false;
    if (quizTitle) {
      quizTitle.textContent = '答案不对，点击回到首页';
      quizTitle.classList.add('is-fail-link');
      quizTitle.setAttribute('role', 'button');
      quizTitle.setAttribute('tabindex', '0');
      quizTitle.focus({ preventScroll: true });
    }
  });

  quizTitle?.addEventListener('click', () => {
    if (quizFailed) restartHome();
  });
  quizTitle?.addEventListener('keydown', (event) => {
    if (!quizFailed) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    restartHome();
  });

  if (skipped) {
    finish(false);
    return;
  }


  buildFlowers();
  updateFlowers();
  setBehindInert(false);
  bouquet.scrollTo(0, 0);

  nextFlowers?.addEventListener('click', () => {
    if (totalBlooms() >= 12) setStep(2);
  });
  backToFlowers?.addEventListener('click', () => setStep(1));
  nextBouquet?.addEventListener('click', openQuiz);
  backBouquet?.addEventListener('click', () => setStep(2));
  generateCard?.addEventListener('click', () => setStep(4));
  backCard?.addEventListener('click', () => setStep(3));
  rewrapButton?.addEventListener('click', () => {
    state.arrangement += 1;
    renderBouquet();
  });
  copyLinkButton?.addEventListener('click', copyLink);
  enterButton?.addEventListener('click', () => enterSite());
  skipButton?.addEventListener('click', openQuiz);

  setStep(1, false);
})();
