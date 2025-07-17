document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio website loaded');

  // Initialize mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
    if (!menuToggle || !mobileMenu) {
        console.error('Menu toggle or mobile menu element not found');
        return;
    }

  if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
          mobileMenu.classList.toggle('show');
      });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();

          const targetId = this.getAttribute('href');
          if (targetId !== '#') {
              document.querySelector(targetId).scrollIntoView({
                  behavior: 'smooth'
              });
          }

          if (mobileMenu && mobileMenu.classList.contains('show')) {
              mobileMenu.classList.remove('show');
          }
      });
  });

  // Fetch GitHub Projects and Load Images Dynamically
  async function fetchGitHubProjects(username) {
      try {
          console.log('Fetching GitHub projects for:', username);
          const response = await fetch(`https://api.github.com/users/${username}/repos`);
          if (!response.ok) throw new Error('Network response was not ok');

          const repos = await response.json();
          console.log('Fetched repos:', repos);
          const projectsList = document.getElementById('projects-list');

          if (projectsList) {
              projectsList.innerHTML = '';
              const cardTemplate = document.getElementById('card-template');
              if (!cardTemplate) {
                  console.error('Card template not found');
                  return;
              }

              repos.forEach(async (repo) => {
                  const card = document.importNode(cardTemplate.content, true);
                  const cardElement = card.querySelector('.project-card');
                  if (!cardElement) {
                      console.error('Project card element not found in template');
                      return;
                  }

                  const repoLinkTitle = cardElement.querySelector('.repo-link-title');
                  if (repoLinkTitle) repoLinkTitle.textContent = repo.name;

                  const repoLink = cardElement.querySelector('.repo-link');
                  if (repoLink) {
                      repoLink.href = repo.html_url;
                      repoLink.target = '_blank';
                  }

                  const repoDescription = cardElement.querySelector('.repo-description');
                  if (repoDescription) repoDescription.textContent = repo.description || 'No description available';

                  const repoStars = cardElement.querySelector('.repo-stars');
                  if (repoStars) repoStars.textContent = `⭐ ${repo.stargazers_count}`;

                  const repoForks = cardElement.querySelector('.repo-forks');
                  if (repoForks) repoForks.textContent = `🍴 ${repo.forks_count}`;

                  // Load project image dynamically (expects an image at img/proimg.png in each repo)
                  const repoImage = cardElement.querySelector('.project-image img');
                  const imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/img/proimg.png`;
                  
                  try {
                      const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
                      if (imgResponse.ok) {
                          repoImage.src = imageUrl;
                      } else {
                          repoImage.src = '/placeholder.svg'; // Fallback image
                      }
                  } catch {
                      repoImage.src = '/placeholder.svg'; // If fetch fails
                  }

                  projectsList.appendChild(card);
              });
          } else {
              console.error('Projects list element not found');
          }
      } catch (error) {
          console.error('Error fetching GitHub projects:', error);
          const projectsList = document.getElementById('projects-list');
          if (projectsList) {
              projectsList.innerHTML = '<p>Could not load projects. Please try again later.</p>';
          }
      }
  }

  // Call functions with your GitHub username
  const githubUsername = 'mahito-0';
  fetchGitHubProjects(githubUsername);

  // Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
          e.preventDefault();

          const resultMessage = document.querySelector('.result-message');
          resultMessage.style.display = 'block';
          contactForm.reset();

          setTimeout(() => {
              resultMessage.style.display = 'none';
          }, 5000);
      });
  }

  // Header scroll behavior
  let lastScrollTop = 0;
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
      let scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop) {
          header.classList.add("hidden-header");
      } else {
          header.classList.remove("hidden-header");
      }

      lastScrollTop = scrollTop;
  });

  // Mobile Menu Toggle Script

// Mobile Menu Toggle Script

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("show");
    });
  }

  document.documentElement.style.setProperty('--font-size-base', isMobile ? '14px' : '16px');

  // Optional: Close menu on outside click
  document.addEventListener("click", (e) => {
    if (
      !mobileMenu.contains(e.target) &&
      !toggleBtn.contains(e.target) &&
      mobileMenu.classList.contains("show")
    ) {
      mobileMenu.classList.remove("show");
    }
  });

  // Responsive font size adjustments for mobile view
  const setResponsiveFontSize = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.style.setProperty('--font-size-base', isMobile ? '14px' : '16px');
  };

  window.addEventListener('resize', setResponsiveFontSize);
  setResponsiveFontSize();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
    
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
    
            if (mobileMenu.classList.contains('show')) {
                mobileMenu.classList.remove('show');
            }
        });
  });
});
    }
);
// Custom Mouse Cursor Movement
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.top = `${e.clientY}px`;
  cursor.style.left = `${e.clientX}px`;
});
document.addEventListener('mousedown', () => {
  cursor.classList.add('click');
});

