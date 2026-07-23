(() => {
  const COUNTER = 110938181;
  const goal = (name) => { if (typeof ym !== 'undefined') ym(COUNTER, 'reachGoal', name); };

  // UTM: читаем из URL, запоминаем на сессию, раскладываем в скрытые поля
  (function initUTM() {
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const params = new URLSearchParams(window.location.search);
    keys.forEach(k => {
      const fromUrl = params.get(k);
      if (fromUrl) { try { sessionStorage.setItem(k, fromUrl); } catch (e) {} }
      let stored = null;
      try { stored = sessionStorage.getItem(k); } catch (e) {}
      const field = document.getElementById(k);
      if (field && stored) field.value = stored;
    });
  })();

  const modal = document.querySelector('#modal');
  const topic = document.querySelector('#topic');
  const form = document.querySelector('#lead-form');
  const status = document.querySelector('#status');

  function openModal(button) {
    if (!modal) return;
    if (topic) topic.value = button?.dataset.topic || 'Заявка со страницы Террсан';
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

  document.querySelectorAll('a[href^="tel:"]').forEach(a =>
    a.addEventListener('click', () => goal('PHONE_CLICK')));
  document.querySelectorAll('a[href*="t.me/"]:not(.tg-after)').forEach(a =>
    a.addEventListener('click', () => goal('TG_CLICK')));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    const lines = [
      'Заявка с сайта ВЕНИК, ВДГ (страница /terrsan)',
      `Тема: ${data.get('topic') || ''}`,
      `Организация: ${data.get('company') || ''}`,
      `Контактное лицо: ${data.get('contact') || ''}`,
      `Телефон: ${data.get('phone') || ''}`,
      `E-mail: ${data.get('email') || ''}`,
      `Площадь: ${data.get('area') || ''} га`,
      `Тип объекта: ${data.get('object_type') || ''}`,
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
      goal('ZAYAVKA');
      goal('ZAYAVKA_TERRSAN');
      if (result.tg) {
        const tgLink = document.createElement('a');
        tgLink.href = result.tg;
        tgLink.target = '_blank';
        tgLink.rel = 'noopener';
        tgLink.className = 'btn primary wide tg-after';
        tgLink.style.marginTop = '10px';
        tgLink.textContent = 'Продолжить в Telegram — быстрый ответ';
        tgLink.addEventListener('click', () => goal('TG_AFTER_ZAYAVKA'));
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
})();
