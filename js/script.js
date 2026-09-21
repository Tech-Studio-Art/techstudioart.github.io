// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Work section — industry filter
const filterBar = document.getElementById('filterBar');
const workItems = document.querySelectorAll('.work-item');
const workEmpty = document.getElementById('workEmpty');

if (filterBar) {
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visibleCount = 0;

    workItems.forEach((item) => {
      const match = filter === 'all' || item.dataset.industry === filter;
      item.classList.toggle('hidden', !match);
      if (match) visibleCount++;
    });

    workEmpty.classList.toggle('visible', visibleCount === 0);
  });
}

// Contact form — basic client-side handling (no backend wired up)
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const original = submitBtn.textContent;
    submitBtn.textContent = 'Message sent';
    contactForm.reset();
    setTimeout(() => {
      submitBtn.textContent = original;
    }, 2500);
  });
}
