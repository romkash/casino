"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import "./crach.css";

const INITIAL_BALANCE = 5000;
const MIN_BET = 100;
const MAX_MULTIPLIER = 10.0;
const GAME_SPEED = 50;

const SpaceCrash = () => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [betAmount, setBetAmount] = useState(MIN_BET);
  const [gameState, setGameState] = useState("idle");
  const [height, setHeight] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashout, setCashout] = useState(false);

  const getMultiplier = (height) => Math.min(1 + height / 150, MAX_MULTIPLIER);

  const startGame = () => {
    if (balance < betAmount) {
      toast.error("Недостаточно средств", {
        style: { background: "#450a0a", color: "#fca5a5" },
      });
      return;
    }

    setBalance((prev) => prev - betAmount);
    setGameState("flying");
    setHeight(0);
    setMultiplier(1.0);
    setCashout(false);
    setCrashPoint(Math.random() * 600 + 200);
  };

  useEffect(() => {
    if (gameState === "flying") {
      const interval = setInterval(() => {
        setHeight((prev) => {
          const newHeight = prev + 5;
          const newMultiplier = getMultiplier(newHeight);
          setMultiplier(newMultiplier);

          if (newHeight >= crashPoint) {
            setGameState("crashed");
            clearInterval(interval);
          }

          return newHeight;
        });
      }, GAME_SPEED);

      return () => clearInterval(interval);
    }
  }, [gameState, crashPoint]);

  const handleCashout = () => {
    if (gameState === "flying") {
      const winAmount = Math.floor(betAmount * multiplier);
      setBalance((prev) => prev + winAmount);
      setCashout(true);
      setGameState("idle");
      toast.success(`Вы забрали $${winAmount}!`, {
        icon: "🚀",
        style: { background: "#052e16", color: "#86efac" },
      });
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setHeight(0);
    setMultiplier(1.0);
  };

  return (
    <div className="space-crash-container">
      <button className="return-button" onClick={() => window.location.href = "/"}>
        ← Вернуться к играм
      </button>
      <div className="game-controls">
        <h1 className="game-title">Космический Краш</h1>

        <div className="balance-info">
          <p className="label">Баланс</p>
          <p>${balance.toLocaleString()}</p>
          <p className="label">Ставка</p>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(MIN_BET, Math.min(balance, Number(e.target.value))))}
            className="bet-input"
          />
        </div>

        <div className="game-field">
          <div className="space-background">
            <motion.div
              className="rocket-trail"
              style={{ height: height + "px" }}
              animate={{ height }}
            />
            <motion.div
              className="astronaut"
              animate={{ y: -height }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              🚀
            </motion.div>
          </div>
        </div>

        <div className="multiplier-info">
          <p className="label">Множитель</p>
          <p className="multiplier">x{multiplier.toFixed(2)}</p>
        </div>

        <div className="controls">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={startGame}
            disabled={gameState !== "idle"}
            className="button"
          >
            Запустить
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleCashout}
            disabled={gameState !== "flying"}
            className="button cashout-button"
          >
            Забрать
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={resetGame}
            disabled={gameState !== "crashed"}
            className="button"
          >
            Сбросить
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SpaceCrash;
