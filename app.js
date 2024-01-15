const socket = io();

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showBookingForms();
      } else {
        alert('Login failed. Please check your credentials.');
      }
    })
    .catch((error) => {
      console.error('Error during login:', error);
    });
}


function register(event) {
  event.preventDefault();
  console.log('Register function called.');
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: newUsername, password: newPassword }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showBookingForms();
      } else {
        alert('Registration failed. Please try again.');
      }
    })
    .catch((error) => {
      console.error('Error during registration:', error);
    });
}

function showBookingForms(event) {
  document.getElementById('loginFormDiv').style.display = 'none';
  document.getElementById('registrationFormDiv').style.display = 'none';
  document.getElementById('bookingForm').style.display = 'block';
  document.getElementById('bookingList').style.display = 'block';
  document.getElementById('updateDeleteForm').style.display = 'block';
}

function createBooking(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const seatNumber = document.getElementById('seatNumber').value;
  const time = document.getElementById('time').value;

  fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ name, seatNumber, time }),
  })
    .then((response) => response.json())
    .then((data) => {
    })
    .catch((error) => {
      console.error('Error creating booking:', error);
    });
}

app.put('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { name, seatNumber, time } = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { name, seatNumber, time },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    io.emit('updatedBooking', updatedBooking);
    res.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


function deleteBooking(event) {
  const bookingId = document.getElementById('bookingId').value;

  fetch(`/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
    })
    .catch((error) => {
      console.error('Error deleting booking:', error);
    });
}

socket.on('newBooking', (booking) => {
  const listItem = document.createElement('li');
  listItem.textContent = `ID: ${booking._id}, Name: ${booking.name}, Seat Number: ${booking.seatNumber}, Time: ${booking.time}`;
  document.getElementById('bookings').appendChild(listItem);
});

socket.on('updatedBooking', (updatedBooking) => {
    const listItem = document.querySelector(`li[data-id="${updatedBooking._id}"]`);
    if (listItem) {
      listItem.textContent = `ID: ${updatedBooking._id}, Name: ${updatedBooking.name}, Seat Number: ${updatedBooking.seatNumber}, Time: ${updatedBooking.time}`;
    }
  });
  
  socket.on('deletedBooking', (deletedBooking) => {
    const listItem = document.querySelector(`li[data-id="${deletedBooking._id}"]`);
    if (listItem) {
      listItem.remove();
    }
  });
