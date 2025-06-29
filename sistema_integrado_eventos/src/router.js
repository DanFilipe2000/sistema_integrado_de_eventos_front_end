const rotaAtual = window.location.pathname;

const rotasValidas = ['/', '/welcome', '/login', '/register', '/event-add'];

function verifyPath() {
    if (rotaAtual == "/") {
        window.location.href = '/welcome';
        return;
    }

    if (rotasValidas.includes(rotaAtual)) {
        window.location.href = '/404';
        return;
    }
}

verifyPath();