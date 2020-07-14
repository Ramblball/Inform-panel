document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logInBtn').onclick = LogIn;
});


function LogIn() {
    let user = document.getElementById("userName").value;
    let pass = document.getElementById("userPassword").value;
    fetch('/login', {
        method: 'POST',
        body: {
            'login': user, 'password': pass
        }
    })
        .then(res => window.location.href = '/')
        .catch(er => console.error(er));
}