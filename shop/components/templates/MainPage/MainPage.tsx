'use client'
import BestsellerGoods from '@/components/modules/MainPage/BestsellerGoods'
import Categories from '@/components/modules/MainPage/Categories/Categories'
import Hero from '@/components/modules/MainPage/Hero/Hero'
import NewGoods from '@/components/modules/MainPage/NewGoods'
import { MainPageGate } from '@/context/goods/index'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useGate } from 'effector-react'

const MainPage = () => {
  useGate(MainPageGate)
  usePageTitle('main')

  return (
    <main>
      <Hero />
      <Categories />
      <NewGoods/>
      <BestsellerGoods/>
    </main>
  )
}

export default MainPage
