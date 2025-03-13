// Initialize main JavaScript functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio website loaded');
    
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
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
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
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
        
        // Clear any existing content
        if (projectsList) {
          projectsList.innerHTML = '';
          
          // Check if template exists
          const cardTemplate = document.getElementById('card-template');
          if (!cardTemplate) {
            console.error('Card template not found');
            return;
          }
  
          repos.forEach(repo => {
            // Clone the template
            const card = document.importNode(cardTemplate.content, true);
            
            // Set Repository Name in title
            const cardElement = card.querySelector('.project-card');
            if (!cardElement) {
              console.error('Project card element not found in template');
              return;
            }
            
            // Set Repository Name in title
            const repoLinkTitle = cardElement.querySelector('.repo-link-title');
            if (repoLinkTitle) {
              repoLinkTitle.textContent = repo.name;
            }
  
            // Set Repository Link
            const repoLink = cardElement.querySelector('.repo-link');
            if (repoLink) {
              repoLink.href = repo.html_url;
              repoLink.target = '_blank';
            }
  
            // Set Repository Description
            const repoDescription = cardElement.querySelector('.repo-description');
            if (repoDescription) {
              repoDescription.textContent = repo.description || 'No description available';
            }
  
            // Set Stars and Forks Count
            const repoStars = cardElement.querySelector('.repo-stars');
            if (repoStars) {
              repoStars.textContent = `⭐ ${repo.stargazers_count}`;
            }
            
            const repoForks = cardElement.querySelector('.repo-forks');
            if (repoForks) {
              repoForks.textContent = `🍴 ${repo.forks_count}`;
            }
  
            // Append the card to the projects list
            projectsList.appendChild(card);
          });
        } else {
          console.error('Projects list element not found');
        }
      } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        // Show error message if GitHub API fails
        const projectsList = document.getElementById('projects-list');
        if (projectsList) {
          projectsList.innerHTML = '<p>Could not load projects. Please try again later.</p>';
        }
      }
    }
  
    // Call GitHub Projects Fetch with Username
    fetchGitHubProjects('mahito-0');
  
    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real implementation, you would send data to a server here
        // For demo purposes, just show success message
        const resultMessage = document.querySelector('.result-message');
        resultMessage.style.display = 'block';
        contactForm.reset();
        
        // Hide the message after 5 seconds
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
        // Scrolling down, hide header
        header.classList.add("hidden-header");
      } else {
        // Scrolling up, show header
        header.classList.remove("hidden-header");
      }
  
      lastScrollTop = scrollTop;
    });
  });