import { redirectLoggedUser } from "./utils.js";

redirectLoggedUser()

const loader = document.getElementById("loader");

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);
});

document.querySelector("#signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    loader.style.display = "flex";

    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://core-58rc.onrender.com/ecotrack/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                ...(email && { email: email }),
            }),
        });

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message);
        }

        localStorage.setItem("message", "Dados cadastrados com sucesso!");
        window.location.href = "/auth/login.html";
    } catch (error) {
        alert(error.message);
    } finally {
        loader.style.display = "none";
    }
});
