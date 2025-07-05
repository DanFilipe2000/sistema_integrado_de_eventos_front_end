import { API_URL } from './helpers/envVariables.js';

function gerarNomeImagemAleatorio(extensao = 'jpg') {
    const timestamp = Date.now(); // ex: 1727552921873
    const aleatorio = Math.random().toString(36).substring(2, 10); // ex: 'xkqz9w8l'
    return `${timestamp}_${aleatorio}.${extensao}`;
}

function getCursos() {
    fetch(`${API_URL}/curso`, {
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
            popularSelectCursos(dados); // Chama função para preencher o select
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
        });
}

function popularSelectCursos(cursos) {
    const select = document.getElementById('model_user_curso');

    cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.Codigo;
        option.textContent = curso.Titulo;
        select.appendChild(option);
    });

    // Atualiza o select caso esteja usando MaterializeCSS
    if (M && M.FormSelect) {
        M.FormSelect.init(select);
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    const nome = document.getElementById('model_user_name');
    const cpf = document.getElementById('model_user_cpf');
    const email = document.getElementById('model_user_email');
    const datanascimento = document.getElementById('model_user_datanascimento');
    const senha = document.getElementById('model_user_password');
    const celular = document.getElementById('model_user_phone');
    const matricula = document.getElementById('model_user_matricula');
    const curso = document.getElementById('model_user_curso');
    const radios = document.getElementsByName('user_type');
    const btn = document.getElementById('register-btn');

    const campoMatricula = matricula.closest('.row');
    const campoCurso = curso.closest('.row');

    // Máscara dinâmica CPF
    cpf.addEventListener('input', () => {
        cpf.value = cpf.value.replace(/\D/g, '') // remove não números
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .substring(0, 14);
    });

    // Máscara dinâmica celular

    celular.addEventListener('input', () => {
        celular.value = celular.value
            .replace(/\D/g, '') // remove tudo que não é número
            .replace(/^(\d{2})(\d)/, '($1) $2')       // (00) 0...
            .replace(/(\d{1}) (\d{4})(\d)/, '$1 $2-$3') // separa 0 0000-...
            .replace(/(\d{4})-(\d{4}).*/, '$1-$2')      // limita em 4-4 dígitos
            .substring(0, 17); // garante máximo de caracteres
    });

    // Validações
    function validarCampos() {
        const tipo = Array.from(radios).filter(radio => radio.checked)[0].id;

        const nomeOk = nome.value.trim() !== '';
        const cpfOk = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf.value);
        const emailOk = email.value ? /^[^\s@]+@[^\s@]+\.(com|com\.br)$/.test(email.value.trim()) : false;
        const senhaOk = senha.value.trim().length >= 6;
        const celularOk = celular.value.trim() !== '';
        const datanascimentoOk = datanascimento ? datanascimento.value.trim() : false;

        console.log("datanascimento:", datanascimento.value);

        let matriculaOk = true;
        let cursoOk = true;

        if (tipo === 'model_participante') {
            matriculaOk = matricula.value.trim() !== '';
            cursoOk = curso.value.trim() !== '';
        }

        const tudoOk = nomeOk && datanascimentoOk && cpfOk && emailOk && senhaOk && celularOk && matriculaOk && cursoOk;

        btn.disabled = !tudoOk;
    }

    function atualizarVisibilidadeCampos() {
        const tipo = Array.from(radios).filter(radio => radio.checked)[0].id;
        if (tipo === 'model_expositor') {
            campoMatricula.style.display = 'none';
            campoCurso.style.display = 'none';
        } else {
            campoMatricula.style.display = '';
            campoCurso.style.display = '';
        }
    }

    // Escutadores
    [nome, cpf, email, senha, celular, matricula, curso].forEach(input => {
        if (input) {
            input.addEventListener('input', validarCampos);
            input.addEventListener('change', validarCampos);
        }
    });

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            atualizarVisibilidadeCampos();
            validarCampos();
        });
    });

    // Inicializa
    atualizarVisibilidadeCampos();
    validarCampos();
});

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('register-btn');

    btn.addEventListener('click', () => {
        const userType = document.getElementById('model_participante').checked ? 'participante' : 'expositor';
        const imagem = document.getElementById('model_user_image').files[0];

        let caminhoImagem = "";

        const formData = new FormData();

        // Gera nome aleatório com extensão correta
        if (imagem) {
            const extensao = imagem.name.split('.').pop();
            const nomeArquivo = gerarNomeImagemAleatorio(extensao);
            caminhoImagem = `/images/profile/${nomeArquivo}`; // apenas esse path será enviado ao back

            // Prepara o FormData para enviar imagem separadamente
            formData.append('imagem', imagem);
            formData.append('nomeArquivo', nomeArquivo);
        }

        // Primeiro envia a imagem ao servidor
        fetch(`${API_URL}/image/profile`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(uploadRes => {
                console.log("uploadRes", uploadRes)
                if (uploadRes.error) throw new Error(uploadRes.error);

                // Depois envia os dados de cadastro com o path da imagem
                const data = {
                    user_type: userType,
                    Nome: document.getElementById('model_user_name').value.trim(),
                    CPF: document.getElementById('model_user_cpf').value.trim().replace(/\D/g, ''),
                    Email: document.getElementById('model_user_email').value.trim(),
                    Password: document.getElementById('model_user_password').value.trim(),
                    Fones: document.getElementById('model_user_phone').value.trim().replace(/[^a-zA-Z0-9]/g, ''),
                    DataNascimento: document.getElementById('model_user_datanascimento').value.trim()
                        ? formatarDataISO(document.getElementById('model_user_datanascimento').value.trim())
                        : null,
                    type_user: userType,
                    CaminhoFoto: caminhoImagem // Aqui vai o path da imagem
                };

                if (userType === 'participante') {
                    data.Matricula = document.getElementById('model_user_matricula').value.trim();
                    data.idCurso = document.getElementById('model_user_curso').value.trim();
                }

                return fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            })
            .then(response => response.json())
            .then(res => {
                if (res.error) throw new Error(res.error);
                alert('Usuário registrado com sucesso!');
                window.location.href = '/login';
            })
            .catch(err => {
                console.error('Erro ao registrar:', err);
                alert(err);
            });
    });

});

window.addEventListener('DOMContentLoaded', () => {
    getCursos();
});