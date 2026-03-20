import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithub,
  faGoogle,
  faXTwitter,
  faFacebook,
} from '@fortawesome/free-brands-svg-icons'

const AuthPopupSocials = ({
  submitSignUpWithOAuth,
}: {
  // Тепер приймаємо назву провайдера як рядок
  submitSignUpWithOAuth: (provider: string) => Promise<void>
}) => (
  <div className='cart-body__socials'>
    <button
      className='btn-reset socials__btn gh-color'
      onClick={() => submitSignUpWithOAuth('github')}
    >
      <FontAwesomeIcon icon={faGithub} />
    </button>

    <button
      className='btn-reset socials__btn g-color'
      onClick={() => submitSignUpWithOAuth('google')}
    >
      <FontAwesomeIcon icon={faGoogle} />
    </button>

    <button
      className='btn-reset socials__btn x-color'
      onClick={() => submitSignUpWithOAuth('twitter')}
    >
      <FontAwesomeIcon icon={faXTwitter} />
    </button>

    <button
      className='btn-reset socials__btn fb-color'
      onClick={() => submitSignUpWithOAuth('facebook')}
    >
      <FontAwesomeIcon icon={faFacebook} />
    </button>
  </div>
)

export default AuthPopupSocials
