document.addEventListener('DOMContentLoaded', () => {
  const btnSignOut = document.getElementById('btn-sign-out');

  btnSignOut.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('clicked');
    fetch('/users/logout', { method: 'POST' });
  });
})