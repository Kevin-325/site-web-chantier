/* ============================================================
   TRUE PANAFRICAN CONSTRUCTION SARL — Interactions
   ============================================================ */

// ---------- Année courante (footer) ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Navbar : ombre au scroll ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ---------- Menu mobile (burger) ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

// Fermer le menu au clic sur un lien
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Lien actif selon la section visible ----------
const sections = document.querySelectorAll('section[id]');
const menuLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      menuLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ---------- Animations d'apparition (reveal) ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Chiffres-clés : animation de comptage ----------
const statsSection = document.getElementById('stats');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (statsSection) {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statsSection.querySelectorAll('.stat__value').forEach(animateCount);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statsObserver.observe(statsSection);
}

// ---------- Galerie : filtres ----------
const chips = document.querySelectorAll('.chip');
const galleryItems = document.querySelectorAll('.gallery__item');

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    galleryItems.forEach(item => {
      item.classList.toggle('hidden', filter !== 'all' && item.dataset.cat !== filter);
    });
  });
});

// ---------- Lightbox : voir les images de la galerie en grand ----------
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
const lbCounter = document.getElementById('lbCounter');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentIndex = 0;

// Liste des images actuellement visibles (respecte le filtre actif)
function visibleItems() {
  return [...galleryItems].filter(item => !item.classList.contains('hidden'));
}

function showImage(index) {
  const items = visibleItems();
  if (!items.length) return;
  // Boucle : après la dernière on revient à la première
  currentIndex = (index + items.length) % items.length;
  const item = items[currentIndex];
  const img = item.querySelector('img');
  const caption = item.querySelector('figcaption');

  lbImage.src = img.src;
  lbImage.alt = img.alt;
  lbCaption.textContent = caption ? caption.textContent : '';
  lbCounter.textContent = (currentIndex + 1) + ' / ' + items.length;
}

function openLightbox(index) {
  showImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // bloque le scroll en arrière-plan
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Clic sur une image de la galerie → ouverture en grand
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    openLightbox(visibleItems().indexOf(item));
  });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', e => { e.stopPropagation(); showImage(currentIndex - 1); });
lbNext.addEventListener('click', e => { e.stopPropagation(); showImage(currentIndex + 1); });

// Clic sur le fond sombre → fermeture
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// Navigation au clavier : Échap, flèches gauche/droite
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

// Navigation tactile (swipe) sur mobile
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 50) showImage(currentIndex + (delta < 0 ? 1 : -1));
}, { passive: true });

// ---------- Formulaire de contact ----------
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', e => {
  e.preventDefault();

  const nom = form.nom.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  // Validation simple
  if (!nom || !email || !message) {
    status.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
    status.className = 'form__status err';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = 'Veuillez saisir une adresse email valide.';
    status.className = 'form__status err';
    return;
  }

  // Ouverture du client mail avec le contenu pré-rempli (pas de backend requis)
  const sujet = encodeURIComponent('Demande de devis — ' + nom);
  const corps = encodeURIComponent(
    'Nom : ' + nom + '\n' +
    'Email : ' + email + '\n' +
    'Téléphone : ' + (form.telephone.value.trim() || 'Non renseigné') + '\n\n' +
    'Message :\n' + message
  );
  window.location.href = 'mailto:truepanafricanconstruction@gmail.com?subject=' + sujet + '&body=' + corps;

  status.textContent = 'Merci ! Votre client de messagerie va s\'ouvrir pour envoyer la demande.';
  status.className = 'form__status ok';
  form.reset();
});
