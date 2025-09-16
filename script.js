/* 
 * MAIN INITIALIZATION
 * Sets up all functionality when the DOM is fully loaded
 * Initializes third-party libraries and scroll effects
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');
  setupFixedBackgroundLayer();  // <-- add this
  setupMobileMenu();
  setupResponsiveFontSize();
  setupSmoothScrolling();
  fetchGitHubProjects('mahito-0');
  setupContactForm();
  setupCustomCursor();
  setupImageModal();
  setupTypingAnimation();
  setupDownloadLinks();

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: false, mirror: true });
  }

  window.addEventListener('scroll', handleScrollEffects);
});

// ==================== DOWNLOAD LINKS ====================

function setupDownloadLinks() {
  const downloadLinks = document.querySelectorAll('.download-link');
  downloadLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const a = document.createElement('a');
      a.href = link.href;
      a.download = link.getAttribute('download');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
}

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
  console.log('Fetching GitHub projects for:', username);

  const CACHE_KEY = `gh_repos_${username}`;
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  const PLACEHOLDER = '/placeholder.svg';

  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.data)) return null;
      return parsed; // { timestamp, data, etag? }
    } catch (e) {
      console.warn('Failed to parse cache:', e);
      return null;
    }
  };

  const saveCache = (data, etag) => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data, etag: etag || null })
      );
    } catch (e) {
      console.warn('Failed to save cache:', e);
    }
  };

  const isFresh = (cache) => cache && (Date.now() - cache.timestamp) < CACHE_TTL;

  const setRepoImage = (imgEl, username, repoName, defaultBranch) => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))];
    const branches = uniq([defaultBranch, 'main', 'master']);
    let i = 0;

    const tryNext = () => {
      if (i >= branches.length) {
        imgEl.onerror = null;
        imgEl.src = PLACEHOLDER;
        return;
      }
      const branch = branches[i++];
      imgEl.onerror = tryNext;
      imgEl.src = `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/${encodeURIComponent(branch)}/img/proimg.png`;
    };

    tryNext();
  };

  try {
    const projectsList = document.getElementById('projects-list');
    const cardTemplate = document.getElementById('card-template');
    if (!projectsList || !cardTemplate) {
      console.error('Projects list container or card template not found');
      return;
    }
    projectsList.innerHTML = '';

    const cached = loadCache();
    let repos = null;

    // Try cache if fresh
    if (isFresh(cached)) {
      console.log('Using fresh cache');
      repos = cached.data;
    } else {
      const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
      const headers = { Accept: 'application/vnd.github+json' };

      // Optional: add a token from localStorage to avoid rate limits.
      // Warning: Putting a token in client-side storage exposes it to users.
      const token = localStorage.getItem('GITHUB_TOKEN')?.trim();
      if (token) headers.Authorization = `Bearer ${token}`;

      if (cached?.etag) headers['If-None-Match'] = cached.etag;

      let response;
      try {
        response = await fetch(url, { headers });
      } catch (networkErr) {
        console.warn('Network error fetching GitHub repos:', networkErr);
        if (cached) {
          console.log('Falling back to cached repos due to network error');
          repos = cached.data;
        } else {
          throw networkErr;
        }
      }

      if (response) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        if (remaining !== null) {
          console.log(`GitHub rate limit remaining: ${remaining}` + (reset ? `, resets at: ${new Date(reset * 1000).toLocaleTimeString()}` : ''));
        }

        if (response.status === 304 && cached) {
          console.log('ETag matched (304). Using cached repos.');
          // Touch the timestamp so cache is considered fresh again.
          saveCache(cached.data, cached.etag);
          repos = cached.data;
        } else if (response.ok) {
          const etag = response.headers.get('ETag');
          repos = await response.json();
          saveCache(repos, etag);
        } else if (response.status === 403) {
          console.warn('GitHub API rate limit (403).');
          if (cached) {
            console.log('Using cached repos due to rate limit');
            repos = cached.data;
          } else {
            throw new Error('GitHub API rate limit exceeded and no cached data available.');
          }
        } else {
          console.warn(`GitHub API error: ${response.status}`);
          if (cached) {
            console.log('Using cached repos due to API error');
            repos = cached.data;
          } else {
            throw new Error(`GitHub API error: ${response.status}`);
          }
        }
      }
    }

    // Safety
    if (!Array.isArray(repos)) repos = [];

    // Filter and sort
    repos = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (!repos.length) {
      projectsList.innerHTML = '<p>No public projects to display.</p>';
      return;
    }

    // Render cards
    for (const repo of repos) {
      const card = document.importNode(cardTemplate.content, true);
      const cardElement = card.querySelector('.project-card');
      if (!cardElement) continue;

      const repoLinkTitle = cardElement.querySelector('.repo-link-title');
      if (repoLinkTitle) repoLinkTitle.textContent = repo.name;

      const repoLink = cardElement.querySelector('.repo-link');
      if (repoLink) {
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.rel = 'noopener noreferrer';
        repoLink.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> View on GitHub`;
      }

      const liveLink = cardElement.querySelector('.live-link');
      if (liveLink && repo.homepage) {
        liveLink.href = repo.homepage;
        liveLink.target = '_blank';
        liveLink.rel = 'noopener noreferrer';
        liveLink.style.display = 'inline-block';
      }

      const repoDescription = cardElement.querySelector('.repo-description');
      if (repoDescription) {
        repoDescription.textContent = repo.description || 'No description available';
      }

      const repoStars = cardElement.querySelector('.repo-stars');
      if (repoStars) {
        repoStars.textContent = `⭐ ${repo.stargazers_count}`;
        repoStars.classList.add('badge', 'stars');
      }

      const repoForks = cardElement.querySelector('.repo-forks');
      if (repoForks) {
        repoForks.textContent = `🍴 ${repo.forks_count}`;
        repoForks.classList.add('badge', 'forks');
      }

      const projectMeta = cardElement.querySelector('.project-meta');
      if (projectMeta) {
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        const dateSpan = document.createElement('span');
        dateSpan.textContent = `📅 Updated: ${updatedDate}`;
        dateSpan.classList.add('badge', 'dates');
        projectMeta.appendChild(dateSpan);
      }

      // Image: try default_branch → main → master → placeholder
      const repoImage = cardElement.querySelector('.project-image img');
      if (repoImage) {
        repoImage.classList.add('clickable-img');
        setRepoImage(repoImage, username, repo.name, repo.default_branch);
      }

      projectsList.appendChild(card);
    }
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
    const projectsList = document.getElementById('projects-list');
    if (projectsList) {
      const msg = (error && String(error).includes('rate limit'))
        ? '<p>GitHub rate limit hit. Please try again later.</p>'
        : '<p>Could not load projects. Please try again later.</p>';
      projectsList.innerHTML = msg;
    }
  }
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

// ==================== GITHUB CONTRIBUTIONS GRID ====================
function loadGitHubContributions(username) {
  const container = document.getElementById("contributions-grid");
  if (!container) {
    console.error("Contributions container not found!");
    return;
  }

  // Prevent caching by adding a timestamp
  const timestamp = new Date().getTime();
  const url = `https://ghchart.rshah.org/${username}?t=${timestamp}`;
  
  container.innerHTML = `<img src="${url}" alt="${username}'s GitHub contributions">`;
}
// Load immediately and refresh every 30 mins
document.addEventListener("DOMContentLoaded", () => {
  loadGitHubContributions("mahito-0");
  setInterval(() => loadGitHubContributions("mahito-0"), 1000 * 60 * 30);
});


// ==================== CHAT WIDGET ====================
(function () {
  const CONFIG_URL = 'assets/chat-config.json';
  const DATA_URL   = 'assets/site-data.json';

  document.addEventListener('DOMContentLoaded', () => {
    if (window.__chatWidgetBound) return;
    window.__chatWidgetBound = true;
    setupChatWidget().catch(err => console.error('Chat init failed:', err));
  });

  async function setupChatWidget() {
    // DOM
    const panel   = document.getElementById('chat-panel');
    const toggle  = document.getElementById('chat-toggle');
    const closeBtn= document.getElementById('chat-close');
    const log     = document.getElementById('chat-log');
    const form    = document.getElementById('chat-form');
    const input   = document.getElementById('chat-input');

    if (!panel || !toggle || !closeBtn || !log || !form || !input) {
      console.warn('Chat elements missing in HTML.');
      return;
    }

    const state = { cfg: null, messages: [], site: null, flatFacts: [] };

    // UI helpers
    function addMsg(role, text) {
      const el = document.createElement('div');
      el.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }
    function setBusy(busy) {
      const btn = form.querySelector('button');
      btn.disabled = busy;
      btn.textContent = busy ? '...' : 'Send';
      input.disabled = busy;
    }

    // Load config and site data
    async function loadConfig() {
      if (state.cfg) return state.cfg;
      const r = await fetch(CONFIG_URL, { cache: 'no-store' });
      if (!r.ok) throw new Error('Missing assets/chat-config.json');
      const cfg = await r.json();
      state.cfg = {
        endpoint: cfg.endpoint,
        systemPrompt: cfg.systemPrompt || 'You are a helpful assistant.',
        welcomeMessage: cfg.welcomeMessage || 'Hi! Ask me about this portfolio.',
        maxHistory: Number(cfg.maxHistory ?? 14)
      };
      state.messages = [{ role: 'system', content: state.cfg.systemPrompt }];
      return state.cfg;
    }

    async function loadSiteData() {
      if (state.site) return state.site;
      try {
        const r = await fetch(DATA_URL, { cache: 'no-store' });
        if (r.ok) {
          state.site = await r.json();
          state.flatFacts = flattenFacts(state.site);
        } else {
          console.warn('site-data.json not found (optional but recommended).');
          state.site = null; state.flatFacts = [];
        }
      } catch (e) {
        console.warn('Failed to load site-data.json:', e);
        state.site = null; state.flatFacts = [];
      }
      return state.site;
    }

    // Turn site-data into concise fact strings
    function flattenFacts(d) {
      if (!d) return [];
      const arr = [];
      if (d.name)      arr.push(`Name: ${d.name}`);
      if (d.location)  arr.push(`Location: ${d.location}`);
      if (d.email)     arr.push(`Email: ${d.email}`);
      if (d.status)    arr.push(`Status: ${d.status}`);
      if (d.focus)     arr.push(`Focus: ${d.focus}`);
      if (Array.isArray(d.skills) && d.skills.length)
        arr.push(`Skills: ${d.skills.join(', ')}`);
      if (Array.isArray(d.education)) {
        d.education.forEach(e => {
          arr.push(`Education: ${e.years} — ${e.school}${e.degree ? `, ${e.degree}` : ''}${e.focus ? ` (${e.focus})` : ''}`);
        });
      }
      if (d.poster?.title)
        arr.push(`Poster: ${d.poster.title}${d.poster.award ? ` — ${d.poster.award}` : ''}`);
      if (d.research?.title)
        arr.push(`Research: ${d.research.title}${d.research.summary ? ` — ${d.research.summary}` : ''}`);
      if (d.githubUser) arr.push(`GitHub user: ${d.githubUser}`);
      if (d.socials?.github)   arr.push(`GitHub: ${d.socials.github}`);
      if (d.socials?.linkedin) arr.push(`LinkedIn: ${d.socials.linkedin}`);
      if (d.socials?.instagram)arr.push(`Instagram: ${d.socials.instagram}`);
      return arr;
    }

    // Pick the most relevant facts for the user’s query
    function relevantFacts(query, limit = 8) {
      if (!state.flatFacts.length) return '';
      const words = (query || '').toLowerCase().match(/[a-z0-9#.@-]{3,}/g) || [];
      const score = t => words.reduce((s, w) => s + (t.toLowerCase().includes(w) ? 1 : 0), 0);
      const ranked = state.flatFacts
        .map(t => ({ t, s: score(t) }))
        .sort((a, b) => b.s - a.s || a.t.length - b.t.length);
      const picked = (ranked[0]?.s ? ranked.filter(x => x.s > 0).slice(0, limit) : ranked.slice(0, 6))
        .map(x => x.t);
      const context = picked.join('\n- ');
      return context ? `Use these portfolio facts:\n- ${context}` : '';
    }

    // Events
    toggle.addEventListener('click', async () => {
      try { await loadConfig(); } catch (e) { console.error(e); }
      await loadSiteData();
      panel.hidden = !panel.hidden;
      document.body.classList.toggle('chat-open', !panel.hidden);
      if (!panel.hidden && log.childElementCount === 0) {
        addMsg('bot', state.cfg?.welcomeMessage || 'Hi!');
      }
    });

    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
      document.body.classList.remove('chat-open');
    });

    // Enter to send (Shift+Enter = newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      try { await loadConfig(); } catch {
        addMsg('bot', 'Chat config not found. Please add assets/chat-config.json with your endpoint.');
        return;
      }
      await loadSiteData();

      addMsg('user', text);
      state.messages.push({ role: 'user', content: text });

      // Build a short, relevant context from your site facts
      const facts      = relevantFacts(text);
      const baseSystem = state.messages.find(m => m.role === 'system');

      // Keep the context short to save tokens
      const recent = state.messages.filter(m => m !== baseSystem)
                                   .slice(-state.cfg.maxHistory + 2);

      const messagesForApi = [
        baseSystem || { role: 'system', content: state.cfg.systemPrompt },
        ...(facts ? [{ role: 'system', content: facts }] : []),
        ...recent
      ];

      try {
        setBusy(true);
        const r = await fetch(state.cfg.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesForApi })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error?.message || JSON.stringify(data) || `HTTP ${r.status}`);
        const reply = data.reply || '(no reply)';
        state.messages.push({ role: 'assistant', content: reply });
        addMsg('bot', reply);
      } catch (err) {
        console.error('Chat error:', err);
        addMsg('bot', 'Oops—something went wrong. Please try again.');
      } finally {
        setBusy(false);
      }
    });
  }
})();


function setupFixedBackgroundLayer() {
  if (document.getElementById('fixed-bg-layer')) return;

  const layer = document.createElement('div');
  layer.id = 'fixed-bg-layer';

  Object.assign(layer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '-1',            // behind all content
    pointerEvents: 'none',   // never blocks clicks
    backgroundColor: '#161616',
    backgroundImage:
      'radial-gradient(circle at center, #333 1.5px, transparent 0.5px),' +
      'radial-gradient(circle at center, #333 1.5px, transparent 0.5px)',
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 20px 20px', // fixed grid offset
    transform: 'translateZ(0)',           // helps iOS repainting
    willChange: 'transform'
  });

  document.body.appendChild(layer);
}