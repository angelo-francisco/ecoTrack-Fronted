import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'

export function formateDate(datestring) {
    return dayjs(datestring).format('DD/MM/YYYY');
}

export async function isUserLoggedIn() {
    const response = await fetch("http://127.0.0.1:8000/ecotrack/api/auth/check", {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return response.status;
}

export function redirectLoggedUser() {
    document.addEventListener('DOMContentLoaded', async () => {
        const status = await isUserLoggedIn();

        if (status === 200) {
            window.location.href = '/index.html';
        }
    });
}

export function redirectNotLoggedUser() {
    document.addEventListener('DOMContentLoaded', async () => {
        const status = await isUserLoggedIn();

        if (status === 400) {
            window.location.href = '/auth/login.html';
        }
    });
}


