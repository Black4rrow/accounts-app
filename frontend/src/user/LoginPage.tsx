import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"
import { useAuth } from "../context/AuthContext.tsx";

export default function LoginPage() {
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const phoneNumberRef = useRef<HTMLInputElement>(null);

    const API_URL = (import.meta as any).env.VITE_API_URL;

    async function login(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";
        try {
            const resp = await axios.post(`${API_URL}/login`, {
                mail: email,
                password: password,
            });

            authLogin(resp.data.data.token, resp.data.data.userId, resp.data.data.mail);
            navigate("/");
        } catch (err) {
            console.error("Login error", err);
            setError("Impossible de se connecter. Veuillez vérifier vos identifiants");
        } finally {
            setLoading(false);
        }
    }

    function checkRegisterInputs(): boolean {
        const password = passwordRef.current?.value || "";
        const confirmPassword = confirmPasswordRef.current?.value || "";
        const mail = emailRef.current?.value || "";
        const firstname = firstNameRef.current?.value || "";
        const lastname = lastNameRef.current?.value || "";
        const phoneNumber = phoneNumberRef.current?.value || "";

        if (!firstname || !lastname || !mail || !password || !confirmPassword) {
            setError("Veuillez remplir tous les champs obligatoires");
            setLoading(false);
            return false;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return false;
        }

        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(mail.toLowerCase())) {
            setError("Adresse mail invalide");
            setLoading(false);
            return false;
        }

        if (phoneNumber && !/^\+?[0-9]\d{1,14}$/.test(phoneNumber)) {
            setError("Numéro de téléphone invalide");
            setLoading(false);
            return false;
        }

        return true;
    }

    async function register(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";
        const firstname = firstNameRef.current?.value || "";
        const lastname = lastNameRef.current?.value || "";
        const phoneNumber = phoneNumberRef.current?.value || "";

        if (checkRegisterInputs() === true) {
            try {
                await axios.post(`${API_URL}/register`, {
                    mail: email,
                    password: password,
                    firstname: firstname,
                    lastname: lastname,
                    phoneNumber: phoneNumber,
                });
                setIsRegistering(false);
            } catch (err) {
                console.error("Registration error", err);
                if ((err as any).status === 409) {
                    setError("Un compte avec cette adresse mail existe déjà");
                } else {
                    setError("Impossible de s'inscrire. Veuillez réessayer");
                }
            }
            finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-700 to-stone-900 p-8 flex items-center justify-center">

            {/* Affiche soit le formulaire de connexion, soit celui d'inscription */}
            {isRegistering ? (
                <div className="bg-neutral-700 rounded-3xl p-8 p-12 shadow-xl max-w-lg w-full">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-3xl font-bold text-neutral-100 mb-2">Bienvenue !</h1>
                        <p className="text-neutral-300 mb-8">Créez un compte</p>

                        <form onSubmit={register} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Mail <span className="text-red-500">*</span>
                                </label>
                                <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="email" id="email" ref={emailRef} placeholder="example@mail.com" required />
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <label htmlFor="first-name" className="block text-sm font-medium text-neutral-300 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="text" id="first-name" ref={firstNameRef} placeholder="John" required />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="block text-sm font-medium text-neutral-300 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="text" id="last-name" ref={lastNameRef} placeholder="Doe" required />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="password" id="password" ref={passwordRef} placeholder="••••••••" required />
                                </div>


                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-300 mb-2">
                                        Confirmez le mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="password" id="confirm-password" ref={confirmPasswordRef} placeholder="••••••••" required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Numéro de téléphone
                                </label>
                                <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="tel" id="phone" ref={phoneNumberRef} placeholder="+1 234 567 8901" maxLength={15} />
                            </div>

                            {error && (
                                <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-gray-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30">{loading ? "Inscription..." : "S'inscrire"}</button>
                            <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-sm text-neutral-300 hover:text-white hover:underline mt-4">Déjà un compte ? Connectez-vous</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-neutral-700 rounded-3xl p-8 p-12 shadow-xl max-w-md w-full">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-3xl font-bold text-neutral-100 mb-2">Bienvenue !</h1>
                        <p className="text-neutral-300 mb-8">Connectez-vous</p>

                        <form onSubmit={login} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Mail
                                </label>
                                <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="email" id="email" ref={emailRef} placeholder="example@mail.com" required />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                                    Password
                                </label>
                                <input className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-neutral-400 text-white" type="password" id="password" ref={passwordRef} placeholder="••••••••" required />
                            </div>

                            {error && (
                                <div className="bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl p-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-gray-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30">{loading ? "Connexion..." : "Log in"}</button>
                            <button type="button" onClick={() => setIsRegistering(true)} className="w-full text-sm text-neutral-300 hover:text-white hover:underline mt-4">Pas encore de compte ? Inscrivez-vous</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}