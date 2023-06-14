const BASE_URL = 'https://user-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/users/';
const dataPanel = document.querySelector('#data-panel');
const searchInput = document.querySelector('#user-search-input');
const searchBtn = document.querySelector('#user-search-btn');
const pagination = document.querySelector('.pagination');
let pageCount = 12;

const userList = [];

function renderUserList(data) {
  const favoriteList = JSON.parse(localStorage.getItem('favoriteUser')) || [];
  favoriteList;
  let rawHTML = ``;
  data.forEach((user) => {
    rawHTML += `
      <div class="card m-3" style="width: 12rem" data-user-id="${user.id}">
    `;
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

function renderPagination(curPage, totalPages) {
  rawHTML = ``;
  for (let i = 0; i < totalPages; i++) {
    if (i + 1 == curPage) {
      rawHTML += `
        <li class="page-item active">
          <a class="page-link" href="">${i + 1}</a>
        </li>`;
    } else {
      rawHTML += `
        <li class="page-item">
          <a class="page-link" href="">${i + 1}</a>
        </li>`;
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
      addToFavorite(userId);
    }
    if (userId) {
      renderUserModal(userId);
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
    const totalPages = Math.ceil(searchList.length / 12);
    // rerender the page
    renderUserList(getPageUserData(searchList, 1));
    renderPagination(1, totalPages);
    paginationEvent(searchList, totalPages);
  });
  
}

function paginationEvent(dataList, totalPages) {
  pagination.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      const curPage = parseInt(event.target.textContent);
      renderUserList(getPageUserData(dataList, curPage));
      renderPagination(curPage, totalPages);
    }
  });
}

axios
  .get(INDEX_URL)
  .then((res) => {
    // get user data
    userList.push(...res.data.results);
    const totalPages = Math.ceil(userList.length / pageCount);
    // render user
    renderUserList(getPageUserData(userList, 1));

    // pagination
    renderPagination(1, totalPages);
    paginationEvent(userList, totalPages);

    // search event
    searchEvent();

    // add show user event
    userCardEvent();
  })
  .catch((err) => {
    console.log(err);
  });
