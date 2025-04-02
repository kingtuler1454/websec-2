import React, { useState, useEffect, useRef, useCallback } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import styles from "./Game.module.css";
import TopPlayers from "../TopPlayers/TopPlayers";
import NameForm from "../NameForm/NameForm";
import PlayerInfo from "../PlayerInfo/PlayerInfo";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import environment from "../../config/environment";

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
  const [starImage, setStarImage] = useState(null);
  const [isError, setIsError] = useState(false);

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

  const checkAndConnect = useCallback(async () => {
    if (connection) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(environment.backendUrl)
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
    const star = new Image();
    star.src = "/star.png";
    setStarImage(star);
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

  const handleLeave = useCallback(async () => {
    if (connection) {
      try {
        await connection.invoke("LeaveGame");
        setIsJoined(false);
        setPlayerName("");
        setStarCount(0);
      } catch (error) {
        console.error("Error exit: ", error);
      }
    }
  }, [connection]);


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

    connection.on("Info", (status) => {
      if (status === "full") {
        setIsError(true);
        handleLeave();
      } else if (status === "empty") {
        setIsError(false);
      }
    });

    return () => connection.stop();
  }, [connection, handleLeave]);

  useEffect(() => {
    if (!canvasRef.current || Object.keys(carImages).length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (star) {
      ctx.drawImage(starImage,star.x, star.y, 28, 28);
      ctx.fill();
    }
    Object.values(players).forEach((player) => {
      const carImage = carImages[player.car.color];
      if (carImage) {
        ctx.drawImage(carImage, player.car.x, player.car.y, 32, 32);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(player.name, player.car.x, player.car.y - 5);
      }
    });
  }, [players, star, carImages, starImage]);

  return (
    <div className={styles.gameContainer}>
      <TopPlayers players={topPlayers} />
      <canvas className={styles.container} ref={canvasRef} width={630} height={630} />
      <div>
        {!isJoined ? (
          <NameForm onSubmit={handleJoin} />
        ) : (
          <PlayerInfo playerName={playerName} starCount={starCount} onLeave={handleLeave} />
        )}
        {isError && <ErrorMessage />}
      </div>
    </div>
  );
};

export default Game;
