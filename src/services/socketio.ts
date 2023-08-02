import socketIOClient from 'socket.io-client';

const socket = socketIOClient("localhost:4000");
// const socket = socketIOClient("https://barcos-backend.onrender.com");

export default socket;
