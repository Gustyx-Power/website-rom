import { useState } from "react";
import { apiSend } from "../../api.js";

export default function Login({ onAuth }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiSend("POST", "/api/login", { password });
      onAuth?.();
    } catch (e2) {
      setError(
        e2.status === 401 ? "WRONG PASSWORD — TRY AGAIN" : e2.message.toUpperCase()
      );
      setBusy(false);
    }
  }

  return (
    <div className="login container">
      <p className="mono-label">RESTRICTED AREA</p>
      <h1 className="login__title">ADMIN ACCESS</h1>
      <form className="login__form" onSubmit={submit}>
        <label className="field">
          <span className="field__label mono-label">PASSWORD</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="error-box mono-label">{error}</p> : null}
        <button className="btn" disabled={busy}>
          {busy ? "CHECKING…" : "UNLOCK →"}
        </button>
      </form>
    </div>
  );
}
