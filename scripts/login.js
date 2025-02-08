import { domain, redirectLoggedUser } from "./utils.js";

redirectLoggedUser()

const loader = document.getElementById("loader");

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);
});


let msg = localStorage.getItem('message') || ""

if (msg) {
    document.querySelector("#js-messages")
        .style.display = "block"
    document.querySelector("#js-messages").innerHTML = msg

    setTimeout(() => {
        localStorage.removeItem('message')
        document.querySelector("#js-messages")
            .style.display = "none"
    }, 3000)
}

document.querySelector("#loginForm")
    .addEventListener("submit", async (event) => {
        loader.style.display = "flex";
        event.preventDefault()

        const username = document.getElementById("username").value
        const password = document.getElementById("password").value

        try {
            const response = await fetch(domain+'/ecotrack/api/auth/login', {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            localStorage.setItem('token', data.token);
            window.location.href = "/index.html";
        } catch (error) {
            alert(error.message)
        } finally {
            loader.style.display = "none"
        }

    })
