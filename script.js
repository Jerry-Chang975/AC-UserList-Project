const BASE_URL = 'https://user-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/users/';
const dataPanel = document.querySelector('#data-panel');
const searchInput = document.querySelector('#user-search-input');
const pagination = document.querySelector('.pagination');
const colorSwitch = document.querySelector('#colorMode');
let pageCount = 20;
let totalPages;

const userList = [];

function renderUserList(data) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteUser')) || [];
  favoriteList;
  let rawHTML = ``;
  data.forEach((user) => {
    if (colorSwitch.checked) {
      rawHTML += `
      <div class="card m-3 bg-dark text-light" data-user-id="${user.id}">
    `;
    } else {
      rawHTML += `
      <div class="card m-3" data-user-id="${user.id}">
    `;
    }

    if (favoriteList.some((favUser) => favUser.id === user.id)) {
      rawHTML += `
          <i class="heart fa fa-heart fa-lg m-2" data-user-id="${user.id}"></i>
        `;
    } else {
      rawHTML += `
          <i class="heart fa fa-heart-o fa-heart fa-lg m-2" data-user-id="${user.id}"></i>
        `;
    }

    rawHTML += ` 
        <div class="card-body" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${user.id}">
          <img src="${user.avatar}" class="card-img-top" alt="user image" data-user-id="${user.id}">
          <p class="card-title text-center" data-user-id="${user.id}">${user.name} ${user.surname}</p>
        </div>
      </div>
    `;
  });
  if (rawHTML) {
    dataPanel.innerHTML = rawHTML;
  } else {
    dataPanel.innerHTML = '<h1>Not found !</h1>';
  }
}

function renderUserModal(userId) {
  // get elements which need to be updated
  const modalUserTitle = document.querySelector('#modal-user-title');
  const modalUserImg = document.querySelector('#modal-user-img');
  const modalUserDetail = document.querySelector('#modal-user-detail');

  // clear last user detail
  modalUserTitle.textContent = '';
  modalUserImg.src = '';
  modalUserDetail.innerHTML = '';
  // use origin userList (faster)
  const userDetail = userList[userId - 1];
  modalUserTitle.textContent = userDetail.name + ' ' + userDetail.surname;
  modalUserImg.src = userDetail.avatar;
  modalUserDetail.innerHTML = `
    <ul>
        <li>Name: ${userDetail.name} ${userDetail.surname}</li>
        <li>Gender: ${userDetail.gender}</li>
        <li>Age: ${userDetail.age}</li>
        <li>Region: ${userDetail.region}</li>
        <li>Email: ${userDetail.email}</li>
        <li>Birthday: ${userDetail.birthday}</li>
    </ul>
  `;
}

function renderPagination(curPage, dataList) {
  totalPages = Math.ceil(dataList.length / pageCount);
  rawHTML = ``;
  for (let i = 0; i < totalPages; i++) {
    if (i + 1 == curPage) {
      if (colorSwitch.checked) {
        rawHTML += `
        <li class="page-item">
          <a class="page-link active-dark" href="">${i + 1}</a>
        </li>`;
      } else {
        rawHTML += `
        <li class="page-item active">
          <a class="page-link" href="">${i + 1}</a>
        </li>`;
      }
    } else {
      if (colorSwitch.checked) {
        rawHTML += `
        <li class="page-item">
          <a class="page-link dark-bg" href="">${i + 1}</a>
        </li>`;
      } else {
        rawHTML += `
        <li class="page-item">
          <a class="page-link" href="">${i + 1}</a>
        </li>`;
      }
    }
  }
  pagination.innerHTML = rawHTML;
}

function getPageUserData(dataList, page) {
  return dataList.slice((page - 1) * pageCount, page * pageCount);
}

function addToFavorite(userId) {
  // check id is existed or not
  const favoriteList = JSON.parse(localStorage.getItem('favoriteUser')) || [];
  const favUser = userList.find((user) => user.id === userId);
  const userIndexInFav = favoriteList.findIndex(
    (user) => user.id === favUser.id
  );
  if (userIndexInFav === -1) {
    favoriteList.push(favUser);
  } else {
    favoriteList.splice(userIndexInFav, 1);
  }
  localStorage.setItem('favoriteUser', JSON.stringify(favoriteList));
}

function searchUserList(keyword, dataList) {
  return dataList.filter((element) => {
    let userName = element.name + ' ' + element.surname;
    return userName.toLowerCase().includes(keyword.toLowerCase());
  });
}

function userCardEvent() {
  dataPanel.addEventListener('click', (event) => {
    const userId = parseInt(event.target.dataset.userId);
    if (event.target.tagName === 'I') {
      event.target.classList.toggle('fa-heart-o');
      // add to favorite
      event.target.parentElement.classList.add('shock');

      addToFavorite(userId);
    }
    if (userId) {
      renderUserModal(userId);
    }
  });
  dataPanel.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('card')) {
      event.target.classList.remove('shock');
    }
  });
}

function searchEvent() {
  // add search funciton
  // 1. get the keyword from input tag
  // 2. search btn event toggle search function
  // 3. traverse the userList content which matched keyword
  // 4. rerender the page
  searchInput.addEventListener('input', (event) => {
    // get input keywords
    const keyword = event.target.value.trim();
    // filter the users
    const searchList = searchUserList(keyword, userList);
    totalPages = Math.ceil(searchList.length / pageCount);
    // rerender the page
    renderUserList(getPageUserData(searchList, 1));
    renderPagination(1, searchList);
    paginationEvent(searchList);
  });
}

function paginationEvent(dataList) {
  pagination.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      const curPage = parseInt(event.target.textContent);
      renderUserList(getPageUserData(dataList, curPage));
      renderPagination(curPage, dataList);
    }
  });
}

async function main() {
    // color mode
  if (localStorage.getItem('colorMode') === 'dark') {
    colorSwitch.click();
  }

  // get user data
  const res = await axios.get(INDEX_URL);
  userList.push(...res.data.results);

  totalPages = Math.ceil(userList.length / pageCount);
  // render user
  renderUserList(getPageUserData(userList, 1));

  // pagination
  renderPagination(1, userList);
  paginationEvent(userList, totalPages);

  // search event
  searchEvent();

  // add show user event
  userCardEvent();
}

colorSwitch.addEventListener('input', (event) => {
  const nav = document.querySelector('nav.navbar');
  const modal = document.querySelector('#modalColor');
  const cards = document.querySelectorAll('div.card');
  const pages = document.querySelectorAll('a.page-link');
  const body = document.querySelector('body');

  body.classList.toggle('dark-bg');
  nav.classList.toggle('navbar-dark');
  nav.classList.toggle('bg-dark');
  modal.classList.toggle('bg-dark');
  modal.classList.toggle('text-light');
  cards.forEach((card) => {
    card.classList.toggle('bg-dark');
    card.classList.toggle('text-light');
  });
  pages.forEach((page) => {
    page.classList.toggle('dark-bg');
  });

  // save to localStorage
  if (colorSwitch.checked) {
    localStorage.setItem('colorMode', 'dark');
  } else {
    localStorage.setItem('colorMode', 'light');
  }
});

main();
