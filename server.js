const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let rooms = [];
let bookings = [];

// Utility functions
const findRoomById = (id) => rooms.find(room => room.id === id);
const isRoomBooked = (roomId, date, startTime, endTime) => {
  return bookings.some(booking => booking.roomId === roomId && booking.date === date && 
    ((startTime >= booking.startTime && startTime < booking.endTime) || 
    (endTime > booking.startTime && endTime <= booking.endTime)));
};

// 1. Creating a Room
app.post('/rooms', (req, res) => {
  const { id, seatsAvailable, amenities, pricePerHour } = req.body;
  if (findRoomById(id)) {
    return res.status(400).send('Room with this ID already exists.');
  }
  const newRoom = { id, seatsAvailable, amenities, pricePerHour };
  rooms.push(newRoom);
  res.status(201).send(newRoom);
});

// 2. Booking a Room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  if (!findRoomById(roomId)) {
    return res.status(404).send('Room not found.');
  }
  if (isRoomBooked(roomId, date, startTime, endTime)) {
    return res.status(400).send('Room is already booked for the selected time.');
  }
  const newBooking = { id: bookings.length + 1, customerName, date, startTime, endTime, roomId };
  bookings.push(newBooking);
  res.status(201).send(newBooking);
});

// 3. List all Rooms with Booked Data
app.get('/rooms/bookings', (req, res) => {
  const result = rooms.map(room => {
    const roomBookings = bookings.filter(booking => booking.roomId === room.id);
    return { ...room, bookings: roomBookings };
  });
  res.send(result);
});

// 4. List all Customers with Booked Data
app.get('/customers/bookings', (req, res) => {
  const customers = {};
  bookings.forEach(booking => {
    if (!customers[booking.customerName]) {
      customers[booking.customerName] = [];
    }
    customers[booking.customerName].push(booking);
  });
  res.send(customers);
});

// 5. List how many times a Customer has booked the room
app.get('/customers/:customerName/bookings', (req, res) => {
  const customerName = req.params.customerName;
  const customerBookings = bookings.filter(booking => booking.customerName === customerName);
  res.send(customerBookings);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
