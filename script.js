document.addEventListener('DOMContentLoaded', function() {
    // Age Calculation
    function calculateAge(birthdate) {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return `${years} years, ${months} months, and ${days} days`;
    }

    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = calculateAge('2001-10-31');
    }

    // Fetch GitHub Projects
    async function fetchGitHubProjects(username) {
        try {
            const response = await fetch(`https://api.github.com/users/mahito-0/repos`);
            if (!response.ok) throw new Error('Network response was not ok');
            const repos = await response.json();
            const projectsList = document.getElementById('projects-list');
            const cardTemplate = document.getElementById('card-template').content;

            repos.forEach(repo => {
                const card = cardTemplate.cloneNode(true);
                const cardElement = card.querySelector('.card');

                // Set Repository Name
                const repoLink = cardElement.querySelector('.repo-link');
                repoLink.textContent = repo.name;
                repoLink.href = repo.html_url;
                repoLink.target = '_blank';

                // Set Repository Description
                cardElement.querySelector('.repo-description').textContent = repo.description || 'No description available';

                // Set Stars and Forks Count
                cardElement.querySelector('.repo-stars').textContent = `⭐ ${repo.stargazers_count}`;
                cardElement.querySelector('.repo-forks').textContent = `🍴 ${repo.forks_count}`;


                // img
                //cardElement.querySelector('.img').src = `https://github.com/mahito-0/${repo.name}/blob/main/${repo.name}.png;
                projectsList.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching GitHub projects:', error);
        }
    }

    // Call GitHub Projects Fetch with Username
    fetchGitHubProjects('mahito-0');

    // Add Class on Button Click
    function addClass() {
        document.body.classList.add("sent");
    }

    // Send Email using EmailJS
    function sendMail(event) {
        event.preventDefault(); // Prevent default form submission

        var templateParams = {
            from_name: document.getElementById("name").value,
            reply_to: document.getElementById("email").value,
            message: document.getElementById("message").value
        };

        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert("Your message has been sent successfully!");
                document.getElementById("contact-form").reset();
            }, function(error) {
                console.log('FAILED...', error);
                alert("Message failed to send. Please try again later.");
            });
    }



    // Section Animation
    const sections = document.querySelectorAll("section");

    const revealSection = () => {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const triggerPoint = window.innerHeight / 1.3;

            if (sectionTop < triggerPoint) {
                section.classList.add("active");
            }
        });
    };

    window.addEventListener("scroll", revealSection);
    revealSection(); // Initial check on page load


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
