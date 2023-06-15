const favDataPanel = document.querySelector('#data-panel');
const pagination = document.querySelector('.pagination');
const colorSwitch = document.querySelector('#colorMode');

const pageCount = 12;
const favUsers = [];
let totalPages;
function renderUserList(data) {
  let rawHTML = ``;
  data.forEach((user) => {
    if (colorSwitch.checked) {
      rawHTML += `<div class="card m-3 bg-dark text-light" data-user-id="${user.id}">`;
    } else {
      rawHTML += `<div class="card m-3" data-user-id="${user.id}">`;
    }
    rawHTML += `
        <i class="heart fa fa-heart fa-lg m-2" data-user-id="${user.id}"></i>
        <div class="card-body" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${user.id}">
          <img src="${user.avatar}" class="card-img-top" alt="user image" data-user-id="${user.id}">
          <p class="card-title text-center" data-user-id="${user.id}">${user.name} ${user.surname}</p>
        </div>
      </div>
    `;
  });
  if (rawHTML) {
    favDataPanel.innerHTML = rawHTML;
  } else {
    favDataPanel.innerHTML = '<h1>You do not have favorite User~~</h1>';
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
  const userDetail = favUsers.find((user) => user.id === userId);
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

function renderPagination(curPage) {
  totalPages = Math.ceil(favUsers.length / pageCount);
  rawHTML = ``;
  for (let i = 0; i < totalPages; i++) {
    if (i + 1 == curPage) {
      if (colorSwitch.checked) {
        rawHTML += `
        <li class="page-item active">
          <a class="page-link" href="">${i + 1}</a>
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

function getFavoriteUser() {
  favUsers.push(...JSON.parse(localStorage.getItem('favoriteUser')));
}

function getPageUserData(dataList, page) {
  return dataList.slice((page - 1) * pageCount, page * pageCount);
}

function removeFromFavorite(userId) {
  // check id is existed or not
  const userIndexInFav = favUsers.findIndex((user) => user.id === userId);
  if (userIndexInFav !== -1) {
    favUsers.splice(userIndexInFav, 1);
  }
  localStorage.setItem('favoriteUser', JSON.stringify(favUsers));
  // rerender
  setTimeout(() => {
    let curPage = parseInt(
      document.querySelector('.page-item.active').children[0].textContent
    );
    let curUsers = getPageUserData(favUsers, curPage);
    if (!curUsers.length) {
      curPage -= 1;
      curUsers = getPageUserData(favUsers, curPage);
    }
    renderUserList(curUsers);
    renderPagination(curPage);
  }, 1000);
}

function userCardEvent() {
  favDataPanel.addEventListener('click', (event) => {
    const userId = parseInt(event.target.dataset.userId);
    if (event.target.tagName === 'I') {
      event.target.classList.toggle('fa-heart-o');
      event.target.parentElement.classList.add('fade-out');

      removeFromFavorite(userId);
    } else if (userId) {
      renderUserModal(userId);
    }
  });
}

function paginationEvent(dataList) {
  pagination.addEventListener('click', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      const curPage = parseInt(event.target.textContent);
      renderUserList(getPageUserData(dataList, curPage));
      renderPagination(curPage);
    }
  });
}

function main() {
  if (localStorage.getItem('colorMode') === 'dark') {
    colorSwitch.click();
  }
  getFavoriteUser();
  renderUserList(getPageUserData(favUsers, 1));
  userCardEvent();
  totalPages = Math.ceil(favUsers.length / pageCount);
  renderPagination(1, totalPages);
  paginationEvent(favUsers, totalPages);
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
