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

const processResponse = res => {
  removeLoader();
  console.log(res);
  let message = '';

  /* TODO manage TAG */
  switch (res.tag) {
    case 'despedida':
      removeItemLS('codigo')
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
    case '':
      // removeItemLS('codigo')
      message = res.message;
      break;
  
    default:
      message = res.message;
      break;
  }
  
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

  let aux_body;
  
  
  aux_body = {
    data: {
      nuevo: (getItemLS('codigo') == null || getItemLS('codigo') == '' || getItemLS('codigo') == 'undefined') ? true : false,
      content: text,
      tag: previous_response['tag'] == 'parametro_input' ? 'db_search' : 'model',
      param: previous_response['param'] || '',
    }
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
      }

      setResponse(res, loadingDelay + aiReplyDelay);
    })
    .catch(error => {
      setResponse(errorMessage, loadingDelay + aiReplyDelay);
      resetInputField();
      console.log(error);
    });

  /* fetch(`${baseUrl}&query=${text}&lang=en&sessionId=${sessionId}`, {
    method: "GET",
    dataType: "json",
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json; charset=utf-8",
      Vary: 'Origin',
    }
  })
    .then(response => response.json())
    .then(res => {
      if (res.status < 200 || res.status >= 300) {
        let error = new Error(res.statusText);
        throw error;
      }
      return res;
    })
    .then(res => {
      setResponse(res.result, loadingDelay + aiReplyDelay);
    })
    .catch(error => {
      setResponse(errorMessage, loadingDelay + aiReplyDelay);
      resetInputField();
      console.log(error);
    }); */

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




/* 
  TAGS:
  - parametros
*/