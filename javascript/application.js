import Gamepad from "./@gamepad/index.js"

window.addEventListener("gamepad:update", (event) => {
  Object.entries(event.detail.buttons).forEach(button => {
    const [key, value] = button
    const element = document.querySelector(`[data-gamepad-button="${key}"]`)

    if (element) element.classList.toggle("active", value)
  })
})
