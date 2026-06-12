import styles from '@/styles/auction/index.module.scss'
import { formatPrice } from '@/lib/utils/common'
import { IPropsProposal } from '@/types/lots'

const LotPriceProposal = ({
    t, priceProposal,
    proposalAmount, proposalComment,
    proposalSpinner,
    onAmountChange, onCommentChange, onPropose,
}: IPropsProposal) => {
    if (priceProposal?.status === 'pending') {
        return (
            <div className={styles.lot_page__proposal__pending}>
                {t.proposal_pending} {formatPrice(priceProposal.amount)} ₴
            </div>
        )
    }

    return (
        <div className={styles.lot_page__proposal}>
            <p className={styles.lot_page__proposal__title}>
                {t.propose_price_title}
            </p>
            <div className={styles.lot_page__proposal__row}>
                <input
                    type='number'
                    min={1}
                    className={styles.lot_page__proposal__input}
                    placeholder={t.propose_price_placeholder}
                    value={proposalAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                />
                <span>₴</span>
            </div>
            <textarea
                className={styles.lot_page__proposal__textarea}
                placeholder={t.propose_price_comment}
                value={proposalComment}
                onChange={(e) => onCommentChange(e.target.value)}
                rows={2}
            />
            {priceProposal?.status === 'declined' && (
                <p className={styles.lot_page__proposal__declined}>
                    {t.proposal_was_declined}
                </p>
            )}
            <button
                className={`btn-reset ${styles.lot_page__proposal__btn}`}
                onClick={onPropose}
                disabled={proposalSpinner || !proposalAmount}
            >
                {proposalSpinner ? '...' : t.propose_price_btn}
            </button>
        </div>
    )
}

export default LotPriceProposal