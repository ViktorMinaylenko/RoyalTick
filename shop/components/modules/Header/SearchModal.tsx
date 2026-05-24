'use client'
import { useLang } from '@/hooks/useLang'
import { useSearch } from '@/hooks/useSearch'
import { handleCloseSearchModal } from '@/lib/utils/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import Link from 'next/link'

const SearchModal = () => {
  const { lang, translations } = useLang()
  const {
    searchValue,
    results,
    spinner,
    searched,
    handleSearchInput,
    handleLinkClick,
  } = useSearch()

  const categoryLinks = [
    { href: '/catalog/watches', label: translations[lang].main_menu.watches },
    { href: '/catalog/straps', label: translations[lang].main_menu.straps },
    { href: '/catalog/boxes', label: translations[lang].main_menu.boxes },
    { href: '/catalog/care', label: translations[lang].main_menu.care },
  ]

  return (
    <div className='search-modal'>
      <button
        className='btn-reset search-modal__close'
        onClick={handleCloseSearchModal}
      />
      <h3 className='search-modal__title'>
        {translations[lang].header.search_products}
      </h3>

      <div className='search-modal__top'>
        <label className='search-modal__label'>
          <input
            type='text'
            className={`search-modal__input ${searchValue ? 'with_value' : ''}`}
            value={searchValue}
            onChange={handleSearchInput}
            autoFocus
          />
          <span className='search-modal__floating_label'>
            {translations[lang].header.search_infos}
          </span>
        </label>

        <ul className='search-modal__links list-reset'>
          {categoryLinks.map((cat) => (
            <li key={cat.href}>
              <Link href={cat.href} onClick={handleLinkClick}>
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {spinner && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <FontAwesomeIcon icon={faSpinner} spin size='lg' />
        </div>
      )}

      {!spinner && searched && results.length === 0 && (
        <p style={{ textAlign: 'center', color: 'rgba(240,237,232,0.3)', fontSize: 13 }}>
          {lang === 'ua' ? 'Нічого не знайдено' : 'Nothing found'}
        </p>
      )}

      {!spinner && results.length > 0 && (
        <ul className='search-modal__results list-reset'>
          {results.map((item) => (
            <li key={String(item._id)} className='search-modal__results__item'>
              <Link
                href={`/catalog/${item.category}/${item._id}`}
                className='search-modal__results__item__link'
                onClick={handleLinkClick}
              >
                <div className='search-modal__results__item__left'>
                  <Image
                    className='search-modal__results__item__img'
                    src={item.images?.[0] || '/img/no-image.png'}
                    alt={item.name}
                    width={100}
                    height={100}
                  />
                </div>
                <div className='search-modal__results__item__inner'>
                  <p>{item.name}</p>
                  <p>{item.price} ₴</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchModal