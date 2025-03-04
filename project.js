document.addEventListener('DOMContentLoaded', () => {
    const projectsList = document.getElementById('projects-list');
    const cardTemplate = document.getElementById('card-template').content;

    fetch('https://winter-mode-133a.mubin9516.workers.dev')
        .then(response => response.json())
        .then(repos => {
            repos.forEach(repo => {
                const card = cardTemplate.cloneNode(true);
                const cardElement = card.querySelector('.card');
                cardElement.querySelector('.repo-link').textContent = repo.name;
                cardElement.querySelector('.repo-description').textContent = repo.description || 'No description';
                cardElement.querySelector('.repo-stars').textContent = `⭐ ${repo.stargazers_count}`;
                cardElement.querySelector('.repo-forks').textContent = `🍴 ${repo.forks_count}`;
                cardElement.querySelector('.img').src = `https://raw.githubusercontent.com/mahito-0/${repo.name}/refs/heads/main/img/${repo.name}.png`;
               
                cardElement.addEventListener('click', () => {
                    window.location.href = repo.html_url;
                });
                projectsList.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching repos:', error));
});