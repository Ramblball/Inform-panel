document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logInBtn').onclick = LogIn;
});


function LogIn() {
    let user = document.getElementById("userName").value;
    let pass = document.getElementById("userPassword").value;
    console.log({
        login: user,
        password: pass
    })
    fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: user,
                password: pass
            })
        })
        .then(res => {
            window.location.href = '/';
            console.log(res)
        })
        .catch(er => console.error(er));
}