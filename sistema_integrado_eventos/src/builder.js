document.addEventListener('DOMContentLoaded', () => {
    fetch('./components/navbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar navbar');
            return response.text();
        })
        .then(html => {
            document.getElementById('navbar').innerHTML = html;
        })
        .catch(error => {
            console.error('Erro ao incluir navbar:', error);
        });
});