// --- Enhanced Smooth Scrolling Setup ---
function setupSmoothScrolling() {
  // Check if the browser supports smooth scrolling
  const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
  
  // Mobile menu elements
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  
  // Close mobile menu if open
  const closeMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('show')) {
      mobileMenu.classList.remove('show');
      if (menuToggle) menuToggle.innerHTML = '☰';
    }
  };
  
  // Handle all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Skip if it's just a # link
      if (targetId === '#') return;
      
      e.preventDefault();
      closeMobileMenu();
      
      const targetElem = document.querySelector(targetId);
      if (!targetElem) return;
      
      // Calculate the scroll position (without header offset)
      const targetPosition = targetElem.getBoundingClientRect().top + window.pageYOffset;
      
      // Use native smooth scrolling if available
      if (supportsSmoothScroll) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } 
      // Fallback for browsers that don't support smooth scroll
      else {
        smoothScrollPolyfill(targetPosition, 800);
      }
      
      // Focus the target element for accessibility
      targetElem.setAttribute('tabindex', '-1');
      targetElem.focus();
    });
  });
  
  // Smooth scroll polyfill for older browsers
  function smoothScrollPolyfill(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    // Easing function for smooth acceleration/deceleration
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupSmoothScrolling();
});
// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');
  setupMobileMenu();
  setupResponsiveFontSize();
  setupSmoothScrolling(); // Enhanced smooth scrolling
  fetchGitHubProjects('mahito-0');
  setupContactForm();
  setupCustomCursor();
  setupImageModal();
  setupTypingAnimation();
  
  // Initialize AOS if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true
    });
  }
  
  // Add scroll effects listener
  window.addEventListener('scroll', handleScrollEffects);
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
        repoImage.classList.add('clickable-img');
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
  bindModalImageClicks();
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
  // Check for standard interactive elements
  const interactiveSelectors = [
    'a[href]',          // Links with href
    'button',           // All button elements
    'input',            // All input elements
    'select',           // Dropdown selects
    'textarea',         // Text areas
    '[role="button"]',  // Elements with button role
    '[role="link"]',    // Elements with link role
    '[contenteditable]',// Editable elements
    '[tabindex]:not([tabindex="-1"])', // Focusable elements
    'label',            // Form labels
    'video',            // Video elements
    'audio',            // Audio elements
    'iframe',           // Embedded iframes
    '[data-clickable]'  // Custom clickable elements
  ].join(',');
  
  // Check if element matches any interactive selector
  if (element.matches(interactiveSelectors)) {
    return true;
  }
  
  // Check if element is inside an interactive element
  return element.closest(interactiveSelectors) !== null;
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
function setupImageModal() {
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.img-modal-close');

  let scale = 1,
    isDragging = false,
    startX = 0,
    startY = 0,
    currentX = 0,
    currentY = 0;

  // Function to initialize modal behavior for an image
  function initImageModal(img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      scale = 1;
      currentX = 0;
      currentY = 0;
      modalImg.style.transform = `translate(0, 0) scale(${scale})`;
      modal.style.display = 'flex';
      modalImg.src = img.src;
      modalImg.alt = img.alt || '';
      modalImg.style.cursor = 'grab';
    });
  }

  // Initialize for existing images
  document.querySelectorAll('.clickable-img').forEach(initImageModal);

  // Observer to handle dynamically loaded images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.classList && node.classList.contains('clickable-img')) {
            initImageModal(node);
          }
          node.querySelectorAll('.clickable-img').forEach(initImageModal);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function closeModal() {
    modal.style.display = 'none';
    isDragging = false;
    modalImg.style.cursor = 'grab';
    modalImg.classList.remove('dragging');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

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

  // Touch support
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
}
// --- Typing Animation ---
function setupTypingAnimation() {
  const typingText = document.getElementById('typingText');
  if (!typingText) {
    console.error("Element with ID 'typingText' not found");
    return;
  }

  const lines = [
    '👨‍💻 Student @ | <a href="https://www.aiub.edu/" target="_blank"><strong>AIUB</strong></a> |',
    '🔍 Exploring Systems.',
    '⚙️ Engineering The Future.'

  ];

  let lineIndex = 0;
  let charIndex = 0;
  let typingSpeed = 50;

  function type() {
    if (lineIndex >= lines.length) return; // Stop after all lines

    const currentLine = lines[lineIndex];

    // Create a temporary element to strip HTML for typing
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = currentLine;
    const plainText = tempDiv.textContent || tempDiv.innerText;

    // Show previous lines fully + current line partially
    typingText.innerHTML =
      lines.slice(0, lineIndex).join('<br>') +
      (lineIndex > 0 ? '<br>' : '') +
      plainText.substring(0, charIndex + 1);

    charIndex++;

    if (charIndex === plainText.length) {
      // Once line is fully typed, replace with full HTML version
      typingText.innerHTML =
        lines.slice(0, lineIndex).join('<br>') +
        (lineIndex > 0 ? '<br>' : '') +
        currentLine;

      lineIndex++;
      charIndex = 0;
      setTimeout(type, 500); // pause before next line
    } else {
      setTimeout(type, typingSpeed);
    }
  }

  type();
}

