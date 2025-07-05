import { API_URL } from './helpers/envVariables.js';

async function carregarEventos() {
    try {
      const res = await fetch(`${API_URL}/evento`);
      const eventos = await res.json();

      console.log('eventos', eventos)

      const container = document.querySelector('ul.events');
      container.innerHTML = ''; // limpa eventos antigos

      for (const evento of eventos) {
        const enderecoRes = await fetch(`${API_URL}/endereco/${evento.idEndereco}`);
        const endereco = await enderecoRes.json();

        // Formata data para algo como "5 de julho de 2025"
        const inicio = new Date(evento.DataInicio);
        const fim = new Date(evento.DataFinal);
        const dataFormatada = `${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`;

        const html = `
        <li class="event-item col s6">
          <div class="item-wrap">
            <a href="/event-view?id-event=${evento.Codigo}">
              <img alt="image" class="image z-depth-1" style="width: 100%;" src="${evento.FotoBase64}">
            </a>
            <div class="info">
              <a href="/event-view?id-event=${evento.Codigo}">
                <h4 class="title truncate">${evento.Titulo}</h4>
              </a>
              <div class="time">${dataFormatada}</div>
              <div class="location">${formatarEndereco(endereco)}</div>
            </div>
          </div>
        </li>`;
        
        container.insertAdjacentHTML('beforeend', html);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }

  function formatarEndereco(endereco) {
    return `${endereco.Logradouro}, ${endereco.Numero} - ${endereco.Bairro} (${endereco.CEP})`;
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Chama a função quando a página carregar
  document.addEventListener('DOMContentLoaded', carregarEventos);