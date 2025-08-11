document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');

  // --- Mobile Menu Toggle Setup ---
  const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    // Toggle mobile menu visibility and icon
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
      menuToggle.innerHTML = mobileMenu.classList.contains('show') ? '✕' : '☰';
    });

    // Close menu on link click
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('show');
        menuToggle.innerHTML = '☰';
      });
    });

    // Optional: Close menu when clicking outside
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
  } else {
    console.error('Menu toggle or mobile menu element not found');
  }

  // --- Responsive Font Size ---
  const setResponsiveFontSize = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.style.setProperty('--font-size-base', isMobile ? '14px' : '16px');
  };
  setResponsiveFontSize();
  window.addEventListener('resize', setResponsiveFontSize);

  // --- Smooth Scrolling for Anchor Links ---
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

  // --- Fetch GitHub Projects and Render ---
  async function fetchGitHubProjects(username) {
    try {
      console.log('Fetching GitHub projects for:', username);
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) throw new Error('Network response was not ok');

      let repos = await response.json();

      // Sort repos by last updated date (newest update first)
      repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      const projectsList = document.getElementById('projects-list');
      const cardTemplate = document.getElementById('card-template');

      if (!projectsList) {
        console.error('Projects list container not found');
        return;
      }
      if (!cardTemplate) {
        console.error('Card template not found');
        return;
      }

      projectsList.innerHTML = '';

      for (const repo of repos) {
        const card = document.importNode(cardTemplate.content, true);
        const cardElement = card.querySelector('.project-card');
        if (!cardElement) continue;

        // Set title
        const repoLinkTitle = cardElement.querySelector('.repo-link-title');
        if (repoLinkTitle) repoLinkTitle.textContent = repo.name;

        // Set GitHub link with icon and accessibility attributes
        const repoLink = cardElement.querySelector('.repo-link');
        if (repoLink) {
          repoLink.href = repo.html_url;
          repoLink.target = '_blank';
          repoLink.rel = 'noopener noreferrer';
          repoLink.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> View on GitHub`;
        }

        // Set description
        const repoDescription = cardElement.querySelector('.repo-description');
        if (repoDescription) repoDescription.textContent = repo.description || 'No description available';

        // Stars badge
        const repoStars = cardElement.querySelector('.repo-stars');
        if (repoStars) {
          repoStars.textContent = `⭐ ${repo.stargazers_count}`;
          repoStars.classList.add('badge', 'stars');
        }

        // Forks badge
        const repoForks = cardElement.querySelector('.repo-forks');
        if (repoForks) {
          repoForks.textContent = `🍴 ${repo.forks_count}`;
          repoForks.classList.add('badge', 'forks');
        }

        // Created and updated dates
        const projectMeta = cardElement.querySelector('.project-meta');
        if (projectMeta) {
          const updatedDate = new Date(repo.updated_at).toLocaleDateString();
          const dateSpan = document.createElement('span');
          dateSpan.textContent = `📅 Updated: ${updatedDate}`;
          dateSpan.classList.add('badge', 'dates');
          projectMeta.appendChild(dateSpan);
        }

        // Load project image if exists, else fallback to placeholder
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

  // Call fetchGitHubProjects with your username
  const githubUsername = 'mahito-0';
  fetchGitHubProjects(githubUsername);

  // --- Contact Form Submission Handling ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
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
  const cursor = document.querySelector('.custom-cursor');

  document.addEventListener('mousemove', (e) => {
    cursor.style.top = e.clientY + 'px';
    cursor.style.left = e.clientX + 'px';
  });

  function isClickable(element) {
    // Check if the element or its ancestor is clickable
    return element.closest('a, button, input[type="button"], input[type="submit"], [role="button"], label, select, textarea') !== null;
  }

  document.addEventListener('mousemove', (e) => {
    if (isClickable(e.target)) {
      cursor.classList.add('clickable-hover');
    } else {
      cursor.classList.remove('clickable-hover');
    }
  });

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

  // Expose sendmail globally if needed
  window.sendmail = sendmail;
});
