import React, { useState } from "react";
import "../styles/SignIn.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0)">
            <path d="M47.532 24.552c0-1.636-.147-3.2-.42-4.704H24.48v9.02h12.952c-.56 2.996-2.24 5.54-4.772 7.244v6.02h7.72c4.52-4.16 7.152-10.288 7.152-17.58z" fill="#4285F4" />
            <path d="M24.48 48c6.48 0 11.916-2.148 15.888-5.868l-7.72-6.02c-2.148 1.44-4.896 2.292-8.168 2.292-6.276 0-11.596-4.236-13.5-9.928H3.02v6.216C6.98 42.816 15.18 48 24.48 48z" fill="#34A853" />
            <path d="M10.98 28.476A14.46 14.46 0 0 1 10.2 24c0-1.556.268-3.068.78-4.476V13.31H3.02A23.984 23.984 0 0 0 .48 24c0 3.876.928 7.548 2.54 10.692l7.96-6.216z" fill="#FBBC05" />
            <path d="M24.48 9.596c3.54 0 6.712 1.216 9.208 3.604l6.9-6.9C36.388 2.392 30.952 0 24.48 0 15.18 0 6.98 5.184 3.02 13.308l7.96 6.216c1.904-5.692 7.224-9.928 13.5-9.928z" fill="#EA4335" />
        </g>
        <defs>
            <clipPath id="clip0">
                <rect width="48" height="48" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
);

export default function SignIn({ onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const handleEmailContinue = async () => {
        const trimmedEmail = email.trim();


        if (!trimmedEmail || !password) {
            setErrorMessage("Email and password are required.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                }),
            });

            const data = await response.json();
            console.log('Login response:', data);
            if (!response.ok) {
                setErrorMessage(data?.error || "Login failed. Please try again.");
                return;
            }

            if (data?.token) {
                localStorage.setItem("authToken", data.token);
                localStorage.setItem("userId", data.user_id);
                // console.log('Token stored in localStorage:', localStorage.getItem("authToken"));
                // console.log('User ID stored in localStorage:', localStorage.getItem("userId"));
                alert("Login successful!");
                navigate("/hotels/search");
            }

            if (onClose) {
                onClose();
            }
        } catch (error) {
            setErrorMessage("Unable to connect to server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = () => alert("Continuing with Google");
    const handleApple = () => alert("Continuing with Apple");
    const handleFacebook = () => alert("Continuing with Facebook");

    return (
        <div className="signin-overlay">
            <div className="signin-card">
                <button className="signin-close" onClick={onClose} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="signin-header">
                    <h1 className="signin-title">Sign in / register</h1>
                    <div className="signin-perks">
                        <span className="signin-perk">
                            <span className="signin-perk-icon">🏅</span> Membership rewards
                        </span>
                        <span className="signin-perk">
                            <span className="signin-perk-icon">📋</span> Manage bookings with ease
                        </span>
                    </div>
                </div>

                <div className="signin-form">
                    <div className="input-group">
                        <input
                            className="signin-input"
                            type="email"
                            placeholder="Please enter an email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            className="signin-input"
                            type="password"
                            placeholder="Please enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
                        />
                    </div>
                    <button className="btn-email" onClick={handleEmailContinue}>
                        {isLoading ? "Signing in..." : "Continue with Email"}
                    </button>
                    {errorMessage ? <p className="signin-legal">{errorMessage}</p> : null}
                </div>

                <div className="signin-divider">or</div>

                <div className="social-buttons">
                    <button className="btn-social btn-google" onClick={handleGoogle}>
                        <span className="recently-used-badge">Recently used</span>
                        <span className="btn-icon"><GoogleIcon /></span>
                        Continue with Google
                    </button>

                    <button className="btn-social btn-outline" onClick={handleApple}>
                        <span className="btn-icon"><AppleIcon /></span>
                        Continue with Apple
                    </button>

                    <button className="btn-social btn-outline" onClick={handleFacebook}>
                        <span className="btn-icon"><FacebookIcon /></span>
                        Continue with Facebook
                    </button>
                </div>

                <p className="signin-legal">
                    By signing in or registering, you are deemed to have agreed to the Trip.com{" "}
                    <a href="#terms">Terms and Conditions</a> and <a href="#privacy">Privacy Statement</a>.
                </p>
            </div>
        </div>
    );
}