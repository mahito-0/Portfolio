// --- DOMContentLoaded Main Setup ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');

  setupMobileMenu();
  setupResponsiveFontSize();
  setupSmoothScrolling();
  fetchGitHubProjects('mahito-0');
  setupContactForm();
  setupCustomCursor();
  window.sendmail = sendmail;
});

// --- Mobile Menu Toggle ---
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');
  if (!(menuToggle && mobileMenu)) {
    console.error('Menu toggle or mobile menu element not found');
    return;
  }

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
    menuToggle.innerHTML = mobileMenu.classList.contains('show') ? '✕' : '☰';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('show');
      menuToggle.innerHTML = '☰';
    });
  });

  document.addEventListener('click', (e) => {
    if (
      !mobileMenu.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      mobileMenu.classList.contains('show')
    ) {
      mobileMenu.classList.remove('show');
      menuToggle.innerHTML = '☰';
    }
  });
}

// --- Responsive Font Size ---
function setupResponsiveFontSize() {
  const setResponsiveFontSize = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.style.setProperty('--font-size-base', isMobile ? '14px' : '16px');
  };
  setResponsiveFontSize();
  window.addEventListener('resize', setResponsiveFontSize);
}

// --- Smooth Scrolling for Anchor Links ---
function setupSmoothScrolling() {
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
      if (mobileMenu && mobileMenu.classList.contains('show')) {
        mobileMenu.classList.remove('show');
        if (menuToggle) menuToggle.innerHTML = '☰';
      }
    });
  });
}

// --- Fetch GitHub Projects and Render ---
async function fetchGitHubProjects(username) {
  try {
    console.log('Fetching GitHub projects for:', username);
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!response.ok) throw new Error('Network response was not ok');
    let repos = await response.json();
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const projectsList = document.getElementById('projects-list');
    const cardTemplate = document.getElementById('card-template');
    if (!projectsList || !cardTemplate) {
      console.error('Projects list container or card template not found');
      return;
    }
    projectsList.innerHTML = '';

    for (const repo of repos) {
      const card = document.importNode(cardTemplate.content, true);
      const cardElement = card.querySelector('.project-card');
      if (!cardElement) continue;

      // Title
      const repoLinkTitle = cardElement.querySelector('.repo-link-title');
      if (repoLinkTitle) repoLinkTitle.textContent = repo.name;

      // GitHub link
      const repoLink = cardElement.querySelector('.repo-link');
      if (repoLink) {
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
        repoLink.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> View on GitHub`;
      }

      // Description
      const repoDescription = cardElement.querySelector('.repo-description');
      if (repoDescription) repoDescription.textContent = repo.description || 'No description available';

      // Stars
      const repoStars = cardElement.querySelector('.repo-stars');
      if (repoStars) {
        repoStars.textContent = `⭐ ${repo.stargazers_count}`;
        repoStars.classList.add('badge', 'stars');
      }

      // Forks
      const repoForks = cardElement.querySelector('.repo-forks');
      if (repoForks) {
        repoForks.textContent = `🍴 ${repo.forks_count}`;
        repoForks.classList.add('badge', 'forks');
      }

      // Dates
      const projectMeta = cardElement.querySelector('.project-meta');
      if (projectMeta) {
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        const dateSpan = document.createElement('span');
        dateSpan.textContent = `📅 Updated: ${updatedDate}`;
        dateSpan.classList.add('badge', 'dates');
        projectMeta.appendChild(dateSpan);
      }

      // Image
      const repoImage = cardElement.querySelector('.project-image img');
      if (repoImage) {
        const imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/img/proimg.png`;
        try {
          const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
          repoImage.src = imgResponse.ok ? imageUrl : '/placeholder.svg';
        } catch {
          repoImage.src = '/placeholder.svg';
        }
      }

      projectsList.appendChild(card);
    }
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    const projectsList = document.getElementById('projects-list');
    if (projectsList) {
      projectsList.innerHTML = '<p>Could not load projects. Please try again later.</p>';
    }
  }
}

// --- Contact Form Submission Handling ---
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const resultMessage = document.querySelector('.result-message');
    if (resultMessage) {
      resultMessage.style.display = 'block';
      setTimeout(() => {
        resultMessage.style.display = 'none';
      }, 5000);
    }
    contactForm.reset();
  });
}

// --- Custom Mouse Cursor Movement and Hover Effect ---
function setupCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.top = e.clientY + 'px';
    cursor.style.left = e.clientX + 'px';
    if (isClickable(e.target)) {
      cursor.classList.add('clickable-hover');
    } else {
      cursor.classList.remove('clickable-hover');
    }
  });

  function isClickable(element) {
    return element.closest('a, button, input[type="button"], input[type="submit"], [role="button"], label, select, textarea') !== null;
  }
}

// --- EmailJS Send Mail Function ---
function sendmail() {
  const message = document.getElementById('message').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  if (!name || !email) {
    alert('Name and email are required!');
    return;
  }

  const templateParams = {
    from_name: name,
    message: message,
    reply_to: email,
  };

  const sendButton = document.getElementById('sendLetter');
  if (sendButton) {
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;
  }

  emailjs
    .send('service_zsci4of', 'template_t5wnh4c', templateParams)
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text);
      alert('Message sent successfully!');
      document.getElementById('message').value = '';
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      if (sendButton) {
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
      }
    })
    .catch((error) => {
      console.error('FAILED...', error);
      alert('Message failed to send!');
      if (sendButton) {
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
      }
    });
}

// --- Photo Modal, Zoom, Pan, Touch ---
const modal = document.getElementById('img-modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.querySelector('.img-modal-close');
let scale = 1, isDragging = false, startX = 0, startY = 0, currentX = 0, currentY = 0;
modalImg.setAttribute('draggable', 'false');

document.querySelectorAll('.clickable-img').forEach(img => {
  img.addEventListener('click', () => {
    scale = 1; currentX = 0; currentY = 0;
    modalImg.style.transform = `translate(0, 0) scale(${scale})`;
    modal.style.display = 'flex';
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalImg.style.cursor = 'grab';
  });
});

function closeModal() {
  modal.style.display = 'none';
  isDragging = false;
  modalImg.style.cursor = 'grab';
  modalImg.classList.remove('dragging');
}
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

modalImg.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale += delta;
  scale = Math.min(Math.max(1, scale), 5);
  modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
});

modalImg.addEventListener('mousedown', e => {
  if (scale <= 1) return;
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - currentX;
  startY = e.clientY - currentY;
  modalImg.style.cursor = 'grabbing';
  modalImg.classList.add('dragging');
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    modalImg.style.cursor = 'grab';
    modalImg.classList.remove('dragging');
  }
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  currentX = e.clientX - startX;
  currentY = e.clientY - startY;
  modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
});

// --- Touch Support ---
let lastTouchDist = null, lastTouchX = null, lastTouchY = null;
modalImg.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    lastTouchDist = getTouchDist(e.touches);
  } else if (e.touches.length === 1 && scale > 1) {
    lastTouchX = e.touches[0].clientX - currentX;
    lastTouchY = e.touches[0].clientY - currentY;
  }
}, { passive: false });

modalImg.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const currentDist = getTouchDist(e.touches);
    if (lastTouchDist !== null) {
      let deltaScale = (currentDist - lastTouchDist) / 200;
      scale += deltaScale;
      scale = Math.min(Math.max(1, scale), 5);
      modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    }
    lastTouchDist = currentDist;
  } else if (e.touches.length === 1 && scale > 1) {
    currentX = e.touches[0].clientX - lastTouchX;
    currentY = e.touches[0].clientY - lastTouchY;
    modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  }
}, { passive: false });

modalImg.addEventListener('touchend', e => {
  if (e.touches.length < 2) lastTouchDist = null;
});

function getTouchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}
