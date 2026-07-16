(() => {
  const RATE = 0.35;
  const PACK = 0.5;
  const PRICE = 590;
  const areaInput = document.querySelector('#area');
  const kgEl = document.querySelector('#kg');
  const packsEl = document.querySelector('#packs');
  const sumEl = document.querySelector('#sum');
  const orderBtn = document.querySelector('#order');
  const modal = document.querySelector('#modal');
  const topic = document.querySelector('#topic');
  const calculation = document.querySelector('#calculation');
  const leadArea = document.querySelector('#lead-area');
  const form = document.querySelector('#lead-form');
  const status = document.querySelector('#status');

  const format = (value, digits = 0) => new Intl.NumberFormat('ru-BY', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);

  function calculate() {
    const area = Math.max(0, Number(areaInput?.value || 0));
    const rawKg = area * RATE;
    const packs = Math.ceil(rawKg / PACK);
    const roundedKg = packs * PACK;
    const total = roundedKg * PRICE;

    if (kgEl) kgEl.innerHTML = `${format(roundedKg, roundedKg % 1 ? 1 : 0)} <small>кг</small>`;
    if (packsEl) packsEl.innerHTML = `${format(packs)} <small>фл.</small>`;
    if (sumEl) sumEl.innerHTML = `${format(total)} <small>BYN</small>`;
    if (orderBtn) orderBtn.textContent = `Получить счёт на ${packs} ${packs === 1 ? 'флакон' : packs < 5 ? 'флакона' : 'флаконов'}`;
    if (calculation) calculation.value = `${area} га; ${roundedKg} кг; ${packs} фл.; ${total} BYN без НДС`;
    if (leadArea && document.activeElement !== leadArea) leadArea.value = area || '';
  }

  function openModal(button) {
    if (!modal) return;
    if (topic) topic.value = button?.dataset.topic || 'Заявка с сайта';
    calculate();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(() => document.querySelector('#contact')?.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  }

  document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => openModal(btn)));
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  areaInput?.addEventListener('input', calculate);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const lines = [
      'Заявка с сайта ВЕНИК, ВДГ',
      `Тема: ${data.get('topic') || ''}`,
      `Организация: ${data.get('company') || ''}`,
      `Контактное лицо: ${data.get('contact') || ''}`,
      `Телефон: ${data.get('phone') || ''}`,
      `E-mail: ${data.get('email') || ''}`,
      `Площадь: ${data.get('area') || ''} га`,
      `Тип объекта: ${data.get('object_type') || ''}`,
      `Расчёт: ${data.get('calculation') || ''}`,
      `Комментарий: ${data.get('comment') || ''}`
    ];

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    status.textContent = 'Отправляем заявку…';
    status.classList.add('show');

    try {
      const response = await fetch('https://api.borshevik.by/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('server');
      const result = await response.json();
      status.textContent = 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      if (result.tg) {
        const tgLink = document.createElement('a');
        tgLink.href = result.tg;
        tgLink.target = '_blank';
        tgLink.rel = 'noopener';
        tgLink.className = 'btn primary wide';
        tgLink.style.marginTop = '10px';
        tgLink.textContent = 'Продолжить в Telegram — быстрый ответ';
        status.appendChild(document.createElement('br'));
        status.appendChild(tgLink);
      }
      form.reset();
    } catch {
      try {
        await navigator.clipboard.writeText(lines.join('\n'));
        status.textContent = 'Не удалось отправить автоматически. Заявка скопирована в буфер — отправьте её нам или позвоните +375 29 656-52-52.';
      } catch {
        status.textContent = 'Не удалось отправить. Позвоните по номеру +375 29 656-52-52.';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const menu = document.querySelector('#menu');
  const burger = document.querySelector('#burger');
  burger?.addEventListener('click', () => menu?.classList.add('open'));
  menu?.querySelectorAll('[data-menuclose]').forEach(el =>
    el.addEventListener('click', () => menu.classList.remove('open')));

  const totop = document.querySelector('#totop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) totop?.classList.add('show');
    else totop?.classList.remove('show');
  });
  totop?.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  const tlvideo = document.querySelector('.tlvideo');
  if (tlvideo && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const v = entry.target;
        if (!v.src && v.dataset.src) {
          v.src = v.dataset.src;
          v.play().catch(() => {});
        }
        vio.unobserve(v);
      });
    }, { rootMargin: '400px' });
    vio.observe(tlvideo);
  } else if (tlvideo && tlvideo.dataset.src) {
    tlvideo.src = tlvideo.dataset.src;
  }

  calculate();
})();
