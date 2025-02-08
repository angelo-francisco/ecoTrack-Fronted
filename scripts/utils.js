import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js'

export const domain = 'https://core-58rc.onrender.com'
// export const domain = 'http://127.0.0.1:8000'

export function formateDate(datestring) {
    return dayjs(datestring).format('DD/MM/YYYY');
}

export async function isUserLoggedIn() {
    try {
        const response = await fetch(`${domain}/ecotrack/api/auth/check`, {
            method: "GET",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.ok
    } catch (error) {
        console.error("Erro ao verificar login:", error);
        return false;
    }
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


