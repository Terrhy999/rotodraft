import { useState } from "preact/hooks";
import Login from "./componenets/login";
import DraftDisplay from "./componenets/DraftDisplay";

const apiUrl = "http://localhost:3000"; // Your API URL

interface Player {
  id: number;
  name: string;
  discordId: string;
}

interface Draft {
  id: number;
  name: string;
  createdAt: Date;
}

interface DraftPlayer {
  id: number;
  draftId: number;
  playerId: number;
  draftOrder: number;
}

interface DraftPick {
  id: number;
  draftId: number;
  draftPlayerId: number;
  cardPoolEntryId: string;
  pickNumber: number;
}

interface CardPoolEntry {
  id: string;
  draftId: number;
  cardId: string;
  count: number;
}

async function fetchData<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData: unknown = await response.json(); // Type as unknown

      // More robust error handling:
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "error" in errorData
      ) {
        throw new Error(errorData.error as string); // Type assertion if 'error' exists
      } else if (typeof errorData === "string") {
        throw new Error(errorData);
      } else {
        throw new Error(`HTTP error! status: ${response.status.toString()}`);
      }
    }
    return await (response.json() as Promise<T>);
  } catch (error) {
    // Handle errors here
    if (error instanceof Error) {
      console.error("Fetch Error:", error.message);
    } else {
      console.error("A non-error was thrown:", error);
    }
    throw error; // Re-throw the error to be handled by the caller
  }
}

async function getPlayerId(name: string) {
  // const params = new URLSearchParams();
  // params.append("name", name);
  const urlWithParams = `${apiUrl}/players/${name}`;
  try {
    return await fetchData<Player>(urlWithParams);
  } catch (error) {
    console.error("Error fetching player by name: ", error);
    return null;
  }
}

async function getDraftsForPlayer(player: Player) {
  // const params = new URLSearchParams();
  // params.append("playerId", player.id.toString());
  const urlWithParams = `${apiUrl}/drafts/${player.id.toString()}`;
  try {
    return await fetchData<Draft[]>(urlWithParams);
  } catch (error) {
    console.error("Error fetching drafts for player: ", error);
    return null;
  }
}

export function App() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  async function login(playerName: string) {
    const player = await getPlayerId(playerName);
    if (player) {
      const drafts = await getDraftsForPlayer(player);
      if (drafts) {
        setDrafts(drafts);
      }
    } else {
      console.log("Coudln't find Player ID");
    }
  }

  return (
    <>
      <Login onLogin={login} />
      <DraftDisplay drafts={drafts} />
    </>
  );
}
