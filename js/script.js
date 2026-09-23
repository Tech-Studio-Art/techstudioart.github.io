// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Work section — industry filter
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
const filterOptions = document.getElementById('filterOptions');
const workItems = document.querySelectorAll('.work-item');
const workEmpty = document.getElementById('workEmpty');

if (filterToggle && filterPanel && filterOptions) {
  filterToggle.addEventListener('click', () => {
    const isHidden = filterPanel.hasAttribute('hidden');
    if (isHidden) {
      filterPanel.removeAttribute('hidden');
    } else {
      filterPanel.setAttribute('hidden', '');
    }
    filterToggle.setAttribute('aria-expanded', isHidden);
  });

  filterOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.filter-option');
    if (!option) return;

    filterOptions.querySelectorAll('.filter-option').forEach((o) => o.classList.remove('active'));
    option.classList.add('active');

    const filter = option.dataset.filter;
    filterToggle.textContent = filter === 'all' ? 'Filter' : `Filter: ${option.textContent}`;
    filterPanel.setAttribute('hidden', '');
    filterToggle.setAttribute('aria-expanded', 'false');

    let visibleCount = 0;

    workItems.forEach((el) => {
      const match = filter === 'all' || el.dataset.industry === filter;
      el.classList.toggle('hidden', !match);
      if (match) visibleCount++;
    });

    workEmpty.classList.toggle('visible', visibleCount === 0);
  });
}

// Contact form — submits to Web3Forms (https://web3forms.com)
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';
    if (formStatus) formStatus.textContent = '';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        submitBtn.textContent = 'MESSAGE SENT';
        contactForm.reset();
      } else {
        submitBtn.textContent = 'SOMETHING WENT WRONG';
        if (formStatus) formStatus.textContent = result.message || 'Please try again.';
      }
    } catch (err) {
      submitBtn.textContent = 'SOMETHING WENT WRONG';
      if (formStatus) formStatus.textContent = 'Network error — please try again.';
    }

    submitBtn.disabled = false;
    setTimeout(() => {
      submitBtn.textContent = original;
    }, 2500);
  });
}
