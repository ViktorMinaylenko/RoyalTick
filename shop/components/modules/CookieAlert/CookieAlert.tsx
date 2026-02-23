import toast from 'react-hot-toast'
import { useLang } from '@/hooks/useLang'

const CookieAlert = ({
  setCookieAlertOpen,
}: {
  setCookieAlertOpen: (arg0: boolean) => void
}) => {
  const { lang, translations } = useLang()

  const handleAcceptCookie = () => {
    document.cookie = 'CookieBy=RoyalTick; max-age=' + 60 * 60 * 24 * 30

    if (document.cookie) {
      setCookieAlertOpen(false)
    } else {
      toast.error(
        // eslint-disable-next-line max-len
        'Файл cookie не вдалося встановити! Будь ласка, дозвольте використання файлів cookie для цього сайту в налаштуваннях вашого браузера.'
      )
    }
  }

  const handleCloseAlert = () => setCookieAlertOpen(false)

  return (
    <div className='container cookie-popup__container'>
      <button
        className='btn-reset cookie-popup__close'
        onClick={handleCloseAlert}
      />
      <p
        className='cookie-popup__text'
        dangerouslySetInnerHTML={{
          __html: translations[lang].common.cookie_text,
        }}
      />
      <button
        className='btn-reset cookie-popup__accept'
        onClick={handleAcceptCookie}
      >
        {translations[lang].common.accept}
      </button>
    </div>
  )
}

export default CookieAlert
