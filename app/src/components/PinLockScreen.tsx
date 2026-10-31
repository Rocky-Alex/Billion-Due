import { useState, useEffect, useCallback } from "react";
import { Delete, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

export interface PinLockScreenProps {
  pinLength: 4 | 5 | 6;
  storedPin: string;
  onUnlock: () => void;
  companyName: string;
  companyLogo?: string;
  userName?: string;
  onForgotPin?: () => void;
}

export function PinLockScreen({
  pinLength,
  storedPin,
  onUnlock,
  companyName,
  companyLogo,
  userName = "Operator",
  onForgotPin,
}: PinLockScreenProps) {
  const [digits, setDigits] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputDigit = useCallback(
    (digit: string) => {
      if (isSuccess) return;
      if (digits.length >= pinLength) return;

      const next = digits + digit;
      setDigits(next);
      setIsError(false);
      setErrorMessage("");

      // AUTO-UNLOCK: As soon as the PIN reaches required length, check immediately!
      // No submit or enter button required.
      if (next.length === pinLength) {
        if (next === storedPin) {
          setIsSuccess(true);
          setTimeout(() => {
            onUnlock();
          }, 220);
        } else {
          setIsError(true);
          setErrorMessage("Incorrect PIN. Please try again.");
          setTimeout(() => {
            setDigits("");
            setIsError(false);
          }, 600);
        }
      }
    },
    [digits, pinLength, storedPin, isSuccess, onUnlock],
  );

  const handleBackspace = useCallback(() => {
    if (isSuccess) return;
    setDigits((prev) => prev.slice(0, -1));
    setIsError(false);
    setErrorMessage("");
  }, [isSuccess]);

  const handleClear = useCallback(() => {
    if (isSuccess) return;
    setDigits("");
    setIsError(false);
    setErrorMessage("");
  }, [isSuccess]);

  // Physical keyboard listener: instant response to 0-9 and Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleInputDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInputDigit, handleBackspace, handleClear]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

  return (
    <div className="pin-lock-overlay" data-testid="pin-lock-screen">
      <div className={`pin-lock-card ${isError ? "pin-shake" : ""}`}>
        {/* Header Avatar / Logo */}
        <div className="pin-lock-header">
          <div className="pin-lock-avatar">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} />
            ) : (
              <span>{(companyName || "BD").slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="pin-lock-titles">
            <h2>{companyName}</h2>
            {userName && (
              <p
                className="pin-lock-user"
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted, #64748b)",
                  margin: "2px 0 0",
                }}
              >
                {userName}
              </p>
            )}
          </div>
        </div>

        <div className="pin-lock-instruction">
          Enter your <b>{pinLength}-digit PIN</b>
        </div>

        {/* Pin Dots */}
        <div className={`pin-dots-row ${isError ? "error" : ""} ${isSuccess ? "success" : ""}`}>
          {Array.from({ length: pinLength }).map((_, index) => {
            const isFilled = index < digits.length;
            return (
              <div
                key={index}
                className={`pin-dot ${isFilled ? "filled" : ""} ${
                  isSuccess ? "verified" : ""
                } ${isError ? "invalid" : ""}`}
                data-testid={`pin-dot-${index}`}
              >
                {isSuccess && <CheckCircle2 size={14} className="pin-success-icon" />}
              </div>
            );
          })}
        </div>

        {/* Dynamic Status / Error alert */}
        <div className="pin-status-area" style={{ minHeight: 18, marginBottom: 8 }}>
          {errorMessage ? (
            <span className="pin-error-text">
              <ShieldAlert size={13} /> {errorMessage}
            </span>
          ) : isSuccess ? (
            <span className="pin-success-text">
              <CheckCircle2 size={13} /> Unlocking workstation...
            </span>
          ) : null}
        </div>

        {/* Numeric Keypad */}
        <div className="pin-keypad">
          {keys.map((k) => {
            if (k === "C") {
              return (
                <button
                  key={k}
                  type="button"
                  className="pin-key pin-key-action"
                  onClick={handleClear}
                  title="Clear all digits (Esc)"
                  data-testid="pin-key-clear"
                >
                  Clear
                </button>
              );
            }
            if (k === "DEL") {
              return (
                <button
                  key={k}
                  type="button"
                  className="pin-key pin-key-action"
                  onClick={handleBackspace}
                  title="Backspace"
                  data-testid="pin-key-del"
                >
                  <Delete size={18} />
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                className="pin-key pin-key-number"
                onClick={() => handleInputDigit(k)}
                data-testid={`pin-key-${k}`}
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* Footer recovery */}
        {onForgotPin && (
          <div className="pin-lock-footer">
            <button
              type="button"
              className="pin-forgot-btn"
              onClick={onForgotPin}
            >
              <KeyRound size={13} /> Forgot PIN? Unlock with password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
