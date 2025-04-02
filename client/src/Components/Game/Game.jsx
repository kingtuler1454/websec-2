import React, { useState, useEffect, useRef, useCallback } from "react";
import {HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";
import styles from "./Game.module.css";
import TopPlayers from "./TopPlayers";
import PlayerInfo from "./PlayerInfo";

const NameForm = ({ onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="name-form">
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Join Game</button>
    </form>
  );
};

const Game = () => {
  const [connection, setConnection] = useState(null);
  const [players, setPlayers] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [star, setStar] = useState(null);
  const canvasRef = useRef(null);
  const pressedKeys = useRef(new Set());
  const [isJoined, setIsJoined] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [starCount, setStarCount] = useState(0);
  const [carImages, setCarImages] = useState({});

  const handleKeyDown = useCallback((event, conn) => {
    const directions = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };

    if (directions[event.key]) {
      pressedKeys.current.add(directions[event.key]);
      sendMovement(conn);
    }
  }, []);

  const checkAndConnect = useCallback(async () => {
    if (connection) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5100/game")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build();

    try {
      await newConnection.start();
      await newConnection.invoke("CheckGame");
      setConnection(newConnection);
      window.addEventListener("keydown", (event) => handleKeyDown(event, newConnection));
      window.addEventListener("keyup", handleKeyUp);
    } catch (error) {
      console.error("Connection failed: ", error);
    }
  }, [connection, handleKeyDown]);

  useEffect(() => {
    const images = {};
    for (let i = 1; i <= 6; i++) {
      const img = new Image();
      img.src = `/${i}.png`;
      images[i] = img;
    }
    setCarImages(images);
  }, []);

  useEffect(() => {
    checkAndConnect();
  }, [checkAndConnect]);

  const handleJoin = async (name) => {
    if (connection) {
      try {
        await connection.invoke("RegisterPlayer", name);
        setPlayerName(name);
        setIsJoined(true);
      } catch (error) {
        console.error("Registration failed: ", error);
      }
    }
  };

  const handleLeave = async () => {
    if (connection) {
      try {
        await connection.invoke("LeaveGame");
        setIsJoined(false);
        setPlayerName("");
        setStarCount(0);
      } catch (error) {
        console.error("Ошибка выхода из игры: ", error);
      }
    }
  };

  useEffect(() => {
    if (!connection) return;

    connection.on("TopPlayers", (topPlayersData) => {
      setTopPlayers(topPlayersData);
    });

    connection.on("StarCollected", (starData) => {
      setStar(starData);
    });

    connection.on("ReceiveStars", (score) => {
      setStarCount(score);
    });

    connection.on("GameState", (playersData) => {
      setPlayers(playersData);
    });

    return () => connection.stop();
  }, [connection]);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(carImages).length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(players).forEach((player) => {
      const carImage = carImages[player.car.color];
      if (carImage) {
        ctx.drawImage(carImage, player.car.x, player.car.y, 32, 32);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(player.name, player.car.x, player.car.y - 5);
      }
    });

    if (star) {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(star.x, star.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [players, star, carImages]);

  const handleKeyUp = (event) => {
    const directions = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };

    if (directions[event.key]) {
      pressedKeys.current.delete(directions[event.key]);
    }
  };

  const sendMovement = (conn) => {
    if (conn.state === HubConnectionState.Connected) {
      const movementArray = Array.from(pressedKeys.current);
      if (movementArray.length > 0) {
        conn.invoke("Move", movementArray);
      }
    }
  };

  return (
    <div>
      {!isJoined ? (
        <NameForm onSubmit={handleJoin} />
      ) : (
        <PlayerInfo playerName={playerName} starCount={starCount} onLeave={handleLeave} />
      )}
      <TopPlayers players={topPlayers} />
      <canvas className={styles.container} ref={canvasRef} width={620} height={620} />
    </div>
  );
};

export default Game;