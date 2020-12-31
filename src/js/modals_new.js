'use strict';

document.addEventListener('DOMContentLoaded', function() {
    let modalOpenButtons = document.querySelectorAll('.js-modalOpen');
    let modalCloseButtons = document.querySelectorAll('.js-modalClose');
    let overlay = document.querySelector('.overlay');

    console.log(modalOpenButtons)

    modalOpenButtons.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            let modalId = this.dataset.modal;
            let modalElem = document.querySelector(`#${modalId}`);
            let modalActive = document.querySelector('.modal');

            modalActive.classList.remove('modal--active');
            modalElem.classList.add('modal--active');
            overlay.classList.add('overlay--active');

        });
    });

    modalCloseButtons.forEach(function(item) {
        item.addEventListener('click', function(e) {
            let parentModal = this.closest('.modal');
            parentModal.classList.remove('modal--active');
            overlay.classList.remove('overlay--active');
        });
    });
});

