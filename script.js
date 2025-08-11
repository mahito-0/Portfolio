// === Mobile Menu Toggle & Smooth Scrolling ===
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuToggle || !mobileMenu) {
    console.error('Menu toggle or mobile menu element not found');
    return;
  }

  // Toggle mobile menu and change icon
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('show');

    if (mobileMenu.classList.contains('show')) {
      menuToggle.innerHTML = '✕'; // Close icon
    } else {
      menuToggle.innerHTML = '☰'; // Hamburger icon
    }
  });

  // Close menu on clicking a link inside mobile menu
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('show');
      menuToggle.innerHTML = '☰';
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId !== '#') {
        document.querySelector(targetId)?.scrollIntoView({
          behavior: 'smooth',
        });
      }

      if (mobileMenu.classList.contains('show')) {
        mobileMenu.classList.remove('show');
        menuToggle.innerHTML = '☰';
      }
    });
  });

  // Optional: Close menu on outside click
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

  // Responsive font size adjustment
  const setResponsiveFontSize = () => {
    const isMobile = window.innerWidth <= 768;
    document.documentElement.style.setProperty(
      '--font-size-base',
      isMobile ? '14px' : '16px'
    );
  };

  window.addEventListener('resize', setResponsiveFontSize);
  setResponsiveFontSize();
});

// === Custom Cursor Movement ===
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
  if (cursor) {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
  }
});

document.addEventListener('mousedown', () => {
  if (cursor) cursor.classList.add('click');
});

document.addEventListener('mouseup', () => {
  if (cursor) cursor.classList.remove('click');
});

// === Contact Form Email Sending (EmailJS) ===
function sendmail() {
  const message = document.getElementById('message').value.trim();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

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
  sendButton.textContent = 'Sending...';
  sendButton.disabled = true;

  emailjs
    .send('service_zsci4of', 'template_t5wnh4c', templateParams)
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text);
      alert('Message sent successfully!');

      // Clear form fields
      document.getElementById('message').value = '';
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';

      sendButton.textContent = 'Send';
      sendButton.disabled = false;
    })
    .catch((error) => {
      console.error('FAILED...', error);
      alert('Message failed to send!');

      sendButton.textContent = 'Send';
      sendButton.disabled = false;
    });
}

// === Simulated Unique View Count Using localStorage ===
(function() {
  const hasVisited = localStorage.getItem('visited');
  let count = parseInt(localStorage.getItem('viewCount')) || 0;

  if (!hasVisited) {
    count++;
    localStorage.setItem('viewCount', count);
    localStorage.setItem('visited', 'true');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const viewCountElem = document.getElementById('viewCount');
    if (viewCountElem) {
      viewCountElem.textContent = count;
      viewCountElem.style.visibility = 'hidden'; // Hide by default
    }

    const viewerCountToggle = document.getElementById('viewerCountToggle');
    if (viewerCountToggle) {
      viewerCountToggle.addEventListener('click', () => {
        const code = prompt('Enter access code to reveal view count:');
        if (code === '7102') {
          viewCountElem.style.visibility = 'visible';
        } else {
          alert('Incorrect code. Access denied.');
        }
      });
    }
  });
})();


