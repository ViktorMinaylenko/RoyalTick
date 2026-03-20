import { AnimatePresence, motion } from 'framer-motion'
import { basePropsForMotion } from '@/constants/motion'
import { useGoodsByAuth } from '@/hooks/useGoodsByAuth'
import styles from '@/styles/favorites/index.module.scss'
import { $favorites, $favoritesFromLS } from '@/context/favorites'
import FavoritesListItem from './FavoritesListItem'

const FavoritesList = () => {
  const currentFavoritesByAuth = useGoodsByAuth($favorites, $favoritesFromLS)

  return (
    <AnimatePresence>
      {currentFavoritesByAuth.map((item) => (
        <motion.li
          {...basePropsForMotion}
          key={item._id || item.clientId}
          className={styles.favorites__list__item}
        >
          <FavoritesListItem item={item} />
        </motion.li>
      ))}
    </AnimatePresence>
  )
}

export default FavoritesList