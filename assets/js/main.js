const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const modal = document.getElementsByClassName("pokemonDetails")[0];
const bgDetail = document.getElementsByClassName("bgDetail")[0];
const contentDetails = document.getElementsByClassName("contentDetails")[0];

const maxRecords = 151
const limit = 10
let offset = 0;

function changeBackgroundColor(e) {
    const { backgroundColor } = getComputedStyle(e);
    document.body.style.backgroundColor = backgroundColor;
}

function showModal(e) {
    modal.style.opacity = 1;
    modal.style.visibility = "visible";
    document.body.style.overflow = "hidden";
    const data = {
        number: Number(e.children[0].innerText.replace("#", "")),
        name: e.children[1].innerText,
        bgColorClass: e.children[2].children[0].children[0].innerText,
        types: e.children[2].children[0].cloneNode(true),
        image: e.children[2].children[1].src
    }
    initModal(data);
}

async function initModal({ bgColorClass, number, name, types, image }) {
    const nameEl = document.querySelector(".top>div>.name");
    const typesEl = document.querySelector(".top>div>.types");
    const numberEl = document.querySelector(".top>.number");
    const imgEl = document.querySelector(".details .image > img");
    const bgDetailsListEl = document.querySelector(".bgDetail>ol");
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}/`);
    response = await response.json();
    const data = {
        base_experience: { value: response.base_experience, class: "fire" },
        height: { value: response.height, class: "eletric" },
        order: { value: response.order, class: "poison" },
        weight: { value: response.weight, class: "grass" }
    }
    const titles = [];
    Object.keys(data).forEach(key => {
        const color = data[key].class;

        titles.push({
            key,
            color
        });
    })
    titles.forEach((title) => {

        const percent = Math.min(100, Math.max(0, data[title.key].value));
        bgDetailsListEl.insertAdjacentHTML("afterbegin", `
    <li>
        <span>${title.key.replace("_", " ")} (${data[title.key].value})</span>
        <div class="bar"><span class="${title.color}" style="width:${percent}%"></span></div>
    </li>
`)
    })
    numberEl.innerText = `#${number}`;
    imgEl.alt = name;
    imgEl.src = image;
    contentDetails.classList.add(`${bgColorClass}`);
    nameEl.innerText = name;
    if (typesEl.children.length > 0) {
        Array.from(typesEl.children).forEach(child => child.remove());
    }
    Array.from(types.children).forEach(type => {
        typesEl.appendChild(type);
    })
}

function closeModal() {
    const bgDetailsListEl = document.querySelector(".bgDetail>ol");
    modal.style.opacity = 0;
    modal.style.visibility = "hidden";
    document.body.style.overflow = "visible";
    let classes = contentDetails.className.split(" ").splice(0, 2).join().replace(",", " ");
    contentDetails.className = classes;
    Array.from(bgDetailsListEl.children).forEach(el => el.remove())
}

function convertPokemonToLi(pokemon) {

    return `
        <li onmouseover="changeBackgroundColor(this)" onclick="showModal(this)" class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})

