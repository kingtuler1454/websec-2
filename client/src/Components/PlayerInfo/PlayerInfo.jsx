import React from 'react';
import styles from './PlayerInfo.module.css';

const PlayerInfo = ({ playerName, starCount, onLeave }) => {
  return (
    <div className={styles.playerInfo}>
      <div className={styles.container}>
        <span>{playerName}</span>
        <span>{starCount}</span>
      </div>
      <button onClick={onLeave}>Выйти</button>
    </div>
  );
};

export default PlayerInfo;
