import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'
import { Footer } from './components/Footer/Footer'
import { Home } from './pages/Home/Home'
import { Catalogo } from './pages/Catalogo/Catalogo'
import { EncuentraTusGafas } from './pages/EncuentraTusGafas/EncuentraTusGafas'
import { PruebaVirtual } from './pages/PruebaVirtual/PruebaVirtual'
import { Producto } from './pages/Producto/Producto'
import { TestGafas } from './pages/TestGafas/TestGafas'
import { Agenda } from './pages/Agenda/Agenda'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/encuentra-tus-gafas" element={<EncuentraTusGafas />} />
          <Route path="/prueba-virtual" element={<PruebaVirtual />} />
          <Route path="/producto/:id" element={<Producto />} />
          <Route path="/que-gafas-van-contigo" element={<TestGafas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
