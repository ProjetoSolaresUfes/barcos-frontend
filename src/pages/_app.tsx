import { Sidebar } from '@/components/Sidebar'
import { menus } from '@/routes'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className='flex'>
      <Sidebar 
        display={true}
        menus={menus}
      />
      <Component {...pageProps} />
    </div>
  )
}
