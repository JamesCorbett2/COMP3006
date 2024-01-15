document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('Registration form submitted.');
    register();
  });
  
  document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('Login submitted.');
    login();
  });
  
  document.getElementById('bookingForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    createbooking();
  });
  