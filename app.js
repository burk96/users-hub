const BASE_URL = "https://jsonplace-univclone.herokuapp.com";

function renderUser(user) {
  const name = user.name;
  const username = user.username;
  const email = user.email;
  const companyName = user.company.name;
  const companyCreed = user.company.catchPhrase;

  let element = $(`<div class="user-card">
    <header>
      <h2>${name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${email}</p>
      <p><b>Works for:</b> ${companyName}</p>
      <p><b>Company creed:</b> ${companyCreed}</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${username}</button>
      <button class="load-albums">ALBUMS BY ${username}</button>
    </footer>
  </div>`);

  element.data("user", user);

  return element;
}

function renderUserList(userList) {
  $("#user-list").empty();

  userList.forEach(function (user) {
    const element = renderUser(user);
    $("#user-list").append(element);
  });
}

function fetchUsers() {
  return fetch(`${BASE_URL}/users`)
    .then(function (response) {
      // call json on the response, and return the result
      return response.json();
    })
    .catch(function (error) {
      // use console.error to log out any error
      console.error;
    });
}

function bootstrap() {
  fetchUsers().then(function (data) {
    renderUserList(data);
  });
}

$("#user-list").on("click", ".user-card .load-posts", function () {
  // load posts for this user
  let parent = $(this).closest(".user-card");
  console.log(parent.data("user"));
  // render posts for this user
});

$("#user-list").on("click", ".user-card .load-albums", function () {
  // load albums for this user
  let parent = $(this).closest(".user-card");
  console.log(parent.data("user"));
  // render albums for this user
});

bootstrap();
