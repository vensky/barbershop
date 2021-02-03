document.addEventListener("DOMContentLoaded", function () {
  let navButton = document.querySelector(".js-navToggle");
  let navList = document.querySelector(".js-navList");

  navButton.addEventListener("click", function (e) {
    console.log(navButton.classList.contains(".nav__btn--close"));
    if (this.classList.contains("nav__btn--close")) {
      this.classList.remove("nav__btn--close");
      navList.classList.remove("nav__list--show");
    } else {
      this.classList.add("nav__btn--close");
      navList.classList.add("nav__list--show");
    }
  });
});
