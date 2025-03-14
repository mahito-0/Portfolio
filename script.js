document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio website loaded');
    
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
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
        
        // Close mobile menu after clicking a link
        if (mobileMenu && mobileMenu.classList.contains('show')) {
          mobileMenu.classList.remove('show');
        }
      });
    });
    
    // Fetch GitHub Projects
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
  
          repos.forEach(repo => {
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
  
    fetchGitHubProjects('mahito-0');
  
    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
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
  });