import { ITabControlsProps } from '@/types/order'
import styles from '@/styles/order/index.module.scss'

const TabControls = ({
    handleTab1,
    handleTab2,
    handleTab3,
    tab1Active,
    tab2Active,
    tab3Active,
    tab1Text,
    tab2Text,
    tab3Text,
}: ITabControlsProps) => {
    const navClassName = handleTab3 && tab3Text 
        ? styles.order__list__item__nav 
        : styles.order__list__item__nav__orders

    return (
        <div className={navClassName}>
            <button
                onClick={handleTab1}
                className={`btn-reset ${styles.order__list__item__nav__item} ${tab1Active ? styles.active : ''}`}
            >
                {tab1Text}
            </button>
            <button
                onClick={handleTab2}
                className={`btn-reset ${styles.order__list__item__nav__item} ${tab2Active ? styles.active : ''}`}
            >
                {tab2Text}
            </button>
            {handleTab3 && tab3Text && (
                <button
                    onClick={handleTab3}
                    className={`btn-reset ${styles.order__list__item__nav__item} ${tab3Active ? styles.active : ''}`}
                >
                    {tab3Text}
                </button>
            )}
        </div>
    )
}

export default TabControls