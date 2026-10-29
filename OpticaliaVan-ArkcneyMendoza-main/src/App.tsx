import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'

// Cada página se descarga solo cuando alguien la visita (archivo aparte),
// así la primera carga del sitio es más liviana.
const Home = lazy(() => import('./pages/Home/Home').then((m) => ({ default: m.Home })))
const Catalogo = lazy(() => import('./pages/Catalogo/Catalogo').then((m) => ({ default: m.Catalogo })))
const Producto = lazy(() => import('./pages/Producto/Producto').then((m) => ({ default: m.Producto })))
const TestGafas = lazy(() => import('./pages/TestGafas/TestGafas').then((m) => ({ default: m.TestGafas })))
const PruebaVirtual = lazy(() => import('./pages/PruebaVirtual/PruebaVirtual').then((m) => ({ default: m.PruebaVirtual })))
const Agenda = lazy(() => import('./pages/Agenda/Agenda').then((m) => ({ default: m.Agenda })))
const Conocenos = lazy(() => import('./pages/Conocenos/Conocenos').then((m) => ({ default: m.Conocenos })))
const NoEncontrada = lazy(() => import('./pages/NoEncontrada/NoEncontrada').then((m) => ({ default: m.NoEncontrada })))

// Mapa de rutas del sitio. Todas van dentro de <Layout> (barra, contenido y pie).
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="producto/:id" element={<Producto />} />
        <Route path="que-gafas-van-contigo" element={<TestGafas />} />
        <Route path="prueba-virtual" element={<PruebaVirtual />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="conocenos" element={<Conocenos />} />
        {/* La página vieja "¿Quieres realizar el test?" ahora lleva directo al test. */}
        <Route path="encuentra-tus-gafas" element={<Navigate to="/que-gafas-van-contigo" replace />} />
        {/* Cualquier otra dirección: aviso de página no encontrada. */}
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
