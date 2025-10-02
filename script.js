// script.js
// FlavorJourney — search, filters, modal, theme, animation re-trigger

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.card'));
    const themeToggle = document.getElementById('themeToggle');
  
    // Theme persistence
    const savedTheme = localStorage.getItem('flavorjourney-theme');
    if (savedTheme === 'dark') document.body.classList.add('dark'), themeToggle.textContent = '☀️';
  
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem('flavorjourney-theme', isDark ? 'dark' : 'light');
    });
  
    // Search: filter by card title
    const filterBySearch = () => {
      const q = (searchInput.value || '').trim().toLowerCase();
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const matches = title.includes(q);
        card.style.display = matches ? '' : 'none';
      });
    };
    searchInput.addEventListener('input', debounce(filterBySearch, 160));
  
    // Category filters
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        cards.forEach(card => {
          const matchCat = (cat === 'all' || card.dataset.cat === cat);
          const currentlyVisibleBySearch = card.style.display !== 'none' || searchInput.value === '';
          // If search active, we still respect search — do combined logic:
          const titleMatch = (card.querySelector('h3').textContent.toLowerCase().includes((searchInput.value||'').toLowerCase()));
          const shouldShow = matchCat && (searchInput.value ? titleMatch : true);
          if (shouldShow) {
            // show and retrigger animation
            card.style.display = '';
            retriggerAnimation(card);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  
    // When search changes, keep selected category applied
    searchInput.addEventListener('input', () => {
      const activeCat = document.querySelector('.filter-btn.active').dataset.cat;
      cards.forEach(card => {
        const titleMatch = card.querySelector('h3').textContent.toLowerCase().includes((searchInput.value||'').toLowerCase());
        const catMatch = (activeCat === 'all' || card.dataset.cat === activeCat);
        if (titleMatch && catMatch) {
          card.style.display = '';
          retriggerAnimation(card);
        } else {
          card.style.display = 'none';
        }
      });
    });
  
    // Modal behavior: open when clicking View Recipe
    const modal = document.getElementById('modal');
    const modalPanel = modal.querySelector('.modal-panel');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalIngredients = document.getElementById('modalIngredients');
    const modalInstructions = document.getElementById('modalInstructions');
    const modalClose = modal.querySelector('.modal-close');
  
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // find parent card
        const card = e.target.closest('.card');
        openModalForCard(card);
      });
    });
  
    function openModalForCard(card) {
      if (!card) return;
      const title = card.dataset.title || card.querySelector('h3').textContent;
      const img = card.dataset.img || card.querySelector('img').src;
      const ingredients = (card.dataset.ingredients || '').split('||').filter(Boolean);
      const instructions = (card.dataset.instructions || '').split('||').filter(Boolean);
  
      modalImage.src = img;
      modalImage.alt = title;
      modalTitle.textContent = title;
  
      // fill ingredients
      modalIngredients.innerHTML = '';
      if (ingredients.length) {
        ingredients.forEach(it => {
          const li = document.createElement('li');
          li.textContent = it.trim();
          modalIngredients.appendChild(li);
        });
      } else {
        const na = document.createElement('p'); na.textContent = 'No ingredients listed.'; modalIngredients.appendChild(na);
      }
  
      // fill instructions
      modalInstructions.innerHTML = '';
      if (instructions.length) {
        instructions.forEach(step => {
          const li = document.createElement('li');
          li.textContent = step.trim();
          modalInstructions.appendChild(li);
        });
      } else {
        const na = document.createElement('p'); na.textContent = 'No instructions provided.'; modalInstructions.appendChild(na);
      }
  
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      // trap focus (basic)
      modalClose.focus();
    }
  
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden','true');
    }
  
    // helpers
    function retriggerAnimation(el) {
      el.style.animation = 'none';
      // force reflow
      void el.offsetWidth;
      el.style.animation = 'cardIn 520ms ease forwards';
    }
  
    function debounce(fn, t = 120) {
      let tid;
      return (...a) => { clearTimeout(tid); tid = setTimeout(() => fn(...a), t); };
    }
  
    // initial small stagger effect for cards
    cards.forEach((c, i) => {
      c.style.animationDelay = `${i * 80}ms`;
    });
  });
  