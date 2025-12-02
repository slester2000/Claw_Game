import { Redirect } from "expo-router";

export default function Index() {
  // Send user to the game screen
  return <Redirect href="/screens/GameScreen" />;
}

