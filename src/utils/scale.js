//针对不同屏幕缩放
var bodyW = document.body.clientWidth;
var zoom = bodyW / 1920;
const app = document.querySelector("#app");
app.style.transform = 'scale(' + zoom + ')';
window.addEventListener("resize", () => {
  console.log("改变，，")
});
