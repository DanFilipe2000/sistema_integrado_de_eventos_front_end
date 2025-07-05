import { API_URL } from './helpers/envVariables.js';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Recuperar parâmetro da URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id-event');
    if (!id) {
        alert("Evento não encontrado.");
        return;
    }

    try {
        // 2. Buscar dados do evento no backend
        const response = await fetch(`${API_URL}/evento/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar evento");

        const evento = await response.json();

        const responseEndereco = await fetch(`${API_URL}/endereco/${evento.idEndereco}`);
        const endereco = await responseEndereco.json();

        const EnderecoCompleto = `${endereco.Logradouro}, Nº ${endereco.Numero} - ${endereco.Bairro}, CEP: ${endereco.CEP}`;

        // 3. Preencher os elementos HTML com os dados do evento
        document.getElementById("event-title").innerText = evento.Titulo;
        document.getElementById("event-date").innerText = formatarDatas(evento.DataInicio, evento.DataFinal);
        document.getElementById("event-location").innerText = EnderecoCompleto || 'Local não informado';

        if (evento.CaminhoFotoBase64) {
            document.getElementById("event-image").src = evento.CaminhoFotoBase64;
        }

        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = ''; // Limpa caso já tenha conteúdo

        evento.expositores.forEach(exp => {
            const row = document.createElement('tr');
            row.innerHTML = `
      <td>${exp.Nome}</td>
      <td>${exp.Email}</td>
      <td>${exp.Fones}</td>
      <td><a href="/products-list?id-expositor=${exp.CPF}&id-evento=${evento.Codigo}">Veja os produtos desse expositor</a></td>
    `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Erro ao carregar evento:", err);
        alert("Erro ao carregar dados do evento.");
    }
});

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const btn = document.querySelector('.book-btn');

  if (!user || user.type_user !== 'participante') {
    btn.style.display = 'none';
    return;
  }

  const idParticipante = user.matricula;
  const urlParams = new URLSearchParams(window.location.search);
  const idEvento = urlParams.get('id-event');

  if (!idEvento) return;

  // Função para verificar se já está inscrito
  async function verificarInscricao() {
    try {
      const res = await fetch(`${API_URL}/ingresso/${idParticipante}/${idEvento}`);
      return res.ok;
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err);
      return false;
    }
  }

  async function inscrever() {
    try {
      const res = await fetch(`${API_URL}/ingresso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idParticipante,
          idEvento,
          idTipoIngresso: 1
        })
      });

      if (!res.ok) throw new Error('Erro ao se inscrever');
      alert('Inscrição realizada com sucesso!');
      configurarBotao(); // atualiza o botão
    } catch (err) {
      console.error('Erro ao se inscrever:', err);
      alert('Erro ao se inscrever.');
    }
  }

  async function cancelarInscricao() {
    if (!confirm('Tem certeza que deseja cancelar sua participação?')) return;

    try {
      const res = await fetch(`${API_URL}/ingresso/${idParticipante}/${idEvento}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Erro ao cancelar inscrição');
      alert('Inscrição cancelada com sucesso!');
      configurarBotao();
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      alert('Erro ao cancelar inscrição.');
    }
  }

  // Configura o botão conforme status da inscrição
  async function configurarBotao() {
    const inscrito = await verificarInscricao();

    if (inscrito) {
      btn.textContent = 'Cancelar Participação';
      btn.classList.add('red');
      btn.classList.remove('bg-primary');
      btn.onclick = cancelarInscricao;
    } else {
      btn.textContent = 'Participar';
      btn.classList.remove('red');
      btn.classList.add('bg-primary');
      btn.onclick = inscrever;
    }
  }

  configurarBotao();
});


function formatarDatas(inicio, fim) {
    const dataIni = new Date(inicio);
    const dataFim = new Date(fim);

    const diaIni = dataIni.getDate().toString().padStart(2, '0');
    const mesIni = (dataIni.getMonth() + 1).toString().padStart(2, '0');
    const anoIni = dataIni.getFullYear();

    const diaFim = dataFim.getDate().toString().padStart(2, '0');
    const mesFim = (dataFim.getMonth() + 1).toString().padStart(2, '0');
    const anoFim = dataFim.getFullYear();

    return `${diaIni}/${mesIni}/${anoIni} - ${diaFim}/${mesFim}/${anoFim}`;
}