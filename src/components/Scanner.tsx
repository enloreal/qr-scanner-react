import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import QrScanner from './QrScanner'
import { getQrScannerLabels } from './QrScanner/i18nLabels'
import type { QrScannerLayoutParts, QrScannerRenderApi } from './QrScanner/types'
import { createLazyZxingAdapter } from '../lazyZxingAdapter'
import { createMockScannerAdapter } from '../mockScannerAdapter'

const USE_MOCK = ['1', 'true', 'yes', 'on'].includes(
  (import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase(),
)

function Scanner() {
  const { t, i18n } = useTranslation('common')
  const labels = getQrScannerLabels(t)
  const scannerAdapter = useMemo(() => {
    if (USE_MOCK) {
      return createMockScannerAdapter({
        resultText: 'TEST-QR-FROM-MOCK',
        intervalMs: 4000,
      })
    }

    return createLazyZxingAdapter()
  }, [])

  const renderResult = (api: QrScannerRenderApi) => (
    <div className="result">
      <div className="result__title">
        <strong>{api.labels.base64Title}</strong>
        <button
          type="button"
          className={`result-button controls-button btn-primary ${api.rawCopied ? 'is-copied' : ''}`}
          onClick={() => void api.copyRaw()}
          disabled={!api.hasResult}
        >
          {api.rawCopied ? api.labels.copiedButton : api.labels.copyButton}
        </button>
      </div>
      <p className="result__raw">{api.resultBase64}</p>

      <div className="result__title">
        <strong>{api.labels.resultTitle}</strong>
        <button
          type="button"
          className={`result-button controls-button btn-primary ${api.resultCopied ? 'is-copied' : ''}`}
          onClick={() => void api.copyResult()}
          disabled={!api.hasResult}
        >
          {api.resultCopied ? api.labels.copiedButton : api.labels.copyButton}
        </button>
      </div>
      <p className="result__text">{api.resultText}</p>
    </div>
  )

  const renderLayout = (parts: QrScannerLayoutParts) => (
    <main className="main-wrap">
      <div className="content">
        {parts.title}
        {parts.stage}
      </div>

      {parts.controls}
      {parts.error}
      {parts.result}
    </main>
  )

  return (
    <>
      <header className="header-wrapper">
        <div className="header">
          <div className="header__upper">
            <a href="https://my.centrinvest.ru/main" className="header__logo">
              <img src="/logo.svg" alt="Центр-инвест" width="160" height="40" />
            </a>

            <div className="header__profile">
              <button type="button" className="header__profile-notification" aria-label="Уведомления">
                <img src="/bell.svg" alt="notification-bell" className="header__notification-icon" />
              </button>
              

              <a href="https://my.centrinvest.ru/setting-menu/user" className="header__profile-link">
                <div className="header__profile-avatar">
                  <p>ИФ</p>
                </div>
                <div className="header__profile-name">Имя Отчество Ф.</div>
              </a>
            </div>
          </div>

          <nav className="header__nav">
            <ul className="header__nav-list">
              <li><a href="https://my.centrinvest.ru/main" className="header__nav-item">Главная</a></li>
              <li><a href="https://my.centrinvest.ru/services" className="header__nav-item">Платежи</a></li>
              <li><a href="https://my.centrinvest.ru/operations" className="header__nav-item">История операций</a></li>
              <li><a href="https://my.centrinvest.ru/setting-menu" className="header__nav-item">Еще</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      {/* ТЕСТ СМЕНЫ ЯЗЫКА */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
        <button type="button" onClick={() => i18n.changeLanguage('ru')}>RU</button>
        <button type="button" onClick={() => i18n.changeLanguage('en')}>EN</button>
      </div>

      <QrScanner
        labels={labels}
        scannerAdapter={scannerAdapter}
        autoStart={false}
        allowFileUpload
        renderResult={renderResult}
        renderLayout={renderLayout}
        onResult={({ text }) => {
          console.log('Считан код:', text)
        }}
        onError={(message) => {
          console.warn('Ошибка сканера:', message)
        }}
      />
    </>
  )
}

export default Scanner
