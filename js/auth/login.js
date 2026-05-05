import { supabase } from '../shared/api.js'

const form = document.querySelector('#loginForm')
const message = document.querySelector('#loginMessage')

form.addEventListener('submit', async (event) => {

  event.preventDefault()

  const email = document.querySelector('#email').value.trim()
  const password = document.querySelector('#password').value

  message.textContent = 'Signing in...'

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('LOGIN ERROR:', error)

    message.textContent = error.message

    return
  }

  console.log('LOGIN SUCCESS:', data)

  message.textContent = 'Login successful.'

  window.location.href = './dashboard-manager.html'

})