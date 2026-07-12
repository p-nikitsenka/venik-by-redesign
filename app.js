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
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(() => document.querySelector('#contact')?.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
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
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      status.textContent = 'Заявка скопирована. Позвоните нам или отправьте её удобным способом.';
    } catch {
      status.textContent = 'Заявка подготовлена. Позвоните по номеру +375 29 656-52-52.';
    }
  });

  calculate();
})();
