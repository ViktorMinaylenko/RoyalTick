import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import styles from '@/styles/auction/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'

const STATUSES = [
    { value: 'active', label: '🟢 Активний', color: '#52b788' },
    { value: 'reserved', label: '🟡 Резерв', color: '#fbbf24' },
    { value: 'completed', label: '⚫ Завершений', color: '#6b7280' },
]

interface IProps {
    lotId: string
    currentStatus: string
    onStatusChange: (newStatus: string) => void
}

const ModeratorStatusPanel = ({ lotId, currentStatus, onStatusChange }: IProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const [spinner, setSpinner] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)

    const handleChange = async () => {
        if (selectedStatus === currentStatus) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots/${lotId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ status: selectedStatus }),
            })
            const data = await res.json()
            if (data.status === 200) {
                onStatusChange(selectedStatus)
                toast.success(t.mod_status_changed || 'Статус змінено')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSpinner(false)
        }
    }

    return (
        <div className={styles.lot_page__mod_panel}>
            <span className={styles.lot_page__mod_panel__label}>
                🛡️ {t.mod_change_status || 'Змінити статус'}
            </span>
            <div className={styles.lot_page__mod_panel__row}>
                <select
                    className={styles.lot_page__mod_panel__select}
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                >
                    {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <button
                    className={`btn-reset ${styles.lot_page__mod_panel__btn}`}
                    onClick={handleChange}
                    disabled={spinner || selectedStatus === currentStatus}
                >
                    {spinner
                        ? <FontAwesomeIcon icon={faSpinner} spin />
                        : t.mod_apply || 'Застосувати'
                    }
                </button>
            </div>
        </div>
    )
}

export default ModeratorStatusPanel