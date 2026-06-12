import styles from '@/styles/user-page/index.module.scss'
import { IPropsReduceModal } from '@/types/user'

const UserPageReduceModal = ({
    userName, reduceType, reduceReason,
    reducePercent, reduceSpinner,
    onTypeChange, onReasonChange, onPercentChange,
    onClose, onConfirm,
}: IPropsReduceModal) => (
    <div className={styles.user_page__modal_overlay} onClick={onClose}>
        <div className={styles.user_page__modal} onClick={e => e.stopPropagation()}>
            <h3>📉 Знизити рейтинг</h3>
            <p style={{ fontSize: 13, color: 'rgba(232,233,234,0.5)', margin: 0 }}>
                Користувач: <strong style={{ color: '#e8e9ea' }}>{userName}</strong>
            </p>
            <select
                value={reduceType}
                onChange={e => onTypeChange(e.target.value as 'seller' | 'buyer')}
                className={styles.user_page__modal_select}
            >
                <option value='seller'>Як продавця</option>
                <option value='buyer'>Як покупця</option>
            </select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(232,233,234,0.4)' }}>
                    Знизити на: <strong style={{ color: '#fbbf24' }}>{reducePercent}%</strong>
                </label>
                <input
                    type='range'
                    min={10}
                    max={50}
                    step={5}
                    value={reducePercent}
                    onChange={e => onPercentChange(Number(e.target.value))}
                    style={{ accentColor: '#fbbf24' }}
                />
            </div>
            <textarea
                className={styles.user_page__modal_textarea}
                placeholder='Причина зниження рейтингу...'
                value={reduceReason}
                onChange={e => onReasonChange(e.target.value)}
            />
            <div className={styles.user_page__modal_btns}>
                <button className={`btn-reset ${styles.user_page__modal_cancel}`} onClick={onClose}>
                    Скасувати
                </button>
                <button
                    className={`btn-reset ${styles.user_page__modal_confirm}`}
                    onClick={onConfirm}
                    disabled={reduceSpinner || !reduceReason.trim()}
                >
                    {reduceSpinner ? '...' : 'Підтвердити'}
                </button>
            </div>
        </div>
    </div>
)

export default UserPageReduceModal