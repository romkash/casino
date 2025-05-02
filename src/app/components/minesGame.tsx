'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './minesGame.css';
import { toast } from 'react-hot-toast';

type GameResult = {
  bet: number;
  multiplier: number;
  payout: number;
  timestamp: number;
  win: boolean;
};

const INITIAL_BALANCE = 1000;
const MAX_HISTORY = 5;
const GRID_SIZE = 25;

const MinesGame = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState(100);
  const [minesCount, setMinesCount] = useState(3);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [board, setBoard] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashed'>('idle');

  // Загрузка из localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('minesBalance');
    const savedHistory = localStorage.getItem('minesHistory');
    
    if (savedBalance) setBalance(JSON.parse(savedBalance));
    if (savedHistory) setGameHistory(JSON.parse(savedHistory));
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('minesBalance', JSON.stringify(balance));
    localStorage.setItem('minesHistory', JSON.stringify(gameHistory));
  }, [balance, gameHistory]);

  const calculateMultiplier = (openedCells: number) => {
    const remainingCells = GRID_SIZE - minesCount - openedCells;
    return remainingCells > 0 
      ? Number((1.0 / (1 - minesCount / GRID_SIZE) ** openedCells).toFixed(2))
      : 0;
  };

  const generateBoard = () => {
    const mines = new Set<number>();
    while (mines.size < minesCount) {
      mines.add(Math.floor(Math.random() * GRID_SIZE));
    }
    return Array(GRID_SIZE).fill('💎').map((_, i) => mines.has(i) ? '💣' : '💎');
  };

  const startGame = () => {
    if (balance < betAmount) return toast.error('Недостаточно средств!');
    
    setBalance(b => b - betAmount);
    setGameState('playing');
    setBoard(generateBoard());
    setRevealed(Array(GRID_SIZE).fill(false));
    setMultiplier(1.0);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing' || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (board[index] === '💣') {
      endGame();
      return;
    }

    setMultiplier(calculateMultiplier(newRevealed.filter(Boolean).length));
  };

  const cashOut = () => {
    if (gameState !== 'playing') return;
    
    const payout = betAmount * multiplier;
    setGameHistory(prev => [
      {
        bet: betAmount,
        multiplier,
        payout,
        timestamp: Date.now(),
        win: true
      },
      ...prev
    ].slice(0, MAX_HISTORY));
    
    setBalance(b => b + payout);
    setGameState('cashed');
    setRevealed(Array(GRID_SIZE).fill(true));
  };

  const endGame = () => {
    setGameHistory(prev => [
      {
        bet: betAmount,
        multiplier,
        payout: 0,
        timestamp: Date.now(),
        win: false
      },
      ...prev
    ].slice(0, MAX_HISTORY));
    
    setGameState('idle');
    setRevealed(Array(GRID_SIZE).fill(true));
    toast.error('Вы наткнулись на мину!');
  };

  return (
    <div className="mines-container">
      <h1 className="title">CAVEMINES</h1>
      
      <div className="game-layout">
        <div className="history-panel">
          <h3>Последние игры</h3>
          <div className="history-list">
            {gameHistory.map((game, i) => (
              <div 
                key={i}
                className={`history-item ${game.win ? 'win' : 'loss'}`}
              >
                <div className="result-icon">
                  {game.win ? '🏆' : '💥'}
                </div>
                <div className="game-info">
                  <span>Ставка: ${game.bet}</span>
                  <span>Множитель: x{game.multiplier.toFixed(2)}</span>
                  <span>Результат: {game.win ? `+$${game.payout}` : 'Проигрыш'}</span>
                </div>
                <div className="game-time">
                  {new Date(game.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="game-board">
            {board.map((cell, i) => (
              <motion.button
                key={i}
                className={`cell ${revealed[i] ? 'revealed' : ''}`}
                onClick={() => handleCellClick(i)}
                disabled={gameState !== 'playing'}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <AnimatePresence>
                  {revealed[i] && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <div className="controls">
            <div className="input-group">
              <label>Ставка:</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                min="1"
                max="1000"
              />
            </div>
            
            <div className="input-group">
              <label>Ловушки: {minesCount}</label>
              <input
                type="range"
                min="1"
                max="15"
                value={minesCount}
                onChange={(e) => setMinesCount(Number(e.target.value))}
              />
            </div>

            <div className="actions">
              <button
                onClick={startGame}
                disabled={gameState === 'playing'}
                className={`play-button ${gameState === 'playing' ? 'disabled' : ''}`}
              >
                {gameState === 'playing' ? 'Идет игра...' : 'Начать игру'}
              </button>
              
              <button
                onClick={cashOut}
                disabled={gameState !== 'playing'}
                className={`cashout-button ${gameState !== 'playing' ? 'disabled' : ''}`}
              >
                Забрать ${(betAmount * multiplier).toFixed(0)}
              </button>
            </div>
          </div>
        </div>
      </div> 
  );
}
export default MinesGame;