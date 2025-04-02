import React from "react";
import styles from "./TopPlayers.module.css";

const TopPlayers = ({ players }) => {
  return (
    <div className={styles.container}>
      <h3>Топ игроков</h3>
      <ul className={styles.topPlayersContainer}>
        {players.map((player, index) => (
          <div key={index} className={styles.topPlayerItem}>
            <div>
              {player.name}
            </div>
            <div>
              {player.countStar}
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default TopPlayers;
