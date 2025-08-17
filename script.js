/* 
 * MAIN INITIALIZATION
 * Sets up all functionality when the DOM is fully loaded
 * Initializes third-party libraries and scroll effects
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');
  setupMobileMenu();
  setupResponsiveFontSize();
  setupSmoothScrolling();
  fetchGitHubProjects('mahito-0');
  setupContactForm();
  setupCustomCursor();
  setupImageModal();
  setupTypingAnimation();
  
  // Initialize Animate On Scroll library if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true
    });
  }
  
  // Set up scroll event listeners for dynamic effects
  window.addEventListener('scroll', handleScrollEffects);
});

// ==================== NAVIGATION FUNCTIONS ====================

/**
 * MOBILE MENU TOGGLE
 * Handles showing/hiding mobile menu and toggle button states
 * Manages click events both inside and outside the menu
 */
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');
  
  if (!(menuToggle && mobileMenu)) {
    console.error('Menu toggle or mobile menu element not found');
    return;
  }

  // Toggle menu visibility and update button icon
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');
    menuToggle.innerHTML = mobileMenu.classList.contains('show') ? '✕' : '☰';
  });

  // Close menu when clicking on any link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('show');
      menuToggle.innerHTML = '☰';
    });
  });

  // Close menu when clicking outside
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

// ==================== LAYOUT & RESPONSIVE FUNCTIONS ====================

/**
 * DYNAMIC FONT SIZING
 * Adjusts base font size based on viewport width
 * Ensures better readability on mobile devices
 */
function setupResponsiveFontSize() {
  const setResponsiveFontSize = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.style.setProperty('--font-size-base', isMobile ? '14px' : '16px');
  };
  
  // Set initial size and update on window resize
  setResponsiveFontSize();
  window.addEventListener('resize', setResponsiveFontSize);
}

// ==================== SCROLLING & NAVIGATION FUNCTIONS ====================

/**
 * ENHANCED SMOOTH SCROLLING
 * Provides smooth scrolling to anchor links with:
 * - Native browser support detection
 * - Polyfill for older browsers
 * - Mobile menu auto-closing
 * - Accessibility focus management
 */
function setupSmoothScrolling() {
  // Feature detection for native smooth scrolling
  const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
  
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  
  // Close mobile menu if open during navigation
  const closeMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains('show')) {
      mobileMenu.classList.remove('show');
      if (menuToggle) menuToggle.innerHTML = '☰';
    }
  };
  
  // Process all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Skip empty anchor links
      if (targetId === '#') return;
      
      e.preventDefault();
      closeMobileMenu();
      
      const targetElem = document.querySelector(targetId);
      if (!targetElem) return;
      
      // Calculate scroll position (accounting for current scroll)
      const targetPosition = targetElem.getBoundingClientRect().top + window.pageYOffset;
      
      // Use native smooth scrolling if available
      if (supportsSmoothScroll) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } 
      // Fallback to JavaScript implementation
      else {
        smoothScrollPolyfill(targetPosition, 800);
      }
      
      // Improve accessibility by focusing target
      targetElem.setAttribute('tabindex', '-1');
      targetElem.focus();
    });
  });
  
  /**
   * SMOOTH SCROLL POLYFILL
   * Custom implementation using requestAnimationFrame
   * Features easing for natural acceleration/deceleration
   */
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
    
    // Quadratic easing function for smooth transitions
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
  }
}

// ==================== GITHUB FETCHING ====================

/**
 * GITHUB LOADER
 * Fetches and displays GitHub repositories with:
 * - API error handling
 * - Dynamic card generation
 * - Image fallbacks
 * - Sorting by update date
 */
async function fetchGitHubProjects(username) {
  try {
    console.log('Fetching GitHub projects for:', username);
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Get and sort repositories by update date (newest first)
    let repos = await response.json();
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const projectsList = document.getElementById('projects-list');
    const cardTemplate = document.getElementById('card-template');
    
    if (!projectsList || !cardTemplate) {
      console.error('Projects list container or card template not found');
      return;
    }
    
    // Clear existing content
    projectsList.innerHTML = '';

    // Process each repository
    for (const repo of repos) {
      const card = document.importNode(cardTemplate.content, true);
      const cardElement = card.querySelector('.project-card');
      if (!cardElement) continue;

      // Set repository name
      const repoLinkTitle = cardElement.querySelector('.repo-link-title');
      if (repoLinkTitle) repoLinkTitle.textContent = repo.name;

      // Configure GitHub link (opens in new tab)
      const repoLink = cardElement.querySelector('.repo-link');
      if (repoLink) {
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
        repoLink.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> View on GitHub`;
      }

      // Set description or fallback text
      const repoDescription = cardElement.querySelector('.repo-description');
      if (repoDescription) {
        repoDescription.textContent = repo.description || 'No description available';
      }

      // Add stars count badge
      const repoStars = cardElement.querySelector('.repo-stars');
      if (repoStars) {
        repoStars.textContent = `⭐ ${repo.stargazers_count}`;
        repoStars.classList.add('badge', 'stars');
      }

      // Add forks count badge
      const repoForks = cardElement.querySelector('.repo-forks');
      if (repoForks) {
        repoForks.textContent = `🍴 ${repo.forks_count}`;
        repoForks.classList.add('badge', 'forks');
      }

      // Add last updated date
      const projectMeta = cardElement.querySelector('.project-meta');
      if (projectMeta) {
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        const dateSpan = document.createElement('span');
        dateSpan.textContent = `📅 Updated: ${updatedDate}`;
        dateSpan.classList.add('badge', 'dates');
        projectMeta.appendChild(dateSpan);
      }

      // Try to load repository image (with fallback)
      const repoImage = cardElement.querySelector('.project-image img');
      if (repoImage) {
        repoImage.classList.add('clickable-img');
        const imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/img/proimg.png`;
        
        try {
          // Check if image exists (HEAD request)
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

// ==================== FORM HANDLING ====================

/**
 * CONTACT FORM SETUP
 * Handles form submission with:
 * - Basic validation
 * - Success/error feedback
 * - Form reset after submission
 */
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const resultMessage = document.querySelector('.result-message');
    
    // Show temporary success message
    if (resultMessage) {
      resultMessage.style.display = 'block';
      setTimeout(() => {
        resultMessage.style.display = 'none';
      }, 5000);
    }
    
    // Reset form fields
    contactForm.reset();
  });
}

// ==================== CUSTOM CURSOR ====================

/**
 * CUSTOM CURSOR IMPLEMENTATION
 * Replaces default cursor with custom element that:
 * - Follows mouse movement
 * - Changes appearance on interactive elements
 * - Provides visual feedback
 */
function setupCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  // Update cursor position
  document.addEventListener('mousemove', (e) => {
    cursor.style.top = e.clientY + 'px';
    cursor.style.left = e.clientX + 'px';
    
    // Add hover effect for clickable elements
    if (isClickable(e.target)) {
      cursor.classList.add('clickable-hover');
    } else {
      cursor.classList.remove('clickable-hover');
    }
  });

  /**
   * CLICKABLE ELEMENT DETECTION
   * Identifies interactive elements that should trigger cursor change
   */
  function isClickable(element) {
    const interactiveSelectors = [
      'a[href]', 'button', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])', 'label', 'video',
      'audio', 'iframe', '[data-clickable]'
    ].join(',');
    
    return element.matches(interactiveSelectors) || 
           element.closest(interactiveSelectors) !== null;
  }
}

// ==================== EMAIL FUNCTIONALITY ====================

/**
 * EMAIL SENDING FUNCTION
 * Uses EmailJS service to:
 * - Validate required fields
 * - Send form data
 * - Handle success/error states
 * - Manage button states during sending
 */
function sendmail() {
  // Get form values
  const message = document.getElementById('message').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  // Basic validation
  if (!name || !email) {
    alert('Name and email are required!');
    return;
  }

  // Prepare email parameters
  const templateParams = {
    from_name: name,
    message: message,
    reply_to: email,
  };

  // Update button state
  const sendButton = document.getElementById('sendLetter');
  if (sendButton) {
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;
  }

  // Send email via EmailJS
  emailjs
    .send('service_zsci4of', 'template_t5wnh4c', templateParams)
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text);
      alert('Message sent successfully!');
      
      // Clear form and reset button
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
      
      // Reset button on error
      if (sendButton) {
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
      }
    });
}

// ==================== IMAGE MODAL & ZOOM ====================

/**
 * IMAGE MODAL SYSTEM
 * Creates zoomable, draggable image viewer with:
 * - Click-to-zoom functionality
 * - Mouse and touch support
 * - Smooth zoom/pan controls
 * - Dynamic loading for images
 */
function setupImageModal() {
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.img-modal-close');

  // Track modal state
  let scale = 1,
    isDragging = false,
    startX = 0,
    startY = 0,
    currentX = 0,
    currentY = 0;

  /**
   * INITIALIZE IMAGE MODAL
   * Sets up click handlers for images with modal support
   */
  function initImageModal(img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      // Reset modal state
      scale = 1;
      currentX = 0;
      currentY = 0;
      modalImg.style.transform = `translate(0, 0) scale(${scale})`;
      
      // Show modal with image
      modal.style.display = 'flex';
      modalImg.src = img.src;
      modalImg.alt = img.alt || '';
      modalImg.style.cursor = 'grab';
    });
  }

  // Initialize for existing images
  document.querySelectorAll('.clickable-img').forEach(initImageModal);

  // Set up MutationObserver to handle dynamically loaded images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.classList && node.classList.contains('clickable-img')) {
            initImageModal(node);
          }
          node.querySelectorAll('.clickable-img').forEach(initImageModal);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Close modal and reset state
  function closeModal() {
    modal.style.display = 'none';
    isDragging = false;
    modalImg.style.cursor = 'grab';
    modalImg.classList.remove('dragging');
  }

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Zoom with mouse wheel
  modalImg.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    scale += delta;
    scale = Math.min(Math.max(1, scale), 5); // Limit zoom range
    modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  });

  // Drag to pan (only when zoomed)
  modalImg.addEventListener('mousedown', e => {
    if (scale <= 1) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    modalImg.style.cursor = 'grabbing';
    modalImg.classList.add('dragging');
  });

  // End dragging
  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      modalImg.style.cursor = 'grab';
      modalImg.classList.remove('dragging');
    }
  });

  // Handle dragging movement
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  });

  // Touch support variables
  let lastTouchDist = null, lastTouchX = null, lastTouchY = null;

  // Touch event handlers
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
      // Pinch zoom
      const currentDist = getTouchDist(e.touches);
      if (lastTouchDist !== null) {
        let deltaScale = (currentDist - lastTouchDist) / 200;
        scale += deltaScale;
        scale = Math.min(Math.max(1, scale), 5);
        modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
      }
      lastTouchDist = currentDist;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch pan
      currentX = e.touches[0].clientX - lastTouchX;
      currentY = e.touches[0].clientY - lastTouchY;
      modalImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    }
  }, { passive: false });

  modalImg.addEventListener('touchend', e => {
    if (e.touches.length < 2) lastTouchDist = null;
  });

  // Calculate distance between two touch points
  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
}

// ==================== TYPING ANIMATION ====================

/**
 * TYPING EFFECT
 * Creates animated typing effect with:
 * - Multiple rotating messages
 * - Type/delete cycle
 * - Custom cursor blink
 * - Icon support
 */
function setupTypingAnimation() {
  const typingText = document.getElementById('typingText');
  if (!typingText) return;

  // Messages with Font Awesome icons
const lines = [
 "Software Developer",
  "Web Developer",
  "App Developer",
  "AI/ML Enthusiast",
  "Game Developer",
  "Tech Learner",
  "Algorithm Explorer",
  "System Enthusiast",
  "Cloud Explorer",
  "UI/UX Designer"
];


  // Animation state
  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let pauseBetweenLines = 1500;

  /**
   * TYPING ANIMATION CORE
   * Handles the typewriter effect with:
   * - Character-by-character typing
   * - Line deletion
   * - Rotation through messages
   */
  function type() {
    const currentLine = lines[lineIndex % lines.length]; // Cycle through lines
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
  document.head.appendChild(style);

  // Start animation
  type();
}

// ==================== SKILLS CAROUSEL ====================

/**
 * SKILLS CAROUSEL
 * Creates infinite scrolling skills display with:
 * - Smooth horizontal animation
 * - Pause on hover
 * - Responsive layout
 */
document.addEventListener('DOMContentLoaded', function() {
  // Animate skill progress bars
  const progressBars = document.querySelectorAll('.skill-progress');
  
  progressBars.forEach(bar => {
    const targetWidth = bar.getAttribute('data-width') || bar.style.width;
    bar.style.width = '0';
    
    // Animate after short delay
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 200);
  });

  /**
   * INFINITE LOOP SETUP
   * Clones items to create seamless infinite scroll
   */
  function setupInfiniteLoop(trackClass) {
    const track = document.querySelector(`.${trackClass} .skills-inner`);
    const items = track.innerHTML;
    track.innerHTML = items + items + items; // Triple items for smooth transition
    
    // Adjust animation speed based on item count
    const itemCount = track.children.length;
    const duration = itemCount * 2;
    
    track.style.animationDuration = `${duration}s`;
  }
  
  // Initialize both carousel tracks
  setupInfiniteLoop('top-track');
  setupInfiniteLoop('bottom-track');
  
  // Pause animation on hover
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

// ==================== SCROLL EFFECTS ====================
/**
 * SCROLL EFFECTS HANDLER
 * Applies dynamic effects based on scroll position
 * - Parallax backgrounds
 * - Fade-in animations
 * - Sticky elements
 */
function handleScrollEffects() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Parallax effect for backgrounds
  const parallaxElements = document.querySelectorAll('.parallax');
  parallaxElements.forEach(el => {
    const speed = el.getAttribute('data-speed') || '0.5';
    el.style.backgroundPositionY = `${scrollTop * speed}px`;
  });

  // Fade-in animations
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 100) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });

  // Sticky header effect
  const header = document.querySelector('header');
  if (header) {
    if (scrollTop > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  }
}

function loadGitHubContributions(username) {
  const container = document.getElementById("contributions-grid");
  if (!container) return;

  container.innerHTML = `
    <img src="https://ghchart.rshah.org/${username}" 
         alt="${username}'s GitHub contributions">
  `;
}

// Load when page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadGitHubContributions("mahito-0"); // replace with your GitHub username
});

// Optional: auto-refresh every 30 minutes
setInterval(() => {
  loadGitHubContributions("mahito-0");
}, 1000 * 60 * 30);
