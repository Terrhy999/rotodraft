import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

interface LoginProps {
  onLogin: (playerName: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [playerName, setPlayerName] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      setPlayerName(e.target?.value ?? "");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold mb-4">Enter Player Name</h2>
      <input
        type="text"
        value={playerName}
        onChange={handleInputChange}
        className="border p-2 rounded"
        placeholder="Player Name"
      />
      <button
        onClick={() => {
          onLogin(playerName);
        }}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Log In
      </button>
    </div>
  );
};

export default Login;
