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

// Work section — industry filter menu
const filterMenu = document.getElementById('filterMenu');
const filterMenuToggle = document.getElementById('filterMenuToggle');
const filterMenuLabel = document.getElementById('filterMenuLabel');
const filterMenuList = document.getElementById('filterMenuList');
const workItems = document.querySelectorAll('.work-item');
const workEmpty = document.getElementById('workEmpty');

if (filterMenu && filterMenuToggle && filterMenuList) {
  filterMenuToggle.addEventListener('click', () => {
    const isOpen = filterMenu.classList.toggle('open');
    filterMenuToggle.setAttribute('aria-expanded', isOpen);
  });

  filterMenuList.addEventListener('click', (e) => {
    const item = e.target.closest('.filter-menu-item');
    if (!item) return;

    filterMenuList.querySelectorAll('.filter-menu-item').forEach((i) => i.classList.remove('active'));
    item.classList.add('active');

    filterMenuLabel.textContent = `Filter: ${item.textContent}`;
    filterMenu.classList.remove('open');
    filterMenuToggle.setAttribute('aria-expanded', 'false');

    const filter = item.dataset.filter;
    let visibleCount = 0;

    workItems.forEach((el) => {
      const match = filter === 'all' || el.dataset.industry === filter;
      el.classList.toggle('hidden', !match);
      if (match) visibleCount++;
    });

    workEmpty.classList.toggle('visible', visibleCount === 0);
  });

  document.addEventListener('click', (e) => {
    if (!filterMenu.contains(e.target)) {
      filterMenu.classList.remove('open');
      filterMenuToggle.setAttribute('aria-expanded', 'false');
    }
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
