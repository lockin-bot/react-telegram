/// <reference types="@react-telegram/core" />
import React, { useState } from 'react';
import { MtcuteAdapter } from '@react-telegram/mtcute-adapter';

// Quiz questions
const questions = [
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What is the capital of France?", answer: "paris" },
  { question: "What color is the sky?", answer: "blue" }
];

const QuizBot: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [waitingForAnswer, setWaitingForAnswer] = useState(true);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleAnswer = (text: string) => {
    if (!waitingForAnswer || gameOver) return;
    
    setWaitingForAnswer(false);
    setLastAnswer(text);
    
    const isCorrect = text.toLowerCase().trim() === questions[currentQuestion]?.answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setWaitingForAnswer(true);
        setLastAnswer(null);
      } else {
        setGameOver(true);
      }
    }, 100);
  };

  const restart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setWaitingForAnswer(true);
    setLastAnswer(null);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <>
        <b>🎉 Quiz Complete!</b>
        <br />
        <br />
        Your final score: <b>{score}/{questions.length}</b>
        <br />
        <br />
        {score === questions.length ? 
          "Perfect score! Well done! 🌟" : 
          score >= questions.length / 2 ?
            "Good job! 👍" :
            "Better luck next time! 📚"
        }
        <br />
        <br />
        <row>
          <button onClick={restart}>Play Again</button>
        </row>
      </>
    );
  }

  const currentQ = questions[currentQuestion];
  
  return (
    <>
      <b>Quiz Bot 🤖</b>
      <br />
      Question {currentQuestion + 1} of {questions.length}
      <br />
      Score: {score}/{currentQuestion}
      <br />
      <br />
      
      <b>{currentQ?.question}</b>
      <br />
      <br />
      
      {lastAnswer !== null && (
        <>
          Your answer: <code>{lastAnswer}</code>
          <br />
          {lastAnswer.toLowerCase().trim() === currentQ?.answer ? 
            "✅ Correct!" : 
            `❌ Wrong! The answer was: ${currentQ?.answer}`
          }
          <br />
          <br />
          {currentQuestion < questions.length - 1 && "Next question coming up..."}
          <br />
        </>
      )}
      
      {waitingForAnswer && !lastAnswer && (
        <>
          <i>Reply to this message with your answer!</i>
          <br />
        </>
      )}
      
      {/* Input handler for answers - auto-delete for cleaner chat */}
      {waitingForAnswer && <input onSubmit={handleAnswer} autoDelete />}
    </>
  );
};

// Set up the bot
async function main() {
  const adapter = new MtcuteAdapter({
    apiId: parseInt(process.env.API_ID!),
    apiHash: process.env.API_HASH!,
    botToken: process.env.BOT_TOKEN!
  });

  // Register the quiz command
  adapter.onCommand('quiz', () => <QuizBot />);

  // Start the bot
  await adapter.start(process.env.BOT_TOKEN!);
  console.log('Quiz bot is running! Send /quiz to start.');
}

main().catch(console.error);