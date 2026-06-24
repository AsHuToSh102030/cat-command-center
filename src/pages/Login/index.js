import { supabase } from "../../lib/supabase";

function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h1>🐱 CAT Command Center</h1>

      <button onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;