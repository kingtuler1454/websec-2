import React, { useState} from "react";

const UsernameInput = ({ onSetUsername }) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSetUsername(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Введите ваше имя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button type="submit">Играть</button>
    </form>
  );
}

export default UsernameInput;