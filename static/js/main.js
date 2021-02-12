const accessToken = "2d1ddeaadc20462dba88c9beebbe0a21";
const baseUrl = "/";
const sessionId = "1";
const loader = `<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>`;
const errorMessage = "My apologies, I'm not available at the moment. =^.^=";
const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const loadingDelay = 700;
const aiReplyDelay = 1800;

const $document = document;
const $chatbot = $document.querySelector(".chatbot");
const $chatbotMessageWindow = $document.querySelector(
  ".chatbot__message-window"
);
const $chatbotHeader = $document.querySelector(".chatbot__header");
const $chatbotMessages = $document.querySelector(".chatbot__messages");
const $chatbotInput = $document.querySelector(".chatbot__input");
const $chatbotSubmit = $document.querySelector(".chatbot__submit");
const $chatbotIntro = $document.querySelector("#intro");

const setIntro = () => {
  const codigo = localStorage.getItem('codigo');
  if (codigo && codigo != '' && codigo != 'undefined') {
  $chatbotIntro.innerHTML = '¿Quieres conversar?';  
  } else {
    $chatbotIntro.innerHTML = 'Ingresa tu código para continuar';
  }
}

setIntro();


// Vars
// let status_busqueda = false;
let previous_response = '';


document.addEventListener(
  "keypress",
  event => {
    if (event.which == 13) {
      validateMessage();
    }
  },
  false
);

$chatbotHeader.addEventListener(
  "click",
  () => {
    // toggle($chatbot, "chatbot--closed");
    // $chatbotInput.focus();
    var element =                 document.getElementsByClassName("chatbot");
      element[0].style.display = "none";
     document.getElementById("chat-circle").style.display="block";
  },
  false
);

$chatbotSubmit.addEventListener(
  "click",
  () => {
    validateMessage();
  },
  false
);
document.getElementById("chat-circle").addEventListener(
  "click",
  () => {
    var element = document.getElementsByClassName("chatbot");
    element[0].classList.remove("chatbot--closed");
      element[0].style.display = "block";
        $chatbotInput.focus();
    document.getElementById("chat-circle").style.display="none";
    
  }
);

const toggle = (element, klass) => {
  const classes = element.className.match(/\S+/g) || [],
    index = classes.indexOf(klass);
  index >= 0 ? classes.splice(index, 1) : classes.push(klass);
  element.className = classes.join(" ");
};

const userMessage = content => {
  $chatbotMessages.innerHTML += `<li class='is-user animation'>
      <p class='chatbot__message'>
        ${content}
      </p>
      <span class='chatbot__arrow chatbot__arrow--right'></span>
    </li>`;
};

const aiMessage = (content, isLoading = false, delay = 0) => {
  setTimeout(() => {
    removeLoader();
    if (content != null) {
      $chatbotMessages.innerHTML += `<li 
        class='is-ai animation' 
        id='${isLoading ? "is-loading" : ""}'>
          <div class="is-ai__profile-picture">
            <svg class="icon-avatar" viewBox="0 0 32 32">
              <use xlink:href="#avatar" />
            </svg>
          </div>
          <span class='chatbot__arrow chatbot__arrow--left'></span>
          <div class='chatbot__message'>
            ${content}
          </div>
        </li>`;
      scrollDown();
    }
  }, delay);
};

const removeLoader = () => {
  let loadingElem = document.getElementById("is-loading");
  if (loadingElem) {
    $chatbotMessages.removeChild(loadingElem);
  }
};

const escapeScript = unsafe => {
  const safeString = unsafe
    .replace(/</g, " ")
    .replace(/>/g, " ")
    .replace(/&/g, " ")
    .replace(/"/g, " ")
    .replace(/\\/, " ")
    .replace(/\s+/g, " ");
  return safeString.trim();
};

const linkify = inputText => {
  return inputText.replace(urlPattern, `<a href='$1' target='_blank'>$1</a>`);
};

const validateMessage = () => {
  const text = $chatbotInput.value;
  const safeText = text ? escapeScript(text) : "";
  if (safeText.length && safeText !== " ") {
    resetInputField();
    userMessage(safeText);
    send(safeText);
  }
  scrollDown();
  return;
};

const multiChoiceAnswer = text => {
  const decodedText = text.replace(/zzz/g, "'");
  userMessage(decodedText);
  send(decodedText);
  scrollDown();
  return;
};

const processResponse = (res) => {
  removeLoader();
  console.log(res);
  let message = '';

  /* TODO manage TAG */
  switch (res.tag) {
    case 'despedida':
      removeItemLS('codigo')
      removeItemLS('lista_libros')
      message = res.message;
      break;
    case 'parametros':
      message = `${res.message}`;
      for (let i = 0; i < res.data.length; i++) {
        const param = res.data[i];
        const item_param = `<br>${i+1}. ${param}`;
        message += item_param;
      }

      break;
    case 'parametro_input':
      message = res.message;
      break;
    case 'db_response':
      if (res.message.length > 0) {
        message = 'He encontrado esto para ti:<ol>';
        let aux = '';
        switch (res.param) {
          case 'nombreLibro':
            for (let i = 0; i < res.message.length; i++) {
              aux += `<li>`;
              aux += `${res.message[i][1]}, te lo puedo prestar por ${res.message[i][2]} días</li>`;
              message += aux;
            }
            console.log(message);
            break;
          case 'nombreAutor':
            for (let i = 0; i < res.message.length; i++) {
              aux = `<li>`;
              aux += `${res.message[i][2]}, te lo puedo prestar por ${res.message[i][3]} días</li>`;
              message += aux;
            }
            console.log(message);
            break;
          case 'idLibro':
            for (let i = 0; i < res.message.length; i++) {
              aux += `<li>`;
              aux += `${res.message[i][1]}, te lo puedo prestar por ${res.message[i][2]} días</li>`;
              message += aux;
            }
            console.log(message);
            break;
        }
        message += '</ol> ¿Cual deseas prestarte?';

        previous_response = res;
      } else {
        message = 'No he encontrado, lo siento u.u';
      }
      break;
    case 'recomendacion':
      message += 'Te recomiendo este libro: <br>';
      message += `📖  ${res.message.nombreLibro}, por ${res.message.maxDias} días<br>`;
      message += 'Deseas llevarlo? [si/no]';

      break;
    case 'confirmacion_prestamo':
      const aux = setPrestamo2DB();
      aux.then(res_prestamo => {
        if (res_prestamo) {
          message = res.message;
          removeItemLS('lista_libros')
        } else {
          message = 'No tienes libros en tu lista';
        }
        aiMessage(message);
      });
      return null;
    case '':
      // removeItemLS('codigo')
      message = res.message;
      break;
  
    default:
      message = res.message;
      break;
  }
  console.log(message);
  return message;
};

const setResponse = (res, delay = 0) => {
  setTimeout(() => {
    aiMessage(processResponse(res));
  }, delay);
};

const resetInputField = () => {
  $chatbotInput.value = "";
};

const scrollDown = () => {
  const distanceToScroll =
    $chatbotMessageWindow.scrollHeight -
    ($chatbotMessages.lastChild.offsetHeight + 60);
  $chatbotMessageWindow.scrollTop = distanceToScroll;
  return false;
};

const send = (text = "") => {

  const today = new Date();

  let aux_body;
  
  aux_body = {
    data: {
      nuevo: (getItemLS('codigo') == null || getItemLS('codigo') == '' || getItemLS('codigo') == 'undefined') ? true : false,
      content: text,
      tag: previous_response['tag'] == 'parametro_input' ? 'db_search' : 'model',
      param: previous_response['param'] || '',
    }
  }

  if (previous_response.tag === 'db_response') {
    if (Number(text) > 0 && Number(text) <= previous_response.message.length) {
      const book = previous_response.message[Number(text)-1];
      switch (previous_response.param) {
        case 'nombreLibro':
          aux_body.data.content = {
            idLibro: book[0],
            nombreLibro: book[1],
            maxDias: book[2],
          }
          break;
        case 'nombreAutor':
          aux_body.data.content = {
            idLibro: book[1],
            nombreLibro: book[1],
            maxDias: book[3],
          }
          break;
        case 'idLibro':
          aux_body.data.content = {
            idLibro: book[0],
            nombreLibro: book[1],
            maxDias: book[2],
          }
          break;
      
        default:
          break;
      }
      saveBook(aux_body.data.content);
      aux_body.data.content['fecha'] = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      aux_body.data.tag = 'busqueda_seleccion-recomendacion';
      aux_body.data.param = previous_response.param;
    } else {
      aux_body.data.tag = 'busqueda_seleccion-no_choose';
    }
  } else if(previous_response.tag === 'recomendacion') {
    if (text.toUpperCase() == 'SI') {
      saveBook(previous_response.message);
      aiMessage('Ya lo agregué. Puedes seguir buscando');
      previous_response.tag = 'home';
      return
    }
    aiMessage('Avísame si encuentras algo interesante');
    previous_response.tag = 'home';
    return
  }

  console.log(aux_body);

  fetch(`${baseUrl}set`, {
    method: 'POST',
    dataType: 'json',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(aux_body),
  })
    .then(res => res.json())
    .then(res => {
      previous_response = res;
      if (res.cookie && res.cookie != '' && res.cookie != 'undefined'){
        console.warn(res.cookie)
        setItemLS('codigo', res.cookie);
        setItemLS('codigo_prestamo', res.codigo_prestamo);
        setItemLS('lista_libros', JSON.stringify([]))
      }

      setResponse(res, loadingDelay + aiReplyDelay);
    })
    .catch(error => {
      setResponse(errorMessage, loadingDelay + aiReplyDelay);
      resetInputField();
      console.log(error);
    });

  aiMessage(loader, true, loadingDelay);
};

getItemLS = (cname) => {
  return localStorage.getItem(cname);
}
setItemLS = (cname, cvalue) => {
  localStorage.setItem(cname, cvalue);
}
removeItemLS = (cname) => {
  localStorage.removeItem(cname);
}

saveBook = (body) => {
  const bookList = JSON.parse(getItemLS('lista_libros'));
  const auxList = bookList.filter(book => book.idLibro == body.idLibro);
  if (auxList.length == 0) {
    bookList.push(body);
  }
  setItemLS('lista_libros',JSON.stringify(bookList));
}

const getMaxDias = (book_list) => {
  let maxDias = 0;
  for (let i = 0; i < book_list.length; i++) {
    if (book_list[i].maxDias > maxDias) {
      maxDias = book_list[i].maxDias;
    }
  }
  return maxDias;
}

const setPrestamo2DB = async () => {
  const book_list = JSON.parse(getItemLS('lista_libros'));
  const  today = new Date();
  console.log(book_list.length);
  if (book_list.length > 0) {
    
    const aux_body = {
      idPrestamo: getItemLS('codigo_prestamo'),
      idEstudiante: getItemLS('codigo'),
      fecPrestamo: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
      diasPrestamo: getMaxDias(book_list),
      libros: book_list,
    }
    
    let response = await fetch(`${baseUrl}setPrestamo`, {
      method: 'POST',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(aux_body),
    });
    response = await response.json();
    console.log(response);
    return true;
  }
  return false;

}

/* 
  TAGS:
  - parametros
*/