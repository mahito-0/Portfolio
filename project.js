document.addEventListener('DOMContentLoaded', () => {
  const projectsList = document.getElementById('projects-list');
  const loadingSpinner = document.getElementById('loading-spinner');
  const noProjectsMessage = document.getElementById('no-projects');
  const cardTemplate = document.getElementById('card-template');

  const githubUsername = 'mahito-0'; // Change to your GitHub username

  async function fetchGitHubProjects(username) {
    try {
      loadingSpinner.style.display = 'block';
      noProjectsMessage.style.display = 'none';
      projectsList.innerHTML = '';

      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!response.ok) throw new Error('Network response was not ok');

      const repos = await response.json();
      if (repos.length === 0) {
        showNoProjects('No projects found.');
        loadingSpinner.style.display = 'none';
        return;
      }

      repos.forEach(async (repo) => {
        const card = document.importNode(cardTemplate.content, true);

        // Fill in repo info
        card.querySelector('.repo-link-title').textContent = repo.name;
        card.querySelector('.repo-description').textContent = repo.description || 'No description available';
        card.querySelector('.repo-stars').textContent = `⭐ ${repo.stargazers_count}`;
        card.querySelector('.repo-forks').textContent = `🍴 ${repo.forks_count}`;
        card.querySelector('.repo-link').href = repo.html_url;

        // Last updated (formatted)
        const updatedElem = card.querySelector('.project-updated');
        updatedElem.textContent = `Updated: ${new Date(repo.updated_at).toLocaleDateString()}`;

        // Fetch languages for this repo
        try {
          const langResponse = await fetch(repo.languages_url);
          const languages = await langResponse.json();
          const langContainer = card.querySelector('.project-languages');
          Object.keys(languages).forEach(lang => {
            const span = document.createElement('span');
            span.className = 'language-tag';
            span.textContent = lang;
            langContainer.appendChild(span);
          });
        } catch {
          // If language fetch fails, leave empty
        }

        // Try loading image from repo, fallback to placeholder
        const img = card.querySelector('.project-image img');
        const imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/img/proimg.png`;
        try {
          const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
          img.src = imgResponse.ok ? imageUrl : '/placeholder.svg';
        } catch {
          img.src = '/placeholder.svg';
        }

        projectsList.appendChild(card);
      });

      loadingSpinner.style.display = 'none';
    } catch (error) {
      console.error('Error fetching GitHub projects:', error);
      showNoProjects('Could not load projects. Please try again later.');
      loadingSpinner.style.display = 'none';
    }
  }

  function showNoProjects(message) {
    noProjectsMessage.style.display = 'block';
    noProjectsMessage.querySelector('p').textContent = message;
  }

  fetchGitHubProjects(githubUsername);
});
