import styles from '@/styles/auction/index.module.scss'
import { formatPrice } from '@/lib/utils/common'
import { ISellerProposalProps } from '@/types/lots'

const LotSellerProposal = ({ t, priceProposal, respondSpinner, onRespond }: ISellerProposalProps) => (
    <div className={styles.lot_page__proposal__seller}>
        <p className={styles.lot_page__proposal__seller__text}>
            🟢 <strong>{priceProposal.userName}</strong> {t.proposal_received} <strong>{formatPrice(priceProposal.amount)} ₴</strong>
        </p>
        {priceProposal.comment && (
            <p className={styles.lot_page__proposal__seller__comment}>
                &ldquo;{priceProposal.comment}&rdquo;
            </p>
        )}
        <div className={styles.lot_page__proposal__seller__actions}>
            <button
                className={`btn-reset ${styles.lot_page__proposal__seller__accept}`}
                onClick={() => onRespond('accept')}
                disabled={respondSpinner}
            >
                {respondSpinner ? '...' : t.proposal_accept}
            </button>
            <button
                className={`btn-reset ${styles.lot_page__proposal__seller__decline}`}
                onClick={() => onRespond('decline')}
                disabled={respondSpinner}
            >
                {t.proposal_decline}
            </button>
        </div>
    </div>
)

export default LotSellerProposal