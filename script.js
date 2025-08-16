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
  if (!typingText) return;

const lines = [
  '<i class="fas fa-cogs"></i> Engineering Future Solutions',
  '<i class="fas fa-tools"></i> Building Scalable Software',
  '<i class="fas fa-lightbulb"></i> Turning Ideas Into Reality',
  '<i class="fas fa-keyboard"></i> Writing Efficient Code',
  '<i class="fas fa-mouse"></i> Interactive Applications',
  '<i class="fas fa-search"></i> Exploring Systems Architecture',
  '<i class="fas fa-code"></i> Clean & Structured Code',
  '<i class="fas fa-database"></i> Data Structures & Algorithms',
  '<i class="fas fa-folder-open"></i> Organized Solutions',
  '<i class="fas fa-puzzle-piece"></i> Problem-Solving with Code'
];



  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let pauseBetweenLines = 1500;

  function type() {
    const currentLine = lines[lineIndex % lines.length]; // Use modulo for infinite loop
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = currentLine;
    const plainText = tempDiv.textContent || tempDiv.innerText;

    if (isDeleting) {
      // Deleting phase
      typingText.innerHTML = plainText.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        lineIndex++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(type, typingSpeed / 2); // Faster deletion
      }
    } else {
      // Typing phase
      typingText.innerHTML = plainText.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex === plainText.length) {
        // Show full HTML version when done typing
        typingText.innerHTML = currentLine;
        isDeleting = true;
        setTimeout(type, pauseBetweenLines);
      } else {
        setTimeout(type, typingSpeed);
      }
    }
  }

  // Add blinking cursor style
  const style = document.createElement('style');
  style.textContent = `
    #typingText::after {
      content: '|';
      animation: blink 1s step-end infinite;
    }
    @keyframes blink {
      from, to { opacity: 1 }
      50% { opacity: 0 }
    }
  `;
  document.head.appendChild(style);

  type(); // Start the animation
}

// Start the animation when DOM is loaded
document.addEventListener('DOMContentLoaded', setupTypingAnimation);


document.addEventListener('DOMContentLoaded', function() {
  const progressBars = document.querySelectorAll('.skill-progress');
  
  // Animate each progress bar
  progressBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width') || bar.style.width;
    bar.style.width = '0';
    
    // Trigger animation after a short delay
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Clone items for perfect infinite loop
  function setupInfiniteLoop(trackClass) {
    const track = document.querySelector(`.${trackClass} .skills-inner`);
    const items = track.innerHTML;
    track.innerHTML = items + items + items; // Triple the items for smoother transition
    
    // Adjust animation duration based on item count
    const itemCount = track.children.length;
    const duration = itemCount * 2; // Adjust multiplier as needed
    
    track.style.animationDuration = `${duration}s`;
  }
  
  setupInfiniteLoop('top-track');
  setupInfiniteLoop('bottom-track');
  
  // Pause on hover
  const carousel = document.querySelector('.skills-carousel');
  carousel.addEventListener('mouseenter', function() {
    this.querySelectorAll('.skills-inner').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
  });
  
  carousel.addEventListener('mouseleave', function() {
    this.querySelectorAll('.skills-inner').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  });
});

// Enhanced JavaScript for animations
document.addEventListener('DOMContentLoaded', function() {
  const stackItems = document.querySelectorAll('.activity-stack-item');
  
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Add staggered delay
        const index = Array.from(stackItems).indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.15}s`;
        
        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe each stack item
  stackItems.forEach(item => {
    observer.observe(item);
    
    // Add hover effect to images
    const imgWrapper = item.querySelector('.image-wrapper');
    const img = item.querySelector('.activity-image img');
    
    imgWrapper.addEventListener('mousemove', (e) => {
      const rect = imgWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const angleX = (y - centerY) / 20;
      const angleY = (centerX - x) / 20;
      
      img.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`;
    });
    
    imgWrapper.addEventListener('mouseleave', () => {
      img.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
  
  // Add ripple effect to download buttons
  const downloadBtns = document.querySelectorAll('.download-btn');
  
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 1000);
    });
  });
});


