import mapping from "./mappings/index.js"

class Gamepad {
  static instance = null
  static engine = null
  static mapping = mapping
  static stickDeadzone = 0.1

  static _buttons = {}
  static _sticks = {}

  constructor() {
    Gamepad.buttons = {}
    Gamepad.sticks = {}

    window.addEventListener("gamepadconnected", this.connect)
    window.addEventListener("ongamepaddisconnected", this.disconnect)
  }

  static get buttons() { return Gamepad._buttons }
  static set buttons(value) { Gamepad._buttons = new Proxy(value || {}, Gamepad.buttonsHandler) }

  static get sticks() { return Gamepad._sticks }
  static set sticks(value) { Gamepad._sticks = new Proxy(value || {}, Gamepad.sticksHandler) }

  connect = (event) => {
    Gamepad.instance = navigator.getGamepads()[event.gamepad.index]
    this.awake()
  }

  disconnect = () => {
    this.stop()
    Gamepad.instance = null
  }

  awake = () => {
    this.resetButtons()
    this.resetSticks()
    this.update()
  }

  update = () => {
    Gamepad.instance = navigator?.getGamepads()[Gamepad.instance.index]

    Gamepad.instance.buttons.forEach((button, index) => {
      const key = Gamepad.mapping[Gamepad.instance.mapping]["buttons"][index] || index
      Gamepad.buttons[key] = button.pressed
    })

    Gamepad.instance.axes.forEach((value, index) => {
      if (Math.abs(value) < Gamepad.stickDeadzone) value = 0
      Gamepad.sticks[Gamepad.mapping[Gamepad.instance.mapping]["sticks"][index]] = value
    })

    Gamepad.engine = requestAnimationFrame(this.update)
  }

  stop = () => {
    cancelAnimationFrame(Gamepad.engine)
    Gamepad.engine = null
  }

  resetButtons = () => {
    Object.values(Gamepad.mapping[Gamepad.instance.mapping].buttons).forEach((name) => { Gamepad.buttons[name] = false })
  }

  resetSticks = () => {
    Object.values(Gamepad.mapping[Gamepad.instance.mapping].sticks).forEach((name) => { Gamepad.sticks[name] = 0 })
  }

  static buttonsHandler = {
    set: (obj, prop, value) => {
      const oldValue = obj[prop]
      if (value === false && oldValue === value) return true
      obj[prop] = value

      if (oldValue !== undefined) {
        const event = new CustomEvent("gamepad:update", {
          detail: {
            buttons: { ...Gamepad.buttons },
            sticks: { ...Gamepad.sticks }
          }
        })
        window.dispatchEvent(event)
      }

      return true
    }
  }

  static sticksHandler = {
    set: (obj, prop, value) => {
      const oldValue = obj[prop]
      if (oldValue === 0 && oldValue === value) return true
      obj[prop] = value

      if (oldValue !== undefined && oldValue != 0) {
        const event = new CustomEvent("gamepad:update", {
          detail: {
            buttons: { ...Gamepad.buttons },
            sticks: { ...Gamepad.sticks }
          }
        })
        window.dispatchEvent(event)
      }

      return true
    }
  }
}

export default new Gamepad()
