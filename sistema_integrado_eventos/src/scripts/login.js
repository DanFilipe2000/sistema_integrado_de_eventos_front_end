import { API_URL } from './helpers/envVariables.js';

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('model_user_email');
    const passwordInput = document.getElementById('model_user_password');
    const loginBtn = document.getElementById('btn-login');

    function validarFormulario() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const podeHabilitar = email && emailValido && password;

        loginBtn.disabled = !podeHabilitar;
        loginBtn.style.pointerEvents = podeHabilitar ? 'auto' : 'none';
        loginBtn.style.opacity = podeHabilitar ? '1' : '0.6';
    }

    // Observa mudanças nos campos
    emailInput.addEventListener('input', validarFormulario);
    passwordInput.addEventListener('input', validarFormulario);

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const radios = document.getElementsByName('user_type');
        const userType = Array.from(radios).filter(radio => radio.checked)[0].id === 'model_participante' ? 'participante' : 'expositor';

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    type_user: userType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Erro ao fazer login.');
                return;
            }

            const data = await response.json();
            console.log("DATA", data);
            localStorage.setItem('user', JSON.stringify({matricula: data.Matricula, name: data.Nome, email: data.Email, CPF: data.CPF, foto_perfil: data.FotoBase64, type_user: userType}));

            alert('Login realizado com sucesso!');
            window.location.href = '/home';
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao conectar com o servidor. ' + error);
        }
    });

    // Inicializa validação
    validarFormulario();
});