import styles from '@/styles/user-page/index.module.scss'
import { IPropsUserPageBlockModal } from '@/types/user'

const UserPageBlockModal = ({
    userName, blockReason, blockSpinner,
    onReasonChange, onClose, onConfirm,
}: IPropsUserPageBlockModal) => (
    <div className={styles.user_page__modal_overlay} onClick={onClose}>
        <div className={styles.user_page__modal} onClick={e => e.stopPropagation()}>
            <h3>🔒 Заблокувати користувача</h3>
            <p style={{ fontSize: 13, color: 'rgba(232,233,234,0.5)', margin: 0 }}>
                <strong style={{ color: '#e8e9ea' }}>{userName}</strong> не зможе виставляти лоти та робити ставки.
            </p>
            <textarea
                className={styles.user_page__modal_textarea}
                placeholder='Причина блокування...'
                value={blockReason}
                onChange={e => onReasonChange(e.target.value)}
            />
            <div className={styles.user_page__modal_btns}>
                <button className={`btn-reset ${styles.user_page__modal_cancel}`} onClick={onClose}>
                    Скасувати
                </button>
                <button
                    className='btn-reset'
                    style={{
                        padding: '9px 18px',
                        borderRadius: 8,
                        background: 'rgba(248,113,113,0.15)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        color: '#f87171',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: blockSpinner || !blockReason.trim() ? 'not-allowed' : 'pointer',
                        opacity: blockSpinner || !blockReason.trim() ? 0.4 : 1,
                    }}
                    onClick={onConfirm}
                    disabled={blockSpinner || !blockReason.trim()}
                >
                    {blockSpinner ? '...' : 'Заблокувати'}
                </button>
            </div>
        </div>
    </div>
)

export default UserPageBlockModal