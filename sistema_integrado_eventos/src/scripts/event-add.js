import { API_URL } from './helpers/envVariables.js';

function getCategorias() {
  fetch(`${API_URL}/categoriaevento`, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return response.json();
    })
    .then(dados => {
      console.log('Dados recebidos:', dados);
      popularSelectCategorias(dados); // Chama função para preencher o select
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
    });
};

function popularSelectCategorias(categorias) {
  const select = document.getElementById('model_event_categoria');

  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.Codigo;
    option.textContent = categoria.Titulo;
    select.appendChild(option);
  });

  // Atualiza o select caso esteja usando MaterializeCSS
  if (M && M.FormSelect) {
    M.FormSelect.init(select);
  }
};

function getCidades() {
  fetch(`${API_URL}/cidade`, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      return response.json();
    })
    .then(dados => {
      console.log('Cidades recebidas:', dados);
      popularSelectCidades(dados);
    })
    .catch(error => {
      console.error('Erro ao buscar cidades:', error);
    });
};

function popularSelectCidades(cidades) {
  const select = document.getElementById('model_event_cidade');

  // Limpa opções antigas (caso queira reiniciar sempre)
  select.innerHTML = '';

  // Adiciona uma opção inicial desabilitada
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = 'Selecione a cidade';
  select.appendChild(placeholder);

  // Popula com as cidades
  cidades.forEach(cidade => {
    const option = document.createElement('option');
    option.value = cidade.Codigo;
    option.textContent = cidade.Nome;
    select.appendChild(option);
  });

  // Atualiza select do Materialize (se estiver usando)
  if (M && M.FormSelect) {
    M.FormSelect.init(select);
  }
};

function addFieldValidation() {
  const botaoSalvar = document.querySelector('#btn_salvar_evento');

  const camposTexto = [
    '#model_event_title',
    '#model_event_data_inicio',
    '#model_event_data_termino',
    '#model_event_cep',
    '#model_event_logradouro',
    '#model_event_bairro',
    '#model_event_numero'
  ].map(id => document.querySelector(id));

  const selectCidade = document.querySelector('#model_event_cidade');
  const selectCategorias = document.querySelector('#model_event_categoria');

  function verificarCamposPreenchidos() {
    const todosPreenchidos = camposTexto.every(campo => campo && campo.value.trim() !== '');

    const cidadeSelecionada = selectCidade && selectCidade.value !== '';
    const categoriasSelecionadas = selectCategorias && Array.from(selectCategorias.selectedOptions).length > 0;

    if (todosPreenchidos && cidadeSelecionada && categoriasSelecionadas) {
      botaoSalvar.removeAttribute('disabled');
    } else {
      botaoSalvar.setAttribute('disabled', true);
    }
  }

  // Adiciona listeners nos campos de texto
  camposTexto.forEach(campo => {
    campo.addEventListener('input', verificarCamposPreenchidos);
  });

  // Listener para o select de cidade
  if (selectCidade) {
    selectCidade.addEventListener('change', verificarCamposPreenchidos);
  }

  // Listener para o select múltiplo
  if (selectCategorias) {
    selectCategorias.addEventListener('change', verificarCamposPreenchidos);
  }
};

function getExpositores() {
  fetch(`${API_URL}/expositor`, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao buscar expositores');
      }
      return response.json();
    })
    .then(expositores => {
      console.log('Expositores recebidos:', expositores);
      popularSelectExpositores(expositores);
    })
    .catch(error => {
      console.error('Erro na requisição:', error);
    });
};

function popularSelectExpositores(expositores) {
  const select = document.getElementById('model_event_expositor');
  expositores.forEach(exp => {
    const option = document.createElement('option');
    option.value = exp.CPF;
    option.textContent = exp.Nome + " - " + exp.Email;
    select.appendChild(option);
  });

  if (M && M.FormSelect) M.FormSelect.init(select);
}

function gerarNomeImagemAleatorio(extensao = 'jpg') {
  const timestamp = Date.now(); // ex: 1727552921873
  const aleatorio = Math.random().toString(36).substring(2, 10); // ex: 'xkqz9w8l'
  return `${timestamp}_${aleatorio}.${extensao}`;
};

function formatarDataISO(dataTexto) {
  const meses = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', Jun: '06', Jul: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };

  const partes = dataTexto.replace(',', '').split(' '); // ["Jun", "30", "2025"]
  const mes = meses[partes[0]];
  const dia = partes[1].padStart(2, '0');
  const ano = partes[2];

  return `${ano}-${mes}-${dia}`;
}


async function submitEvento() {
  const imagem = document.getElementById('model_event_image').files[0];
  const user = JSON.parse(localStorage.getItem('user'));

  let caminhoImagem = '';

  // Se tiver imagem, envia primeiro para o backend
  if (imagem) {
    const extensao = imagem.name.split('.').pop();
    const nomeArquivo = gerarNomeImagemAleatorio(extensao);

    const formData = new FormData();
    formData.append('imagem', imagem);
    formData.append('nomeArquivo', nomeArquivo);

    try {
      const resImagem = await fetch(`${API_URL}/image/event`, {
        method: 'POST',
        body: formData
      });

      if (!resImagem.ok) throw new Error('Erro ao enviar imagem');

      const resposta = await resImagem.json();
      caminhoImagem = resposta.caminho;
      console.log("resposta", resposta);
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      alert('Erro ao enviar a imagem do evento.');
      return;
    }
  }

  // Agora envia os dados do evento
  const dados = {
    evento: {
      titulo: document.getElementById('model_event_title').value.trim(),
      data_inicio: document.getElementById('model_event_data_inicio').value.trim() ? formatarDataISO(document.getElementById('model_event_data_inicio').value.trim()) : null,
      data_termino: document.getElementById('model_event_data_termino').value.trim() ? formatarDataISO(document.getElementById('model_event_data_termino').value.trim()) : null,
      imagem: caminhoImagem,
      criadoPor: user.CPF
    },
    endereco: {
      cep: document.getElementById('model_event_cep').value.trim(),
      logradouro: document.getElementById('model_event_logradouro').value.trim(),
      bairro: document.getElementById('model_event_bairro').value.trim(),
      numero: document.getElementById('model_event_numero').value.trim(),
      cidade_id: document.getElementById('model_event_cidade').value,
    },
    categorias: Array.from(document.getElementById('model_event_categoria').selectedOptions).map(opt => opt.value),
    expositores: Array.from(document.getElementById('model_event_expositor').selectedOptions).map(opt => opt.value)
  };

  console.log('Enviando dados:', dados);

  fetch(`${API_URL}/evento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao enviar dados');
      return response.json();
    })
    .then(retorno => {
      console.log('Resposta do servidor:', retorno);
      alert('Evento cadastrado com sucesso!');
      window.location.href = `/event-view?id-event=${retorno.Codigo}`;
    })
    .catch(error => {
      console.error('Erro no envio:', error);
      alert('Erro ao enviar o evento.');
    });
}


document.addEventListener('DOMContentLoaded', function () {
  getCategorias();
  getCidades();
  getExpositores();
  addFieldValidation();

  const botao = document.querySelector('#btn_salvar_evento'); // Seleciona o botão "Salvar Evento"

  botao.addEventListener('click', function (event) {
    event.preventDefault(); // Previne o comportamento padrão do botão (caso esteja dentro de um form)
    submitEvento();
  });
});