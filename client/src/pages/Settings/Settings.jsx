import React from 'react';
import './Settings.css';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../utils/i18n';

const Settings = () => {
    const { settings, setSettings } = useSettings();
    const { t } = useTranslation(settings.language);

    const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

    return (
        <div className="settings-container">
            <h1>{t('settings.title')}</h1>

            <div className="setting-item">
                <span>{t('settings.darkMode')}</span>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={() => update({ darkMode: !settings.darkMode })}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className="setting-item">
                <span>{t('settings.fontSize')}</span>
                <select
                    value={settings.fontSize}
                    onChange={(e) => update({ fontSize: e.target.value })}
                >
                    <option value="small">{t('settings.small')}</option>
                    <option value="medium">{t('settings.medium')}</option>
                    <option value="large">{t('settings.large')}</option>
                </select>
            </div>

            <div className="setting-item">
                <span>{t('settings.language')}</span>
                <select
                    value={settings.language}
                    onChange={(e) => update({ language: e.target.value })}
                >
                    <option value="en">{t('settings.english')}</option>
                    <option value="el">{t('settings.greek')}</option>
                </select>
            </div>

            <div className="setting-item">
                <span>{t('settings.notifications')}</span>
                <label className="switch">
                    <input type="checkbox" disabled />
                    <span className="slider round"></span>
                </label>
            </div>

            <div className="setting-item">
                <span>{t('settings.userEmail')}</span>
                <div>
                    <span className="profile-readonly">user@demo.local</span>
                </div>
            </div>
        </div>
    );
};

export default Settings;
