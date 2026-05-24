'use client'
import { handleCloseSearchModal } from '@/lib/utils/common'
import { IProduct } from '@/types/common'
import { useCallback, useState } from 'react'
import { useDebounceCallback } from './useDebounceCallback'
import api from '@/api/apiInstance'

export const useSearch = () => {
    const [searchValue, setSearchValue] = useState('')
    const [results, setResults] = useState<(IProduct & { category: string })[]>([])
    const [spinner, setSpinner] = useState(false)
    const [searched, setSearched] = useState(false)

    const debounce = useDebounceCallback(400)

    const fetchResults = useCallback(async (value: string) => {
        if (value.trim().length < 2) {
            setResults([])
            setSearched(false)
            return
        }

        try {
            setSpinner(true)
            const { data } = await api.get(`/api/goods/search?query=${encodeURIComponent(value)}`)
            setResults(data.items || [])
            setSearched(true)
        } catch {
            setResults([])
        } finally {
            setSpinner(false)
        }
    }, [])

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchValue(value)
        debounce(() => fetchResults(value))
    }

    const handleLinkClick = () => {
        handleCloseSearchModal()
        setSearchValue('')
        setResults([])
        setSearched(false)
    }

    return {
        searchValue,
        results,
        spinner,
        searched,
        handleSearchInput,
        handleLinkClick,
    }
}