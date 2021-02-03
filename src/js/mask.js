let inputDate = document.querySelector(".js-dateMask");
let inputTime = document.querySelector(".js-timeMask");
let inputTel = document.querySelector(".js-telMask");

let dateMask = IMask(inputDate, { mask: Date });
let timeMask = IMask(inputTime, { mask: "00:00" });
let telMask = IMask(inputTel, { mask: "(000) 000-00-00" });
