import { redirectNotLoggedUser, formateDate, domain } from './utils.js'

const token = localStorage.getItem('token')
const loader = document.getElementById("loader");

redirectNotLoggedUser()
renderActions()
updateUserPoints()
updateMessages()

function error() {
    localStorage.setItem('bg', "#f8d7da")
    localStorage.setItem('color', "#721c24")
}

function success() {
    localStorage.setItem('bg', "#d4edda")
    localStorage.setItem('color', "#155724")
}

function updateMessages() {
    let msg = localStorage.getItem('message') || ""

    if (msg) {
        document.querySelector("#js-messages")
            .style.display = "block"
        document.querySelector("#js-messages")
            .style.backgroundColor = localStorage.getItem('bg')
        document.querySelector("#js-messages")
            .style.color = localStorage.getItem('color')
        document.querySelector("#js-messages").innerHTML = msg

        setTimeout(() => {
            localStorage.removeItem('message')
            localStorage.removeItem('bg')
            localStorage.removeItem('color')
            document.querySelector("#js-messages")
                .style.display = "none"
        }, 3000)
    }
}


function createActionHtml(id, title, description, created_at, category, points) {
    return `
    <div class="action-card action-${id}">
        <div class="card-header">
        <span class="category-tag ${category === 'R' ? 'reciclagem' : category === 'A' ? 'agua' : category === 'E' ? 'energia' : 'mobilidade'}">${category === 'R' ? 'Reciclagem' : category === 'A' ? 'Água' : category === 'E' ? 'Energia' : 'Mobilidade'}</span>
        <div class="card-actions">
            <button class="icon-btn edit-btn" data-id=${id}>✏️</button>
            <button class="icon-btn delete-btn" data-id=${id}>🗑️</button>
        </div>
        </div>
            <h3>${title}</h3>   
            <p class="card-date">${formateDate(created_at)}</p>
            <p class="card-description">
            ${description}
            </p>
        <div class="card-footer">
                <span class="eco-impact">+${points} EcoPontos</span>
        </div>
    </div>
        `
}

function renderActions() {
    loader.style.display = "flex"
    fetch(domain + "/ecotrack/api/actions/list", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const actionsGrid = document.querySelector("#actionsGrid");
            actionsGrid.innerHTML = ''

            if (data.length == 0) {
                actionsGrid.innerHTML = 'Sem acções sustentáveis adicionadas.';
                loader.style.display = "none"
                return;
            }
            if (data.detail == "Unauthorized") {
                alert("Sem permissão")
                window.location.href = "/auth/login.html"
            }
            data.forEach(action => {
                let actionHTML = createActionHtml(action.id, action.title, action.description, action.created_at,
                    action.category, action.points)
                actionsGrid.innerHTML += actionHTML
            });

            addMethods()
            loader.style.display = "none"

        })

}

function addMethods() {
    document.querySelectorAll(".delete-btn")
        .forEach(deleteBtn => {
            deleteBtn.addEventListener('click', async () => {
                loader.style.display = "flex"
                const id = deleteBtn.dataset.id

                const response = await fetch(`${domain}/ecotrack/api/actions/del/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                })

                if (response.ok) {
                    document.querySelector(`.action-${id}`).remove()

                    if (document.querySelectorAll('.action-card').length == 0) {
                        document.querySelector("#actionsGrid").innerHTML = 'Sem acções sustentáveis adicionadas.'
                    }
                    updateUserPoints()

                } else {
                    localStorage.setItem("message", "Erro ao deletar acção: Id inválido")
                    error()
                    updateMessages()
                }
                loader.style.display = "none"
            })
        })

    document.querySelectorAll('.edit-btn')
        .forEach(editBtn => {
            editBtn.addEventListener('click', async () => {
                loader.style.display = "flex"
                const id = editBtn.dataset.id

                const response = await fetch(`${domain}/ecotrack/api/actions/get/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    }
                })

                const data = await response.json()
                if (response.ok) {
                    loader.style.display = "none"
                    showModal2()
                    document.querySelector('#actionTitleEdit').value = data.title
                    document.querySelector('#actionDescriptionEdit').value = data.description
                    document.querySelector('#actionCategoryEdit').value = data.category

                    document.querySelector('#actionFormEdit')
                        .addEventListener('submit', async (e) => {
                            let stringifiedData = {
                                title: document.querySelector('#actionTitleEdit').value,
                                description: document.querySelector('#actionDescriptionEdit').value,
                                category: document.querySelector('#actionCategoryEdit').value,
                                points: data.points
                            }
                            closeModal2()

                            loader.style.display = "flex"
                            e.preventDefault()
                            const response2 = await fetch(`${domain}/ecotrack/api/actions/update/${id}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(stringifiedData)
                            })

                            const data2 = await response2.json()

                            if (response.ok) {
                                const actionHTML = document.querySelector(`.action-${id}`)

                                const tempContainer = document.createElement("div");
                                tempContainer.innerHTML = createActionHtml(data2.id, data2.title, data2.description, data2.created_at, data2.category, data2.points);

                                const newActionElement = tempContainer.firstElementChild

                                actionHTML.replaceWith(newActionElement)
                                loader.style.display = "none"
                                addMethods()
                                localStorage.setItem("message", `<strong>${data.title}</strong> foi editado.`)
                                success()
                                updateMessages()
                            } else {
                                localStorage.setItem("message", data.message)
                                error()
                                updateMessages()
                            }

                        })
                } else {
                    closeModal2()
                    localStorage.setItem("message", "Erro ao captar acção: Id inválido")
                    error()
                    updateMessages()
                }
                loader.style.display = "none"
            })
        })
}

function updateActions(newAction) {
    const actionsGrid = document.querySelector("#actionsGrid");

    if (document.querySelectorAll('.action-card').length == 0) {
        actionsGrid.innerHTML = ''
    }

    actionsGrid.innerHTML += newAction
}

function showModal() {
    document.getElementById("actionForm").classList.add("show");
}

function closeModal() {
    document.getElementById("actionForm").classList.remove("show");
    document.querySelector('#actionTitle').value = ''
    document.querySelector('#actionDescription').value = ''
    document.querySelector('#actionCategory').value = ''

}

function updateUserPoints() {
    const pointsHTML = document.querySelector("#user-points")

    fetch(domain + "/ecotrack/api/actions/total-points", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const points = data.total_points
            pointsHTML.innerText = points
        })
}

function showModal2() {
    document.getElementById("actionFormEdit").classList.add("show");
}

function closeModal2() {
    document.getElementById("actionFormEdit").classList.remove("show");
    document.querySelector('#actionTitleEdit').value = ''
    document.querySelector('#actionDescriptionEdit').value = ''
    document.querySelector('#actionCategoryEdit').value = ''

}

document.getElementById("newActionBtn").addEventListener("click", showModal);

document.querySelector("#cancelBtn").addEventListener("click", closeModal);
document.querySelector("#cancelBtn2").addEventListener("click", closeModal2);

// document.getElementById("confirmationModal").addEventListener("click", (event) => {
//     if (event.target === document.getElementById("actionForm")) {
//         closeModal();
//     }
// });

document.querySelector('#js-action-form')
    .addEventListener('submit', async (event) => {
        event.preventDefault()

        if (!token) {
            localStorage.setItem("message", "Você precisa autenticar-se")
            updateMessages("#f8d7da", "#721c24")
            return
        }

        const numeros = [10, 20, 30]
        const points = numeros[Math.floor(Math.random() * numeros.length)]
        const title = document.querySelector('#actionTitle').value
        const description = document.querySelector('#actionDescription').value
        const category = document.querySelector('#actionCategory').value

        closeModal()
        loader.style.display = "flex"

        const response = await fetch(domain + "/ecotrack/api/actions/create", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category,
                points: points
            })
        })

        loader.style.display = "none"
        const data = await response.json()

        if (response.ok) {
            updateActions(createActionHtml(data.id, data.title, data.description,
                data.created_at, data.category, data.points))
            addMethods()
        } else {
            localStorage.setItem("message", "Erro ao salvar o formulário")
            error()
            updateMessages()

        }
        updateUserPoints()
    })

    document.querySelector('#logout-btn')
        .addEventListener('click', async () => {
            loader.style.display = "flex"
            const response = await fetch(domain + '/ecotrack/api/auth/logout', {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            })
            
            const data = await response.json()
            
            loader.style.display = "none"
            if (response.ok) {
                localStorage.removeItem('token')
                window.location.href = '/auth/login.html'
                localStorage.setItem('message', 'Logout feito com sucesso!')
                success()
                updateMessages()
            }
        })