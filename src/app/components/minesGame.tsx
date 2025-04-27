'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './minesGame.css';

const MINE = '💣';
const DIAMOND = '💎';
const INITIAL_BALANCE = 5000;
const MIN_BET = 100;
const MAX_MINES = 15;

const MinesGame = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState(MIN_BET);
  const [board, setBoard] = useState<(typeof MINE | typeof DIAMOND)[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'win' | 'lose'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [minesCount, setMinesCount] = useState(5);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const multiplierFormula = {
    low: 1.15,
    medium: 1.25,
    high: 1.4
  };

  useEffect(() => {
    if (gameState === 'lose') {
      toast.error('Взрыв! Игра окончена', { 
        icon: '💥',
        style: {
          background: '#450a0a',
          color: '#fca5a5',
          border: '1px solid #7f1d1d'
        }
      });
    }
  }, [gameState]);

  const generateBoard = () => {
    const newBoard = Array(25).fill(DIAMOND);
    const minePositions = new Set<number>();
    
    while (minePositions.size < minesCount) {
      minePositions.add(Math.floor(Math.random() * 25));
    }
    
    Array.from(minePositions).forEach(pos => newBoard[pos] = MINE);
    return newBoard;
  };

  const startGame = () => {
    if (balance < betAmount) {
      toast.error('Недостаточно средств', { 
        style: {
          background: '#450a0a',
          color: '#fca5a5'
        }
      });
      return;
    }

    setBalance(prev => prev - betAmount);
    setGameState('playing');
    setMultiplier(1.0);
    setRevealed(Array(25).fill(false));
    setBoard(generateBoard());
  };

  const handleCellClick = (index: number) => {
    if (revealed[index] || gameState !== 'playing') return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (board[index] === MINE) {
      setGameState('lose');
      return;
    }

    const revealedCount = newRevealed.filter(Boolean).length;
    const newMultiplier = multiplier + (multiplier * multiplierFormula[riskLevel]);
    setMultiplier(Number(newMultiplier.toFixed(2)));
  };

  const cashOut = () => {
    if (gameState !== 'playing') return;
    
    const winAmount = Math.floor(betAmount * multiplier);
    setBalance(prev => prev + winAmount);
    setGameState('win');
    
    toast.success(`Вы забрали $${winAmount.toLocaleString()}!`, {
      icon: '🎉',
      style: {
        background: '#052e16',
        color: '#86efac',
        border: '1px solid #14532d'
      }
    });
  };

  const getCellStyle = (index: number) => {
    if (!revealed[index]) return 'cell';
    if (board[index] === DIAMOND) return 'cell revealed diamond';
    return 'cell revealed mine';
  };

  return (
    <div className="mines-game-container">
      <div className="game-controls">
        {/* Заголовок игры */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-title"
        >
          Diamond Mines
        </motion.h1>

        {/* Информация о балансе и ставке */}
        <div className="balance-info">
          <div>
            <p className="label">Баланс</p>
            <p>${balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="label">Ставка</p>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(MIN_BET, Math.min(balance, Number(e.target.value))))}
              className="bet-input"
            />
          </div>
        </div>

        {/* Игровое поле */}
        <div className="game-board">
          {board.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCellClick(index)}
              disabled={revealed[index] || gameState !== 'playing'}
              className={getCellStyle(index)}
            >
              <AnimatePresence>
                {revealed[index] && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="block"
                  >
                    {board[index]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Информация о множителе и выигрыше */}
        <div className="multiplier-info">
          <div>
            <p className="label">Множитель</p>
            <p>x{multiplier.toFixed(2)}</p>
          </div>
          <div>
            <p className="label">Выигрыш</p>
            <p>${(betAmount * multiplier).toFixed(0)}</p>
          </div>
        </div>

        {/* Управление игрой */}
        <div className="controls">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={startGame}
            disabled={balance < betAmount || gameState === 'playing'}
            className="button"
          >
            {gameState === 'playing' ? 'Игра идет...' : 'Новая игра'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={cashOut}
            disabled={gameState !== 'playing'}
            className="button"
          >
            Забрать ${(betAmount * multiplier).toFixed(0)}
          </motion.button>
        </div>

        {/* Настройки */}
        <div className="settings">
          <div className="flex items-center gap-2">
            <span className="label">Количество мин:</span>
            <input
              type="range"
              min="1"
              max={MAX_MINES}
              value={minesCount}
              onChange={(e) => setMinesCount(Number(e.target.value))}
              className="mines-slider"
            />
            <span>{minesCount}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="label">Риск:</span>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as typeof riskLevel)}
              className="risk-select"
            >
              <option value="low">Консервативный (x1.15)</option>
              <option value="medium">Стандартный (x1.25)</option>
              <option value="high">Агрессивный (x1.40)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;