'use client'
import { useState, useCallback } from 'react'
import { LOTS_PER_PAGE } from '@/constants/auction'

export const useAuctionFilters = () => {
    const [lots, setLots] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [spinner, setSpinner] = useState(false)
    const [category, setCategory] = useState('')
    const [condition, setCondition] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sort, setSort] = useState('newest')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const hasActiveFilters = !!(category || condition || minPrice || maxPrice || sort !== 'newest')

    const buildQuery = useCallback((page: number) => {
        const params = new URLSearchParams()
        params.set('offset', String(page * LOTS_PER_PAGE))
        params.set('limit', String(LOTS_PER_PAGE))
        params.set('sort', sort)
        if (category) params.set('category', category)
        if (condition) params.set('condition', condition)
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)
        return params.toString()
    }, [sort, category, condition, minPrice, maxPrice])

    const fetchLots = useCallback(async (page: number) => {
        setSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots?${buildQuery(page)}`)
            const data = await res.json()
            if (data.status === 200) {
                setLots(data.lots)
                setTotalCount(data.count)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSpinner(false)
        }
    }, [buildQuery])

    const handleReset = () => {
        setCategory('')
        setCondition('')
        setMinPrice('')
        setMaxPrice('')
        setSort('newest')
    }

    const handlePageChange = ({ selected }: { selected: number }) => {
        setCurrentPage(selected)
        fetchLots(selected)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return {
        lots, totalCount, currentPage, spinner,
        category, setCategory,
        condition, setCondition,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        sort, setSort,
        filtersOpen, setFiltersOpen,
        hasActiveFilters,
        fetchLots, handleReset, handlePageChange,
    }
}