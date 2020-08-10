const cardItem = (props) => {
  const { id, image, name, species, origin } = props;
  const { name: planet, url } = origin;
  return `<div class="column is-one-quarter">
        <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img src="${image}" alt="Placeholder image">
              </figure>
            </div>
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image is-48x48">
                    <img src="${image}" alt="Placeholder image">
                    <figcaption>${name}</figcaption>
                  </figure>
                </div>
                <div class="media-content">
                  <h3 class="subtitle is-4">Especie: ${species}</h3>
                  <h4 class="p is-5">Planeta: ${planet}</h4>
                </div>
                <div class="buttons">
                    <button id="character${id}" class="button is-primary open_modal">Más info</button>
              </div>
            </div>
          </div>
        </div>
    </div>  
    `;
};

const cardItemLocation = (props) => {
  const { id, type, name, dimension } = props;
  return `<div class="column is-one-quarter">
      <div class="card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <h3 class="subtitle is-4">Nombre: ${name}</h3>
                <h3 class="subtitle is-4">Tipo: ${type}</h3>
                <h4 class="p is-5">Dimensión: ${dimension}</h4>
              </div>
              <div class="buttons">
                  <button id="character${id}" class="button is-primary open_modal">Habitantes</button>
            </div>
          </div>
        </div>
      </div>
  </div>  
  `;
};

const main = async () => {
  const baseURL = "https://rickandmortyapi.com/api/";
  //Parte 1: Obtener elementos de API y mostrarlos en el DOM
  try {
    const characters = await getCharacters(baseURL, 1, 20);
    appendElements(characters, true);
  } catch (error) {
    console.error("¡Error! ", error);
    $grid.innerHTML =
      "<p class='error'>Ha ocurrido un error, por favor, intente más tarde.</p>";
  }

  //parte 2: Crear un buscador de personajes
  const $submit = document.querySelector(".handle_search");
  $submit.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const $input = document.querySelector(".input_search");
      const valor = $input.value;
      $grid.innerHTML =
        "<img src='assets/img/loading.gif' alt='loading' class='loading-grid'>";
      const charactersByQuery = await getCharacterByQuery(baseURL, valor);
      appendElements(charactersByQuery.results, true);
      const $modalOpenArr = document.querySelectorAll(".open_modal");
      $modalOpenArr.forEach((boton) => {
        boton.addEventListener("click", async () => {
          $modal.classList.add("is-active");
          await showDataModal(boton.id, baseURL);
        });
      });
    } catch (error) {
      $grid.innerHTML =
        "<p class='error'>Ha ocurrido un error, por favor, intente más tarde.</p>";
      console.error("¡Error! ", error);
    }
  });

  const $submitLocation = document.querySelector(".handle_search_location");
  $submitLocation.addEventListener("click", async (event) => {
    try {
      event.preventDefault();
      const $input = document.querySelector(".input_search_location");
      const valor = $input.value;
      $grid.innerHTML =
        "<img src='assets/img/loading.gif' alt='loading' class='loading-grid'>";
      const planetsByQuery = await getPlanetsByQuery(baseURL, valor);
      appendElementsLocation(planetsByQuery.results, true);
      const $modalOpenArr = document.querySelectorAll(".open_modal");
      $modalOpenArr.forEach((boton) => {
        boton.addEventListener("click", async () => {
          $modal.classList.add("is-active");
          await showDataModalLocation(boton.id, baseURL);
        });
      });
    } catch (error) {
      $grid.innerHTML =
        "<p class='error'>Ha ocurrido un error, por favor, intente más tarde.</p>";
      console.error("¡Error! ", error);
    }
  });

  //MODAL
  const $modalOpenArr = document.querySelectorAll(".open_modal");
  const $modal = document.querySelector(".modal");
  const $modalClose = document.querySelector(".modal-close");
  $modalOpenArr.forEach((boton) => {
    boton.addEventListener("click", async () => {
      $modal.classList.add("is-active");
      await showDataModal(boton.id, baseURL);
    });
  });

  $modalClose.addEventListener("click", () => {
    $modal.classList.remove("is-active");
  });
};
const getCharacterByQuery = async (baseUrl, query) => {
  const url = `${baseUrl}/character/?name=${query}`;
  const response = await fetch(url);
  const characters = await response.json();
  return characters;
};

const getPlanetsByQuery = async (baseUrl, query) => {
  const url = `${baseUrl}/location/?name=${query}`;
  const response = await fetch(url);
  const locations = await response.json();
  return locations;
};

const getCharacters = async (api, from, to) => {
  const charactersRange = Array.from(
    { length: to - from + 1 },
    (_, index) => index + 1
  ).join(",");
  const url = `${api}character/${charactersRange}`;
  const response = await fetch(url);
  const listCharacters = response.json();
  return listCharacters;
};

const appendElements = async (list, emptyGrid) => {
  const objHtml = document.querySelector(".grid");
  if (emptyGrid) objHtml.innerHTML = "";
  if (list != undefined)
    list.forEach((obj) => (objHtml.innerHTML += cardItem(obj)));
  else
    objHtml.innerHTML =
      "<p class='error'>¡Ha buscado un personaje que no existe en la serie!<p>";
};

const appendElementsLocation = async (list, emptyGrid) => {
  const objHtml = document.querySelector(".grid");
  if (emptyGrid) objHtml.innerHTML = "";
  if (list != undefined)
    list.forEach((obj) => (objHtml.innerHTML += cardItemLocation(obj)));
  else
    objHtml.innerHTML =
      "<p class='error'>¡Ha buscado un personaje que no existe en la serie!<p>";
};

const getNumberIdData = (id) => {
  return id.substring(9);
};

const showDataModal = async (characterId, baseUrl) => {
  //Loading
  const $modal = document.querySelector(".modal-content");
  $modal.innerHTML =
    "<img src='assets/img/loading.gif' alt='loading' class='loading-modal'>";
  //Get Character ID
  const id = getNumberIdData(characterId);
  //Get Episodes List
  try {
    //Data by Character Id
    const datos = await fetchGeneralData(`${baseUrl}character/${id}`);
    const { episode: episodesList } = datos;
    //Get data by episode url
    let txtHtml = "";
    for (let i = 0; i < episodesList.length; i++) {
      //INVESTIGADO DESDE https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
      const linkEpisode = episodesList[i];
      const propsEpisode = await fetchGeneralData(linkEpisode);
      const { name: nombreEpisodio, air_date, episode } = propsEpisode;
      txtHtml += `<tr><td>${nombreEpisodio}</td><td>${air_date}</td><td>${episode}</td></tr>`;
    }
    $modal.innerHTML = await buildHtmlModal(datos, txtHtml);
  } catch (error) {
    console.error("Error: ", error);
    $modal.innerHTML =
      "Ha ocurrido un error, por favor, intente de nuevo más tarde.";
  }
};

const showDataModalLocation = async (planetId, baseUrl) => {
  //Loading
  const $modal = document.querySelector(".modal-content");
  $modal.innerHTML =
    "<img src='assets/img/loading.gif' alt='loading' class='loading-modal'>";
  //Get Planet ID
  const id = getNumberIdData(planetId);
  //Get Characters List
  try {
    //Data by Location Id
    const datos = await fetchGeneralData(`${baseUrl}location/${id}`);
    const { residents: listaHabitantes } = datos;
    //Get data by episode url
    let txtHtml = "";
    for (let i = 0; i < listaHabitantes.length; i++) {
      const linkCharacter = listaHabitantes[i];
      const propsCharacter = await fetchGeneralData(linkCharacter);
      const { name: name, image } = propsCharacter;
      txtHtml += `<tr><td><img class='imageCharacterLocation' src='${image}' alt='${name}'/></td><td>${name}</td></tr>`;
    }
    $modal.innerHTML = await buildHtmlModalLocation(datos, txtHtml);
  } catch (error) {
    console.error("Error: ", error);
    $modal.innerHTML =
      "Ha ocurrido un error, por favor, intente de nuevo más tarde.";
  }
};

const fetchGeneralData = async (url) => {
  const response = await fetch(url);
  const dataEpisode = response.json();
  return dataEpisode;
};

const buildHtmlModalLocation = async (props, infoCharacters) => {
  const { name, type, dimension, residents } = props;
  if (residents.length > 0) {
    return `<div class="media-content">
    <div class="content">
      <p>
        <strong>Origen: ${name}</strong>
        <br>
        Tipo: ${type}
        <br>
        Dimension: ${dimension}
      </p>
    </div>
    <table class="tableLocation">
      <caption>
      Lista de habitantes del origen ${name}
      </caption>
      <tr>
        <th>Imagen</th>
        <th>Personaje</th>
      </tr>
      ${infoCharacters}
    </table>
  </div>
</article>`;
  } else {
    return `<div class="media-content">
    <div class="content">
      <p>
        <strong>Origen: ${name}</strong>
        <br>
        Tipo: ${type}
        <br>
        Dimension: ${dimension}
      </p>
    </div>
    <p class="not-list-residents">No se conoce ningún habitante del origen</p>
  </div>
</article>`;
  }
};

const buildHtmlModal = async (props, infoEpisodes) => {
  const { name, status, gender, origin, image, residents } = props;
  const { name: planet } = origin;
  if (residents.length > 0) {
  }
  return `<article class="media">
  <div class="media-content">
    <figure class="media-left">
      <p class="image is-64x64">
        <img src="${image}">
      </p>
    </figure>
    <div class="content">
      <p>
        <strong>Nombre: ${name}</strong>
        <br>
        Género: ${gender}
        <br>
        Planeta de origen: ${planet}
        <br>
        Estado de vida: ${status}
      </p>
    </div>
    <table>
      <caption>
      Lista de episodios en los que aparece ${name}
      </caption>
      <tr>
        <th>Título del episodio</th>
        <th>Fecha de emisión</th>
        <th>Número de episodio</th>
      </tr>
      ${infoEpisodes}
    </table>
  </div>
</article>`;
};

const $grid = document.querySelector(".grid");
main();

/*
Agregar una funcionalidad extra a elección del alumno --> Sin iniciar

CSS de la nueva función --> esperando 
*/
