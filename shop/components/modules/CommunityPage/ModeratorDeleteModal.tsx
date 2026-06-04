'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useLang } from '@/hooks/useLang'
import styles from '@/styles/community/index.module.scss'

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string, punishment: string) => void
    isLoading: boolean
    type: 'topic' | 'message'
    title?: string
}

const ModeratorDeleteModal = ({ isOpen, onClose, onConfirm, isLoading, type, title }: Props) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).moderator || {}
    const [reason, setReason] = useState('')
    const [punishment, setPunishment] = useState('none')

    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm(reason, punishment)
        setReason('')
        setPunishment('none')
    }

    const handleClose = () => {
        setReason('')
        setPunishment('none')
        onClose()
    }

    return (
        <div className={styles.moderator_modal__overlay} onClick={handleClose}>
            <div className={styles.moderator_modal} onClick={e => e.stopPropagation()}>
                <button className={`btn-reset ${styles.moderator_modal__close}`} onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className={styles.moderator_modal__icon}>
                    <FontAwesomeIcon icon={faTrash} />
                </div>
                <h3 className={styles.moderator_modal__title}>
                    {type === 'topic'
                        ? (t.delete_topic_title || 'Видалення обговорення')
                        : (t.delete_message_title || 'Видалення коментаря')
                    }
                </h3>
                {title && (
                    <p className={styles.moderator_modal__subtitle}>{title}</p>
                )}
                <div className={styles.moderator_modal__field}>
                    <label className={styles.moderator_modal__label}>
                        {t.reason_label || 'Причина (необов\'язково)'}
                    </label>
                    <textarea
                        className={styles.moderator_modal__textarea}
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder={t.reason_placeholder || 'Опишіть причину видалення...'}
                        rows={3}
                    />
                </div>
                <div className={styles.moderator_modal__field}>
                    <label className={styles.moderator_modal__label}>
                        {t.punishment_label || 'Покарання'}
                    </label>
                    <select
                        className={styles.moderator_modal__select}
                        value={punishment}
                        onChange={e => setPunishment(e.target.value)}
                    >
                        <option value='none'>{t.punishment_none || 'Без покарання'}</option>
                        <option value='warning'>{t.punishment_warning || 'Попередження'}</option>
                    </select>
                </div>
                <div className={styles.moderator_modal__actions}>
                    <button
                        className={`btn-reset ${styles.moderator_modal__cancel}`}
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {t.cancel || 'Скасувати'}
                    </button>
                    <button
                        className={`btn-reset ${styles.moderator_modal__confirm}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <FontAwesomeIcon icon={faSpinner} spin />
                            : (t.confirm || 'Видалити')
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModeratorDeleteModal