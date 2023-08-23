document.addEventListener('DOMContentLoaded', () => {
  const btnSignOut = document.getElementById('btn-sign-out');
  const btnsEdit = document.getElementsByClassName('btn-edit');
  const btnsDelete = document.getElementsByClassName('btn-delete');

  btnSignOut.addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/users/logout', { method: 'POST' }).then(() => {
      window.location = '/';
    });
  });

  for (let i = 0; i < btnsEdit.length; i++) {
    btnsEdit[i].addEventListener('click', (e) => {
      e.preventDefault();
      const dataId = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');

      window.location = `/messages/${dataId}/edit`;
    });
  }

  for (let k = 0; k < btnsDelete.length; k++) {
    btnsDelete[k].addEventListener('click', (e) => {
      e.preventDefault();
      const dataId = e.currentTarget.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');

      fetch(`/messages/${dataId}`, {
        method: 'DELETE'
      }).then(response => {
        return response.json();
      }).then(data => {
        if (data.message === 'success') {
          window.location = '/';
        } else {
          console.log(data);
        }
      })
    });
  }
})