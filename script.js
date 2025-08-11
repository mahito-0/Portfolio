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
  else {
      console.error('Contact form element not found');
  }

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
// msg
function sendmail() {
    var message = document.getElementById("message").value;
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;

    if (name === "" || email === "") {
        alert("Name and email are required!");
        return;
    }

    var templateParams = {
        from_name: name,
        message: message,
        reply_to: email
    };

  
    var sendButton = document.getElementById("sendLetter");
    sendButton.textContent = "Sending...";
    sendButton.disabled = true;

    
    emailjs.send('service_zsci4of', 'template_t5wnh4c', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert("Message sent successfully!");

          
            document.getElementById("message").value = "";
            document.getElementById("name").value = "";
            document.getElementById("email").value = "";

           
            sendButton.textContent = "Send";
            sendButton.disabled = false;
        }, function(error) {
            console.log('FAILED...', error);
            alert("Message failed to send!");

         
            sendButton.textContent = "Send";
            sendButton.disabled = false;
        });
}

// Simulated unique view count using localStorage
const hasVisited = localStorage.getItem('visited');
  let count = localStorage.getItem('viewCount') || 0;

  if (!hasVisited) {
    count++;
    localStorage.setItem('viewCount', count);
    localStorage.setItem('visited', 'true');
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("viewCount").textContent = count;
  });

  // Code-gated reveal
  document.getElementById("viewerCountToggle").addEventListener("click", () => {
    const code = prompt("Enter access code to reveal view count:");
    if (code === "7102") {
      document.getElementById("viewCount").style.visibility = "visible";
    } else {
      alert("Incorrect code. Access denied.");
    }
  });

document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('show');
      
      // Change icon based on menu state
      if (mobileMenu.classList.contains('show')) {
        this.innerHTML = '✕'; // Close icon
      } else {
        this.innerHTML = '☰'; // Hamburger icon
      }
    });
    
    // Close menu when clicking on a link
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('show');
        menuToggle.innerHTML = '☰';
      });
    });
  }
});