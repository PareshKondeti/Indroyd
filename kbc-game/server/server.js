const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Enable CORS
  }
});

// Sample questions
const questions = [
  { question: "What is the capital of France?", options: ["A. Paris", "B. Berlin", "C. Rome", "D. Madrid"], answer: "A" },
  { question: "What is 2 + 2?", options: ["A. 3", "B. 4", "C. 5", "D. 6"], answer: "B" },
  { question: "Which planet is closest to the sun?", options: ["A. Venus", "B. Mars", "C. Mercury", "D. Jupiter"], answer: "C" },
  { question: "What is the largest mammal?", options: ["A. Elephant", "B. Blue Whale", "C. Tiger", "D. Giraffe"], answer: "B" },
  { question: "Who wrote 'Hamlet'?", options: ["A. Tolstoy", "B. Shakespeare", "C. Dickens", "D. Orwell"], answer: "B" }
];

let currentQuestionIndex = 0;

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the current question to the player when they join
  socket.emit('newQuestion', questions[currentQuestionIndex]);

  // Handle player's answer
  socket.on('submitAnswer', ({ playerName, answer }) => {
    const correctAnswer = questions[currentQuestionIndex].answer;
    if (answer === correctAnswer) {
      io.emit('correctAnswer', { playerName, answer });
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        io.emit('newQuestion', questions[currentQuestionIndex]);
      } else {
        io.emit('endGame');
      }
    } else {
      socket.emit('wrongAnswer');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
