"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import "./crach.css";

type GameResult = {
  multiplier: number;
  payout: number;
  timestamp: number;
};

const MIN_BET = 100;
const MAX_BET = 50000;
const HISTORY_SIZE = 5;

const generateCrashPoint = () => {
  const R = Math.random();
  return Math.max(1.1, (1 / (1 - 0.99 * R)) * 0.95);
};

const CrashGame = () => {
  const [balance, setBalance] = useState(5000);
  const [betAmount, setBetAmount] = useState(MIN_BET);
  const [gameState, setGameState] = useState<"idle" | "flying" | "crashed">("idle");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Инициализация из localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem("crashBalance");
    const savedHistory = localStorage.getItem("crashHistory");
    if (savedBalance) setBalance(JSON.parse(savedBalance));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Сохранение состояния
  useEffect(() => {
    localStorage.setItem("crashBalance", JSON.stringify(balance));
    localStorage.setItem("crashHistory", JSON.stringify(history));
  }, [balance, history]);

  const startGame = useCallback(() => {
    if (gameState !== "idle") return;
    if (balance < betAmount) {
      toast.error("Недостаточно средств");
      return;
    }

    const point = generateCrashPoint();
    setCrashPoint(point);
    setGameState("flying");
    setMultiplier(1.0);
    setAnimationProgress(0);
    setBalance(prev => prev - betAmount);
  }, [balance, betAmount, gameState]);

  const handleCashout = useCallback(() => {
    if (gameState === "flying") {
      const winAmount = Math.floor(betAmount * multiplier);
      setBalance(prev => prev + winAmount);
      setGameState("idle");
      
      setHistory(prev => [
        {
          multiplier: Number(multiplier.toFixed(2)),
          payout: winAmount,
          timestamp: Date.now()
        },
        ...prev
      ].slice(0, HISTORY_SIZE));

      toast.success(`Успешно! +$${winAmount}`);
    }
  }, [gameState, betAmount, multiplier]);

  const calculateMultiplier = useCallback((timePassed: number) => {
    const base = 1.05;
    const exponent = timePassed / 1000;
    return 1 + (Math.pow(base, exponent) - 1) * 0.7;
  }, []);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number;

    const animate = () => {
      const timePassed = Date.now() - startTime;
      const newMultiplier = calculateMultiplier(timePassed);
      
      // Обновление позиции ракеты (0% - низ, 100% - верх)
      const progress = (newMultiplier - 1) / (crashPoint - 1);
      setAnimationProgress(Math.min(progress, 1));

      if (newMultiplier >= crashPoint) {
        setMultiplier(crashPoint);
        setGameState("crashed");
        setHistory(prev => [
          {
            multiplier: crashPoint,
            payout: 0,
            timestamp: Date.now()
          },
          ...prev
        ].slice(0, HISTORY_SIZE));
        toast.error("Крушение!");
      } else {
        setMultiplier(newMultiplier);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (gameState === "flying") {
      startTime = Date.now();
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [gameState, crashPoint, calculateMultiplier]);

  return (
    <div className="game-container">
      {/* История игр */}
      <div className="history-panel">
        <h3>История</h3>
        <div className="history-items">
          {history.map((game, i) => (
            <div key={i} className={`history-item ${game.payout > 0 ? 'win' : 'loss'}`}>
              <span>x{game.multiplier.toFixed(2)}</span>
              <span>{game.payout > 0 ? `+$${game.payout}` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Основное игровое поле */}
      <div className="main-game">
        <div className="header">
          <div className="balance-card">
            <span>Баланс</span>
            <div className="amount">${balance.toLocaleString()}</div>
          </div>
          
          <div className="multiplier-display">
            <div className="current">x{multiplier.toFixed(2)}</div>
            <div className="target">Цель: x{crashPoint.toFixed(2)}</div>
          </div>
        </div>

        {/* Игровое поле с ракетой */}
        <div className="game-field">
          <div className="flight-path">
            <div className="markers">
              {[1, 2, 5, 10, 20].map((mark) => (
                <div key={mark} className="marker">x{mark}</div>
              ))}
            </div>

            <motion.div 
              className="rocket"
              animate={{
                y: `${100 - animationProgress * 100}%`, // Исправлено направление движения
                opacity: gameState === "crashed" ? 0 : 1
              }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              🚀
              <div className="flame"/>
            </motion.div>
          </div>
        </div>

        {/* Управление игрой */}
        <div className="game-controls">
          <div className="bet-controls">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => 
                setBetAmount(Math.max(MIN_BET, Math.min(MAX_BET, Number(e.target.value))))
              }
              className="bet-input"
            />
            <div className="quick-buttons">
              <button onClick={() => setBetAmount(prev => Math.max(MIN_BET, prev / 2))}>
                ½
              </button>
              <button onClick={() => setBetAmount(prev => Math.min(MAX_BET, prev * 2))}>
                ×2
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className={`start-button ${gameState !== "idle" ? 'disabled' : ''}`}
              onClick={startGame}
            >
              {gameState === "idle" ? "СТАРТ" : "ЛЕТИТ"}
            </button>
            <button
              className={`cashout-button ${gameState !== "flying" ? 'disabled' : ''}`}
              onClick={handleCashout} // Исправлено на handleCashout
            >
              ЗАБРАТЬ x{multiplier.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;