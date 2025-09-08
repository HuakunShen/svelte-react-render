import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
// Demonstration: register user components before mounting
import './custom/register-user-components'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
