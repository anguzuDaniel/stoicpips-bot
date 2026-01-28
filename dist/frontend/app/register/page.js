'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// African country codes with flags
const africanCountryCodes = [
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
    { code: '+229', country: 'Benin', flag: '🇧🇯' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳' }
];
export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+234',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        if (!formData.firstName || !formData.lastName) {
            setError('Please enter your full name');
            setLoading(false);
            return;
        }
        if (!formData.phoneNumber) {
            setError('Please enter your phone number');
            setLoading(false);
            return;
        }
        const phoneRegex = /^\d+$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError('Phone number should contain only digits');
            setLoading(false);
            return;
        }
        try {
            const fullPhone = `${formData.countryCode}${formData.phoneNumber}`;
            console.log('Starting registration process...');
            // Step 1: Create auth user WITH metadata (this stores data in auth.users)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: fullPhone,
                        country_code: formData.countryCode,
                        full_name: `${formData.firstName} ${formData.lastName}`
                    }
                }
            });
            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }
            if (!authData.user) {
                throw new Error('No user data returned from authentication');
            }
            console.log('Auth user created successfully:', authData.user.id);
            console.log('User metadata:', authData.user.user_metadata);
            // Step 2: Try to create profile in public.profiles table
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                    {
                        id: authData.user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: fullPhone,
                        country_code: formData.countryCode,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                    .select();
                if (profileError) {
                    console.warn('Profile creation failed, but auth user was created:', profileError);
                    // This is okay - the important data is in auth.user_metadata
                }
                else {
                    console.log('Profile created successfully:', profileData);
                }
            }
            catch (profileErr) {
                console.warn('Profile creation error (non-critical):', profileErr);
                // Continue anyway - auth user has the data
            }
            setSuccess(true);
            setTimeout(() => {
                router.push('/login?message=Check your email to confirm your account. Your information has been saved.');
            }, 3000);
        }
        catch (error) {
            console.error('Registration error:', error);
            // User-friendly error messages
            if (error.message.includes('User already registered')) {
                setError('This email is already registered. Please try logging in instead.');
            }
            else if (error.message.includes('Invalid email')) {
                setError('Please enter a valid email address.');
            }
            else if (error.message.includes('Password should be at least')) {
                setError('Password must be at least 6 characters long.');
            }
            else {
                setError(error.message || 'An error occurred during registration. Please try again.');
            }
        }
        setLoading(false);
    };
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8", children: _jsxs("div", { className: "relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md text-center", children: [_jsx("div", { className: "w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-2xl", children: "\u2705" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-4", children: "Registration Successful!" }), _jsx("p", { className: "text-gray-300 mb-4", children: "Please check your email to confirm your account." }), _jsx("p", { className: "text-sm text-gray-400", children: "Your name and phone number have been saved to your account." }), _jsx("p", { className: "text-sm text-gray-400 mt-2", children: "Redirecting to login page..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: "absolute top-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" })] }), _jsxs("div", { className: "relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-cyan-500/10", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center", children: _jsx("span", { className: "text-xl font-bold text-white", children: "\u26A1" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2", children: "Join Stoic Pips" }), _jsx("p", { className: "text-gray-400 text-center mb-8", children: "Create your professional trading account" }), error && (_jsx("div", { className: "mb-6 p-4 backdrop-blur-lg bg-red-500/10 border border-red-400/20 rounded-xl text-red-400 text-sm", children: error })), _jsxs("form", { onSubmit: handleRegister, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "First Name" }), _jsx("input", { type: "text", name: "firstName", placeholder: "First name", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.firstName, onChange: handleChange, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Last Name" }), _jsx("input", { type: "text", name: "lastName", placeholder: "Last name", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.lastName, onChange: handleChange, required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Email Address" }), _jsx("input", { type: "email", name: "email", placeholder: "Enter your email", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.email, onChange: handleChange, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Phone Number" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-1/3", children: _jsx("select", { name: "countryCode", value: formData.countryCode, onChange: handleChange, className: "w-full px-3 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", required: true, children: africanCountryCodes.map((country) => (_jsxs("option", { value: country.code, children: [country.flag, " ", country.code] }, country.code))) }) }), _jsx("div", { className: "flex-1", children: _jsx("input", { type: "tel", name: "phoneNumber", placeholder: "7012345678", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.phoneNumber, onChange: handleChange, required: true }) })] }), _jsxs("p", { className: "text-xs text-gray-400 mt-2", children: ["Example: ", formData.countryCode, "7012345678"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Password" }), _jsx("input", { type: "password", name: "password", placeholder: "Create a password (min. 6 characters)", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.password, onChange: handleChange, required: true, minLength: 6 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Confirm Password" }), _jsx("input", { type: "password", name: "confirmPassword", placeholder: "Confirm your password", className: "w-full px-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300", value: formData.confirmPassword, onChange: handleChange, required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" }), "Creating Account..."] })) : ('Create Account') })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-gray-400 text-sm", children: ["Already have an account?", ' ', _jsx(Link, { href: "/login", className: "text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-semibold", children: "Sign in" })] }) })] })] }));
}
//# sourceMappingURL=page.js.map