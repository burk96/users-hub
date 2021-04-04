const BASE_URL = "https://jsonplace-univclone.herokuapp.com";

// pagination snippet
//_page=1&_limit=20

function renderUser(user) {
  const element = $(`<div class="user-card">
    <header>
      <h2>${user.name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${user.email}</p>
      <p><b>Works for:</b> ${user.company.name}</p>
      <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${user.username}</button>
      <button class="load-albums">ALBUMS BY ${user.username}</button>
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

/* render a single album */
function renderAlbum(album) {
  const element = $(`<div class="album-card">
    <header>
      <h3>${album.title}, by ${album.user.username} </h3>
    </header>
    <section class="photo-list"></section>
  </div>`);

  const photoList = element.find(".photo-list");

  album.photos.forEach(function (photo) {
    const photoElement = renderPhoto(photo);
    photoList.append(photoElement);
  });

  return element;
}

/* render a single photo */
function renderPhoto(photo) {
  return `<div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}">
      <figure>${photo.title}</figure>
    </a>
  </div>`;
}

/* render an array of albums */
function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");
  $("#album-list").empty().addClass("active");

  albumList.forEach(function (album) {
    const albumElement = renderAlbum(album);
    $("#album-list").append(albumElement);
  });
}

function renderPost(post) {
  const element = $(`<div class="post-card">
    <header>
      <h3>${post.title}</h3>
      <h3>--- ${post.user.username}</h3>
    </header>
    <p>${post.body}</p>
    <footer>
      <div class="comment-list"></div>
      <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
    </footer>
  </div>`);

  element.data("post", post);

  return element;
}

function renderPostList(postList) {
  $("#app section.active").removeClass("active");

  const postListElement = $("#post-list");
  postListElement.empty();
  postListElement.addClass("active");

  postList.forEach(function (post) {
    postListElement.append(renderPost(post));
  });
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

function setCommentsOnPost(post) {
  // if we already have comments, don't fetch them again
  if (post.comments) {
    // #1: Something goes here
    return Promise.reject(null);
  }

  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

function setAlbumListOnUser(user) {
  if (user.albumList) {
    return Promise.resolve(user);
  }

  return fetchUserAlbumList(user.id).then(function (albumList) {
    user.albumList = albumList;
    return user;
  });
}

function setPostsOnUser(user) {
  if (user.posts) {
    return Promise.resolve(user);
  }

  return fetchUserPosts(user.id).then(function (posts) {
    user.posts = posts;
    return user;
  });
}

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      // call json on the response, and return the result
      return response.json();
    })
    .catch(function (error) {
      // use console.error to log out any error
      console.error(error);
    });
}

function fetchUsers() {
  return fetchData(`${BASE_URL}/users`);
}

/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
  return fetchData(
    `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
  );
}

function bootstrap() {
  fetchUsers().then(function (data) {
    renderUserList(data);
  });
}

$("#user-list").on("click", ".user-card .load-posts", function () {
  const user = $(this).closest(".user-card").data("user");

  setPostsOnUser(user)
    .then(function (user) {
      renderPostList(user.posts);
    })
    .catch(console.error);
});

$("#user-list").on("click", ".user-card .load-albums", function () {
  const user = $(this).closest(".user-card").data("user");

  setAlbumListOnUser(user)
    .then(function (user) {
      renderAlbumList(user.albumList);
    })
    .catch(console.error);
});

$("#post-list").on("click", ".post-card .toggle-comments", function () {
  const postCardElement = $(this).closest(".post-card");
  const post = postCardElement.data("post");
  const commentList = postCardElement.find(".comment-list");

  setCommentsOnPost(post)
    .then(function (post) {
      commentList.empty();
      post.comments.forEach(function (comment) {
        commentList.prepend(`<h3>${comment.body} --- ${comment.email}</h3>`);
      });

      toggleComments(postCardElement);
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});

bootstrap();
