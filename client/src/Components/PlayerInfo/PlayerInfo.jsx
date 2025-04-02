import React from 'react';

const PlayerInfo = ({ playerName, starCount, onLeave }) => {
  return (
    <div className="player-info">
      <span>👤 {playerName}</span>
      <span>⭐ {starCount}</span>
      <button className="leave-btn" onClick={onLeave}>Выйти</button>
    </div>
  );
};

export default PlayerInfo;
