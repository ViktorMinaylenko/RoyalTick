import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { useLang } from '@/hooks/useLang'
import styles from '@/styles/verification-badge/index.module.scss'
import { IPropsBadge } from '@/types/auction'


const VerificationBadge = ({ isVerified, showText = true }: IPropsBadge) => {
    const { translations, lang } = useLang()
    const t = (translations[lang] as any)?.verification

    return (
        <div className={`${styles.badge} ${isVerified ? styles.badge_verified : styles.badge_unverified}`}>
            <FontAwesomeIcon icon={faShieldHalved} />
            {showText && (
                <span>{isVerified ? t?.verified : t?.not_verified}</span>
            )}
        </div>
    )
}

export default VerificationBadge