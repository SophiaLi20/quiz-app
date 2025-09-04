import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';

// In your React component, replace the hardcoded array:
useEffect(() => {
  const loadQuestions = async () => {
    try {
      const response = await fetch('/questions.json');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to hardcoded questions
      setQuestions(hardcodedQuestions);
    }
  };
  
  loadQuestions();
}, []);

const QuizApp = () => {
  // State management
  const [questions] = useState(questionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentSelection, setCurrentSelection] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleNextQuestion();
    }
  }, [timeLeft, timerActive, quizCompleted]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(30);
    setTimerActive(true);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (optionIndex) => {
    setCurrentSelection(optionIndex);
    setTimerActive(false);
  };

  const handleNextQuestion = () => {
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestionIndex]: currentSelection
    };
    setSelectedAnswers(updatedAnswers);

    if (currentQuestionIndex === totalQuestions - 1) {
      // Calculate final score
      let finalScore = 0;
      questions.forEach((question, index) => {
        if (updatedAnswers[index] === question.correctAnswer) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentSelection(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentSelection(selectedAnswers[currentQuestionIndex - 1] || null);
      setTimerActive(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setCurrentSelection(null);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(30);
    setTimerActive(true);
  };

  const getScoreMessage = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return { message: "Excellent! 🎉", color: "text-green-600" };
    if (percentage >= 60) return { message: "Good Job! 👏", color: "text-blue-600" };
    if (percentage >= 40) return { message: "Keep Trying! 💪", color: "text-yellow-600" };
    return { message: "Practice More! 📚", color: "text-red-600" };
  };

  // Results Page
  if (quizCompleted) {
    const scoreMessage = getScoreMessage();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {score}/{totalQuestions}
              </div>
              <p className="text-2xl text-gray-600 mb-2">
                {Math.round((score / totalQuestions) * 100)}% Score
              </p>
              <p className={`text-xl font-semibold ${scoreMessage.color}`}>
                {scoreMessage.message}
              </p>
            </div>

            {/* Answer Review */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Answer Review</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const wasAnswered = userAnswer !== null && userAnswer !== undefined;

                  return (
                    <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-3">
                            Q{index + 1}: {question.question}
                          </h3>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => {
                              let optionClass = "p-2 rounded text-sm ";
                              
                              if (optionIndex === question.correctAnswer) {
                                optionClass += "bg-green-100 text-green-800 font-medium";
                              } else if (optionIndex === userAnswer && !isCorrect) {
                                optionClass += "bg-red-100 text-red-800";
                              } else {
                                optionClass += "bg-gray-100 text-gray-700";
                              }

                              return (
                                <div key={optionIndex} className={optionClass}>
                                  <span className="font-medium mr-2">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  {option}
                                  {optionIndex === question.correctAnswer && (
                                    <span className="ml-2 text-green-600">✓</span>
                                  )}
                                  {optionIndex === userAnswer && !isCorrect && (
                                    <span className="ml-2 text-red-600">✗</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {!wasAnswered && (
                            <p className="text-gray-500 italic text-sm mt-2">No answer selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restart Button */}
            <div className="text-center">
              <button
                onClick={handleRestartQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Take Quiz Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up">
          
          {/* Header with Progress */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Quiz Challenge</h1>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white ${
                timeLeft > 10 ? 'text-green-600' : timeLeft > 5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{timeLeft}s</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-indigo-500 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-5 text-left border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                      currentSelection === index
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                        currentSelection === index 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-lg">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md transform hover:scale-105'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="text-center">
                {currentSelection === null && (
                  <p className="text-gray-500 text-sm">Please select an answer to continue</p>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentSelection === null}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                  currentSelection === null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform hover:scale-105'
                }`}
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
