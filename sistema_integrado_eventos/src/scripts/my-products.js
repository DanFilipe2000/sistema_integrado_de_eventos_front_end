import { API_URL } from './helpers/envVariables.js';

async function carregarEventosDoUsuario() {
    const user = JSON.parse(localStorage.getItem('user'));
    const cpf = user?.CPF;

    if (!cpf) {
        console.error('Usuário não logado.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/evento`);
        if (!res.ok) throw new Error('Erro ao buscar eventos');
        const eventos = await res.json();

        const meusEventos = eventos.filter(e => e.CriadoPor === cpf);

        const tbody = document.querySelector('#events-table tbody');
        tbody.innerHTML = ''; // limpa tabela

        if (meusEventos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 3;
            td.textContent = 'Nenhum evento encontrado.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        meusEventos.forEach(evento => {
            const tr = document.createElement('tr');

            const tdTitulo = document.createElement('td');
            tdTitulo.innerHTML = `<a href="/event-view?id-event=${evento.Codigo}">${evento.Titulo}</a>`;

            const tdData = document.createElement('td');
            const dataFormatada = new Date(evento.DataInicio).toLocaleDateString('pt-BR');
            tdData.textContent = dataFormatada;

            const tdAcoes = document.createElement('td');
            const btnApagar = document.createElement('button');
            btnApagar.textContent = 'Apagar';
            btnApagar.classList.add('btn', 'red');
            btnApagar.onclick = async () => {
                if (confirm(`Deseja apagar o evento "${evento.Titulo}"?`)) {
                    try {
                        const res = await fetch(`${API_URL}/evento/${evento.Codigo}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Erro ao apagar evento');
                        alert('Evento apagado com sucesso.');
                        carregarEventosDoUsuario(); // Recarrega tabela
                    } catch (err) {
                        console.error('Erro ao apagar evento:', err);
                        alert('Erro ao apagar evento.');
                    }
                }
            };

            tdAcoes.appendChild(btnApagar);

            tr.appendChild(tdTitulo);
            tr.appendChild(tdData);
            tr.appendChild(tdAcoes);

            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        alert('Erro ao carregar eventos.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.CPF) {
        alert('Usuário não autenticado.');
        return;
    }

    document.getElementById('profile-name').textContent = user.name || 'Nome não informado';
    document.getElementById('profile-user-type').textContent = user.type_user || 'Email não informado';

    const imgElement = document.getElementById('profile-img');
    if (user.foto_perfil) {
        imgElement.src = user.foto_perfil;
    } else {
        imgElement.src = '../images/defaultuser.png'; // fallback opcional
    }

    const tbody = document.querySelector('#products-table tbody');

    async function carregarProdutos() {
        try {
            const res = await fetch(`${API_URL}/produto`);
            if (!res.ok) throw new Error('Erro ao buscar produtos');
            const produtos = await res.json();

            const meusProdutos = produtos.filter(p => p.idExpositor === user.CPF);

            tbody.innerHTML = '';

            if (meusProdutos.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.textContent = 'Nenhum produto encontrado.';
                tr.appendChild(td);
                tbody.appendChild(tr);
                return;
            }

            meusProdutos.forEach(produto => {
                const tr = document.createElement('tr');

                const tdTitulo = document.createElement('td');
                tdTitulo.textContent = produto.Titulo;

                const tdDescricao = document.createElement('td');
                tdDescricao.textContent = produto.Descricao;

                const tdValor = document.createElement('td');
                tdValor.textContent = `R$ ${parseFloat(produto.Valor).toFixed(2)}`;

                const tdAcoes = document.createElement('td');
                const btnApagar = document.createElement('button');
                btnApagar.textContent = 'Apagar';
                btnApagar.classList.add('btn', 'red');
                btnApagar.onclick = async () => {
                    if (confirm(`Deseja apagar o produto "${produto.Titulo}"?`)) {
                        try {
                            const res = await fetch(`${API_URL}/produto/${produto.Codigo}`, { method: 'DELETE' });
                            if (!res.ok) throw new Error('Erro ao apagar produto');
                            alert('Produto apagado com sucesso.');
                            carregarProdutos(); // Recarrega tabela
                        } catch (err) {
                            console.error('Erro ao apagar:', err);
                            alert('Erro ao apagar produto.');
                        }
                    }
                };

                tdAcoes.appendChild(btnApagar);

                tr.appendChild(tdTitulo);
                tr.appendChild(tdDescricao);
                tr.appendChild(tdValor);
                tr.appendChild(tdAcoes);

                tbody.appendChild(tr);
            });

        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
            alert('Erro ao carregar produtos.');
        }
    }

    carregarProdutos();
    carregarEventosDoUsuario();
});