import React, { createContext, useContext, useEffect, useState } from 'react';

const SETTINGS_KEY = 'dashboardSettings';

const DEFAULTS = {
    darkMode: false,
    fontSize: 'medium',
    language: 'en'
};

function loadStored() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : DEFAULTS;
    } catch {
        return DEFAULTS;
    }
}

const SettingsContext = createContext({
    settings: DEFAULTS,
    setSettings: () => { }
});

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(loadStored);

    // persist and apply side effects (dark mode, font-size, lang)
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch { }
        // dark mode class
        if (settings.darkMode) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');

        // font size attribute on root
        document.documentElement.setAttribute('data-font-size', settings.fontSize);

        // set html lang
        document.documentElement.lang = settings.language || 'en';
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;