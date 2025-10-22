import "./@gamepad/index.js"

window.addEventListener("gamepad:update", (event) => {
  Object.entries(event.detail.buttons).forEach(button => {
    let [key, value] = button

    const element = document.querySelector(`[data-gamepad-button="${key}"]`)
    if (element) element.classList.toggle("active", value)
  })

  Object.entries(event.detail.sticks).forEach(stick => {
    const [key, value] = stick
    const position = key.slice(0, -1)
    const axe = key.slice(-1).toLowerCase()

    const element = document.querySelector(`[data-gamepad-stick="${position}"]`)
    const intensity = -50 + 75 * value

    if (element) {
      element.style.setProperty(`--${axe}`, `${intensity}%`)
      element.classList.toggle("active", element.style.getPropertyValue(`--x`) != "-50%" || element.style.getPropertyValue(`--y`) != "-50%")
    }
  })
})
