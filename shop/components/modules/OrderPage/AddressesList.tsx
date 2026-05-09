import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUnit } from 'effector-react'
import {
    getRoyalTickOfficesByCityFx,
    setChosenPickupAddressData,
    setShouldLoadRoyalTickData,
} from '@/context/order'
import {
    $chosenPickupAddressData,
    $royalTickDataByCity,
    $shouldLoadRoyalTickData,
} from '@/context/order/state'
import { useLang } from '@/hooks/useLang'
import { useTTMap } from '@/hooks/useTTMap'
import styles from '@/styles/order/index.module.scss'
import { IAddressesListProps, IRoyalTickAddressData } from '@/types/order'
import PickupAddressItem from './PickupAddressitem'


const AddressesList = ({
    listClassName, handleSelectAddressByMarkers }:
    IAddressesListProps) => {
    const { lang, translations } = useLang()
    const royalTickDataByCity = useUnit($royalTickDataByCity)
    const chosenPickupAddressData = useUnit($chosenPickupAddressData)
    const shouldLoadRoyalTickData = useUnit($shouldLoadRoyalTickData)
    const { handleSelectAddress } = useTTMap()
    const loadRoyalTickDataSpinner = useUnit(
        getRoyalTickOfficesByCityFx.pending
    )

    const handleChosenAddressData = (data: Partial<IRoyalTickAddressData>) => {
        setShouldLoadRoyalTickData(false)
        setChosenPickupAddressData(data)
    }

    return (
        <>
            {shouldLoadRoyalTickData && (
                <>
                    {loadRoyalTickDataSpinner && (
                        <span
                            className={styles.order__list__item__delivery__inner__spinner}
                        >
                            <FontAwesomeIcon icon={faSpinner} spin color='#fff' size='2x' />
                        </span>
                    )}
                    {!loadRoyalTickDataSpinner && (
                        <ul className={`list-reset ${listClassName}`}>
                            {royalTickDataByCity?.length ? (
                                royalTickDataByCity.map((item) => (
                                    <PickupAddressItem
                                        key={item.place_id}
                                        addressItem={item}
                                        handleChosenAddressData={handleChosenAddressData}
                                        handleSelectAddress={handleSelectAddressByMarkers || handleSelectAddress}
                                    />
                                ))
                            ) : (
                                <span>{translations[lang].common.nothing_is_found}</span>
                            )}
                        </ul>
                    )}
                </>
            )}
            {!!chosenPickupAddressData.address_line1 && !shouldLoadRoyalTickData && (
                <div className={styles.order__list__item__delivery__pickup__choose}>
                    <span>{chosenPickupAddressData.address_line1}</span>
                    <span>
                        {chosenPickupAddressData.address_line2},{' '}
                        {chosenPickupAddressData.city}
                    </span>
                </div>
            )}
        </>
    )
}

export default AddressesList