!(function($) {

    'use strict';

    window.Modals = (function () { // Объявление глобальной перемнной Modals
        Modals.prototype.bindEvents = function () {
            var that = this;

            $('html').on('click', '.js-modalClose', { modal: this }, this.hide);
            $('html').on('click', '.js-modalOpen', { modal: this }, this.show);
            $('html').on('click touchstart', '.js-overlay', { modal: this }, this.hide);

            $(document).on('keyup', function (e) {
                if (e.keyCode === that.escKey) {
                    that.hide({ data: { modal: that }});
                }
            });
        };

        Modals.prototype.cacheElements = function () {
            this.$allPopups = $('.js-modal');
            this.$allPopupsWrapper = $('.js-modals');
        };

        Modals.prototype.show = function (e) {
            e.preventDefault();

            var that = e.data.modal,
                idModal = $(this).data('modal');

            if (idModal) {
                that.hideAll();

                that.$popupBlock = $('#' + idModal);
                that._show();
            }
        };

        Modals.prototype.forceShow = function (idModal, callback) {
            this.$popupBlock = $('#' + idModal);
            if (this.$popupBlock.length !== 0) {
                this._show();

                if (typeof callback !== 'undefined' && typeof callback === 'function') {
                    callback();
                }
            }
        };

        Modals.prototype.hide = function (e) {
            var that = e.data.modal,
                idModal = $(this).data('modal');

            if ($('#' + idModal).length !== 0) {
                that.$popupBlock = $('#' + idModal);
            }

            if (typeof that.$popupBlock !== 'undefined') {
                $('.js-emptyOnModalClose').html('');
                that._hide();
            }
        };

        Modals.prototype.hideAll = function () {
            this.$allPopupsWrapper.removeClass('isActive');
            this.$allPopups.removeClass('isActive');

            // $('.is-overflowed').removeClass('is-overflowed');
            $('.wrapper').removeClass('isModalOpened');
        };

        Modals.prototype.forceHide = function (idModal, callback) {
            this.$popupBlock = $('#' + idModal);
            if (this.$popupBlock.length !== 0) {
                this._hide();

                if (typeof callback !== 'undefined' && typeof callback === 'function') {
                    callback();
                }
            } else {
                return false;
            }
        };

        Modals.prototype._show = function () {
            // if (window.innerWidth >= 980) {
            //     $('body').addClass('is-overflowed');
            // } else {
            //     $('html, body').addClass('is-overflowed');
            // }

            $('.wrapper').addClass('isModalOpened');
            this.$allPopupsWrapper.addClass('isActive');
            this.$popupBlock.addClass('isActive');
        };

        Modals.prototype._hide = function () {
            var that = this;

            this.$popupBlock.removeClass('isActive');
            // $('.is-overflowed').removeClass('is-overflowed');

            $('.wrapper').removeClass('isModalOpened');
            this.$allPopupsWrapper.removeClass('isActive');
        };

        function Modals() {
            this.escKey = 27;
            this.cacheElements();
            this.bindEvents();
        }

        return Modals;
    })();

}(window.jQuery));
