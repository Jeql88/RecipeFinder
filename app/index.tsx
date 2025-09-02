import { Redirect } from "expo-router";

export default function Index() {
  // When the app loads, send user straight to login
  return <Redirect href="/login" />;
}
