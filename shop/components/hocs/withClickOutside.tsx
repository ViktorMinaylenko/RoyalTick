'use client'
import { useClickOutside } from '@/hooks/useClickOutside'
import { IWrappedComponentProps } from '@/types/hocs'
import {
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react'

export function withClickOutside(
  WrappedComponent: ForwardRefExoticComponent<
    IWrappedComponentProps & RefAttributes<HTMLDivElement>
  >
) {
  const Component = () => {
    const {open,setOpen,ref} = useClickOutside()

    return <WrappedComponent open={open} setOpen={setOpen} ref={ref} />
  }

  return Component
}
