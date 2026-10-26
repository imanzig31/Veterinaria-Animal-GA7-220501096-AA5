const form = document.querySelector('#auth-form');
const nameField = document.querySelector('#name-field');
const nameInput = document.querySelector('#nombre');
const emailInput = document.querySelector('#correo');
const passwordInput = document.querySelector('#contraseña');
const notice = document.querySelector('#notice');
const loginTab = document.querySelector('#login-tab');
const registerTab = document.querySelector('#register-tab');
const submitButton = document.querySelector('#submit-button');
const loggedIn = document.querySelector('#logged-in');
let mode = 'login';

// Actualiza textos y campos según el modo elegido por la persona usuaria.
function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === 'register';
  nameField.hidden = !registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? 'new-password' : 'current-password';
  loginTab.classList.toggle('active', !registering);
  registerTab.classList.toggle('active', registering);
  loginTab.setAttribute('aria-selected', String(!registering));
  registerTab.setAttribute('aria-selected', String(registering));
  document.querySelector('#form-eyebrow').textContent = registering ? 'ÚNETE A HUELLITAS' : 'BIENVENIDO DE VUELTA';
  document.querySelector('#form-title').textContent = registering ? 'Crea tu cuenta' : 'Qué gusto verte';
  document.querySelector('#form-subtitle').textContent = registering
    ? 'Regístrate para acceder al espacio de la clínica.' : 'Ingresa tus datos para continuar.';
  submitButton.innerHTML = registering ? 'Crear cuenta <span aria-hidden="true">→</span>' : 'Iniciar sesión <span aria-hidden="true">→</span>';
  hideNotice();
}

function showNotice(message, type) {
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}
function hideNotice() { notice.hidden = true; }

// Muestra el mensaje de la API si viene; de lo contrario presenta un error de red amigable.
async function readResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.mensaje || 'No se pudo completar la solicitud.');
  return payload;
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));
document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const visible = passwordInput.type === 'text';
  passwordInput.type = visible ? 'password' : 'text';
  event.currentTarget.textContent = visible ? 'Mostrar' : 'Ocultar';
  event.currentTarget.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideNotice();
  submitButton.disabled = true;
  submitButton.textContent = mode === 'register' ? 'Creando cuenta…' : 'Validando…';
  try {
    const registering = mode === 'register';
    const endpoint = registering ? '/api/auth/registro' : '/api/auth/login';
    const body = { correo: emailInput.value.trim(), contraseña: passwordInput.value };
    if (registering) body.nombre = nameInput.value.trim();
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(readResponse);

    if (registering) {
      showNotice('Tu cuenta se creó correctamente. Ya puedes iniciar sesión.', 'success');
      form.reset();
      setMode('login');
      showNotice('Tu cuenta se creó correctamente. Ya puedes iniciar sesión.', 'success');
    } else {
      // Guardamos el JWT para validar la sesión en el endpoint protegido.
      localStorage.setItem('huellitas_token', result.token);
      showNotice(result.mensaje, 'success');
      document.querySelector('#user-name').textContent = result.usuario.nombre;
      document.querySelector('#user-email').textContent = result.usuario.correo;
      document.querySelector('#avatar').textContent = result.usuario.nombre.trim().charAt(0).toUpperCase();
      loggedIn.hidden = false;
      form.hidden = true;
    }
  } catch (error) {
    showNotice(error.message || 'No pudimos conectar con el servidor. Intenta nuevamente.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = mode === 'register' ? 'Crear cuenta <span aria-hidden="true">→</span>' : 'Iniciar sesión <span aria-hidden="true">→</span>';
  }
});

document.querySelector('#logout-button').addEventListener('click', () => {
  // El JWT se elimina del navegador al cerrar la sesión.
  localStorage.removeItem('huellitas_token');
  loggedIn.hidden = true;
  form.hidden = false;
  form.reset();
  setMode('login');
  showNotice('Sesión cerrada correctamente.', 'success');
});
