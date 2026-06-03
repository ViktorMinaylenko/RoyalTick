'use client'
import { useState } from 'react'
import { useUnit } from 'effector-react'
import { useLang } from '@/hooks/useLang'
import { loginCheckFx } from '@/context/user'
import { closeVerificationModal } from '@/context/modals'
import { $openVerificationModal } from '@/context/modals/state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faShieldHalved, faTimes } from '@fortawesome/free-solid-svg-icons'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import styles from '@/styles/verification-modal/index.module.scss'
import toast from 'react-hot-toast'

const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const VerificationModal = () => {
    const { translations, lang } = useLang()
    const t = (translations[lang] as any)?.verification
    const isOpen = useUnit($openVerificationModal)

    const [phoneDigits, setPhoneDigits] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [spinner, setSpinner] = useState(false)
    const [errors, setErrors] = useState({ phone: '', card: '' })

    const phoneValue = `+380${phoneDigits}`
    const fullPhone = `+380${phoneDigits}`

    const handleClose = () => {
        removeOverflowHiddenFromBody()
        closeVerificationModal()
        setPhoneDigits('')
        setCardNumber('')
        setErrors({ phone: '', card: '' })
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const withoutPrefix = e.target.value.replace(/^\+380/, '').replace(/\D/g, '')
        setPhoneDigits(withoutPrefix.slice(0, 9))
        setErrors(prev => ({ ...prev, phone: '' }))
    }

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardNumber(formatCardNumber(e.target.value))
        setErrors(prev => ({ ...prev, card: '' }))
    }

    const validate = () => {
        const newErrors = { phone: '', card: '' }

        if (phoneDigits.length < 9) newErrors.phone = t?.phone_error
        if (cardNumber.replace(/\D/g, '').length !== 16) newErrors.card = t?.card_error

        setErrors(newErrors)
        return !newErrors.phone && !newErrors.card
    }

    const handleSubmit = async () => {
        if (!validate()) return

        const authStr = localStorage.getItem('auth')
        if (!authStr) { toast.error(t?.no_auth); return }

        const auth = JSON.parse(authStr)
        if (!auth?.accessToken) { toast.error(t?.no_token); return }

        setSpinner(true)

        try {
            const res = await fetch('/api/users/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ phone: fullPhone, cardNumber }),
            })

            const data = await res.json()

            if (data.status === 200) {
                toast.success(t?.success)
                await loginCheckFx({ jwt: auth.accessToken })
                handleClose()
            } else {
                toast.error(data.message || t?.server_error)
            }
        } catch {
            toast.error(t?.server_error)
        } finally {
            setSpinner(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={`btn-reset ${styles.modal__close}`} onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className={styles.modal__icon}>
                    <FontAwesomeIcon icon={faShieldHalved} />
                </div>

                <h2 className={styles.modal__title}>{t?.title}</h2>
                <p className={styles.modal__subtitle}>{t?.subtitle}</p>

                <div className={styles.modal__field}>
                    <label className={styles.modal__label}>{t?.phone_label}</label>
                    <input
                        className={`${styles.modal__input} ${errors.phone ? styles.modal__input_error : ''}`}
                        type='tel'
                        placeholder='+380XXXXXXXXX'
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        onFocus={e => {
                            const len = e.target.value.length
                            e.target.setSelectionRange(len, len)
                        }}
                        maxLength={13}
                    />
                    {errors.phone && <span className={styles.modal__error}>{errors.phone}</span>}
                </div>

                <div className={styles.modal__field}>
                    <label className={styles.modal__label}>{t?.card_label}</label>
                    <input
                        className={`${styles.modal__input} ${errors.card ? styles.modal__input_error : ''}`}
                        type='text'
                        placeholder='XXXX XXXX XXXX XXXX'
                        value={cardNumber}
                        onChange={handleCardChange}
                        maxLength={19}
                    />
                    {errors.card && <span className={styles.modal__error}>{errors.card}</span>}
                </div>

                <p className={styles.modal__notice}>{t?.notice}</p>

                <button
                    className={`btn-reset ${styles.modal__btn}`}
                    onClick={handleSubmit}
                    disabled={spinner}
                >
                    {spinner ? <FontAwesomeIcon icon={faSpinner} spin /> : t?.submit_btn}
                </button>
            </div>
        </div>
    )
}

export default VerificationModal