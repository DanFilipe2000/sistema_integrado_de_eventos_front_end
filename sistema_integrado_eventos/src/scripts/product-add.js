import { API_URL } from './helpers/envVariables.js';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.CPF) {
        alert('Usuário não autenticado.');
        return;
    }

    const titleInput = document.getElementById('model_product_title');
    const descInput = document.getElementById('model_product_description');
    const valueInput = document.getElementById('model_product_value');
    const eventSelect = document.getElementById('model_product_product');
    const submitBtn = document.getElementById('btn-submit');

    const inputs = [titleInput, descInput, valueInput, eventSelect];

    function validarCampos() {
        const preenchido = inputs.every(input => input.value && input.value.trim() !== '');
        submitBtn.disabled = !preenchido;
    }

    inputs.forEach(input => input.addEventListener('input', validarCampos));
    eventSelect.addEventListener('change', validarCampos);

    async function carregarEventosDoUsuario() {
        try {
            const res = await fetch(`${API_URL}/evento`);
            const eventos = await res.json();

            const eventosDoUsuario = eventos.filter(evento => evento.CriadoPor === user.CPF);

            if (!eventosDoUsuario.length) {
                const option = document.createElement('option');
                option.disabled = true;
                option.selected = true;
                option.textContent = 'Nenhum evento seu encontrado';
                eventSelect.appendChild(option);
                return;
            }

            eventosDoUsuario.forEach(ev => {
                const option = document.createElement('option');
                option.value = ev.Codigo;
                option.textContent = ev.Titulo;
                eventSelect.appendChild(option);
            });

            M.FormSelect.init(eventSelect); // MaterializeCSS
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            alert('Erro ao carregar eventos');
        }
    }

    carregarEventosDoUsuario();

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const produto = {
            Titulo: titleInput.value.trim(),
            Descricao: descInput.value.trim(),
            Valor: valueInput.value.trim(),
            idExpositor: user.CPF,
            idEvento: eventSelect.value
        };

        try {
            const res = await fetch(`${API_URL}/produto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produto)
            });

            if (!res.ok) throw new Error('Erro ao cadastrar produto');

            const resposta = await res.json();
            alert('Produto cadastrado com sucesso!');
            location.reload();
        } catch (err) {
            console.error('Erro ao enviar produto:', err);
            alert('Erro ao cadastrar produto');
        }
    });
});