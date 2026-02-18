import QrScanner from './QrScanner'

function Scanner() {
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

      <QrScanner
        autoStart={false}
        allowFileUpload
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
