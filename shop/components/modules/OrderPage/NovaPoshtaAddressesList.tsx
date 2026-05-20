import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUnit } from 'effector-react'
import {
    getNovaPoshtaOfficesByCityFx,
    setChosenNovaPoshtaAddressData,
    setShouldLoadNovaPoshtaData,
} from '@/context/order'
import {
    $chosenNovaPoshtaAddressData,
    $novaPoshtaDataByCity,
    $shouldLoadNovaPoshtaData,
} from '@/context/order/state'
import { useLang } from '@/hooks/useLang'
import { useTTMap } from '@/hooks/useTTMap'
import styles from '@/styles/order/index.module.scss'
import { IRoyalTickAddressData } from '@/types/order'
import PickupAddressItem from './PickupAddressitem'

const NovaPoshtaAddressesList = ({ listClassName, onSelectAddress, }: { listClassName: string, onSelectAddress?: (item: IRoyalTickAddressData) => void }) => {
    const { lang, translations } = useLang()
    const novaPoshtaDataByCity = useUnit($novaPoshtaDataByCity)
    const chosenNovaPoshtaAddressData = useUnit($chosenNovaPoshtaAddressData)
    const shouldLoadNovaPoshtaData = useUnit($shouldLoadNovaPoshtaData)
    const { handleSelectAddress } = useTTMap()
    const spinner = useUnit(getNovaPoshtaOfficesByCityFx.pending)

    const handleChosenAddressData = (data: Partial<IRoyalTickAddressData>) => {
        setShouldLoadNovaPoshtaData(false)
        setChosenNovaPoshtaAddressData(data)
        onSelectAddress?.(data as IRoyalTickAddressData)
    }

    

    return (
        <>
            {shouldLoadNovaPoshtaData && (
                <>
                    {spinner && (
                        <span className={styles.order__list__item__delivery__inner__spinner}>
                            <FontAwesomeIcon icon={faSpinner} spin color='#fff' size='2x' />
                        </span>
                    )}
                    {!spinner && (
                        <ul className={`list-reset ${listClassName}`}>
                            {novaPoshtaDataByCity?.length ? (
                                novaPoshtaDataByCity.map((item) => (
                                    <PickupAddressItem
                                        key={item.place_id}
                                        addressItem={item}
                                        handleChosenAddressData={handleChosenAddressData}
                                        handleSelectAddress={handleSelectAddress}
                                    />
                                ))
                            ) : (
                                <span>{translations[lang].common.nothing_is_found}</span>
                            )}
                        </ul>
                    )}
                </>
            )}
            {!!chosenNovaPoshtaAddressData.address_line1 && !shouldLoadNovaPoshtaData && (
                <div className={styles.order__list__item__delivery__pickup__choose}>
                    <span>{chosenNovaPoshtaAddressData.address_line1}</span>
                    <span>
                        {chosenNovaPoshtaAddressData.address_line2},{' '}
                        {chosenNovaPoshtaAddressData.city}
                    </span>
                </div>
            )}
        </>
    )
}

export default NovaPoshtaAddressesList