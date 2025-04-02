const PlayerList = ({ players }) => {
  return (
    <div>
      <h3>Players:</h3>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
}
export default PlayerList;