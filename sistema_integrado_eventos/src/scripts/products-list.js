import { API_URL } from './helpers/envVariables.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Função para pegar parâmetro da URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const idExpositor = getQueryParam('id-expositor');
  const idEvento = getQueryParam('id-evento');

  if (!idExpositor || !idEvento) {
    alert('Parâmetros id-expositor e id-evento são obrigatórios na URL.');
    return;
  }

  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = ''; // limpa tabela antes de popular

  try {
    const res = await fetch(`${API_URL}/produto`); // ajuste a URL da API conforme necessário
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    const produtos = await res.json();

    // Filtra os produtos do expositor e evento indicados
    const produtosFiltrados = produtos.filter(p => p.idExpositor === idExpositor && p.idEvento == idEvento);

    if (produtosFiltrados.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.textContent = 'Nenhum produto encontrado.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    produtosFiltrados.forEach(produto => {
      const tr = document.createElement('tr');

      const tdNome = document.createElement('td');
      tdNome.textContent = produto.Titulo || 'Sem título';

      const tdDescricao = document.createElement('td');
      tdDescricao.textContent = produto.Descricao || '-';

      const tdValor = document.createElement('td');
      tdValor.textContent = `R$ ${parseFloat(produto.Valor).toFixed(2)}`;

      tr.appendChild(tdNome);
      tr.appendChild(tdDescricao);
      tr.appendChild(tdValor);

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = 'Erro ao carregar produtos.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
});