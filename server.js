const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const assert = require('assert');
const config = require('./config'); 
const Booking = require('./models/booking'); 
const User = require('./models/user');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());


const MONGODB_URI = config.MONGODB_URI;


mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});




app.use(express.static(__dirname));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = new User({ username, password });
    const savedUser = await newUser.save();
    res.status(201).json({ success: true, user: savedUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, error: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByCredentials(username, password);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



app.post('/api/bookings', async (req, res) => {
  const { name, seatNumber, time } = req.body;

  

  const newBooking = new Booking({ name, seatNumber, time });

  try {
    const savedBooking = await newBooking.save();
    io.emit('newBooking', savedBooking);
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/api/bookings', (req, res) => {
  Booking.find({}, (err, bookings) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).send('Internal Server Error');
    }

    res.json(bookings);
  });
});


app.put('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  const { name, seatNumber, time } = req.body;

  Booking.findByIdAndUpdate(
    bookingId,
    { name, seatNumber, time },
    { new: true },
    (err, updatedBooking) => {
      if (err) {
        console.error('Error updating booking:', err);
        return res.status(500).send('Internal Server Error');
      }

      io.emit('updatedBooking', updatedBooking);
      res.json(updatedBooking);
    }
  );
});


app.delete('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    io.emit('deletedBooking', deletedBooking);
    res.json({ success: true, booking: deletedBooking });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });


  socket.on('newBooking', (newBooking) => {
    console.log('New booking:', newBooking);
  });

 
  socket.on('updatedBooking', (updatedBooking) => {
    console.log('Updated booking:', updatedBooking);
  });

  
  socket.on('deletedBooking', (deletedBooking) => {
    console.log('Deleted booking:', deletedBooking);
  });
});
