import React from "react";

const TopPlayers = ({ players }) => {
  return (
    <div >
      <h3>Top Players</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.name} - {player.countStar}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopPlayers;
