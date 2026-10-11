(() => {
  document.documentElement.classList.remove('no-js');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  // Sticky nav background
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll (staggered within each parent)
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${siblings.indexOf(el) * 0.1}s`);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Card spotlight follows the cursor
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Contact form → opens the mail client with a prefilled message
  const form = document.getElementById('contact-form');
  const hint = form.querySelector('.form__hint');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.checkValidity() && field.value.trim() !== '';
      field.parentElement.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      hint.textContent = 'Bitte fülle alle Felder korrekt aus.';
      return;
    }
    const data = new FormData(form);
    const subject = `Anfrage: ${data.get('topic')} – ${data.get('name')}`;
    const body = `${data.get('message')}\n\n—\n${data.get('name')}\n${data.get('email')}`;
    window.location.href = `mailto:hello@kleos-entertainment.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    hint.textContent = 'Danke! Dein E-Mail-Programm öffnet sich.';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
