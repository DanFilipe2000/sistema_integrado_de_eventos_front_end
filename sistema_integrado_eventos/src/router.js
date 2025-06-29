const rotaAtual = window.location.pathname;

const rotasValidas = ['/', '/home', '/login', '/sobre', '/contato'];

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