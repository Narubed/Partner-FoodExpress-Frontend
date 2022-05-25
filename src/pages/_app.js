// ** Next Imports
import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports
// import themeConfig from '../../src/configs/themeConfig'
const themeConfig = dynamic(() => import('../../src/configs/themeConfig'), { loading: () => <p>...</p> })

// ** Component Imports
// import UserLayout from '../../src/layouts/UserLayout'
// import ThemeComponent from '../../src/@core/theme/ThemeComponent'
const UserLayout = dynamic(() => import('../../src/layouts/UserLayout'), { loading: () => <p>...</p> })
const ThemeComponent = dynamic(() => import('../../src/@core/theme/ThemeComponent'), { loading: () => <p>...</p> })

// ** Contexts
import { SettingsConsumer, SettingsProvider } from '../../src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from '../../src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import '../../styles/globals.css'

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Configure JSS & ClassName
const App = props => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  useEffect(() => {
    // on initial load - run auth check
    authCheck(router.asPath)
    console.log(router.asPath)

    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false)
    router.events.on('routeChangeStart', hideContent)

    // on route change complete - run auth check
    // router.events.on('routeChangeComplete', authCheck)

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)

      router.events.off('routeChangeComplete', authCheck)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function authCheck(url) {
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ['/pages/login', '/pages/404']
    const user = sessionStorage.getItem('user')
    if (!publicPaths.includes(publicPaths) && !user) {
      setAuthorized(false)
      router.push({
        pathname: '/pages/login'

        // query: { returnUrl: router.asPath }
      })
    } else {
      setAuthorized(true)
    }
  }

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <SettingsProvider>
        <SettingsConsumer>
          {({ settings }) => {
            return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
          }}
        </SettingsConsumer>
      </SettingsProvider>
    </CacheProvider>
  )
}

export default App
