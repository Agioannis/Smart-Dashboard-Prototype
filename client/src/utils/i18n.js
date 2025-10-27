// Simple i18n helper (lookup). Use `const { t } = useTranslation()` in components.
import { useMemo } from 'react';

const translations = {
    en: {
        settings: {
            title: 'Settings',
            darkMode: 'Dark Mode',
            fontSize: 'Font Size',
            language: 'Language',
            notifications: 'Notifications (future)',
            userEmail: 'User Email (profile)',
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
            english: 'English',
            greek: 'Greek (soon)'
        }
    },
    el: {
        settings: {
            title: 'Ρυθμίσεις',
            darkMode: 'Σκοτεινή Λειτουργία',
            fontSize: 'Μέγεθος Γραμματοσειράς',
            language: 'Γλώσσα',
            notifications: 'Ειδοποιήσεις (μελλοντικά)',
            userEmail: 'Email Χρήστη (προφίλ)',
            small: 'Μικρό',
            medium: 'Μεσαίο',
            large: 'Μεγάλο',
            english: 'Αγγλικά',
            greek: 'Ελληνικά'
        }
    }
};

export function useTranslation(lang) {
    const language = lang || (typeof window !== 'undefined' ? document.documentElement.lang || 'en' : 'en');
    const t = useMemo(() => (path) => {
        const keys = path.split('.');
        let node = translations[language] || translations.en;
        for (const k of keys) {
            node = node && node[k];
            if (node === undefined) return path;
        }
        return node;
    }, [language]);

    return { t, language };
}