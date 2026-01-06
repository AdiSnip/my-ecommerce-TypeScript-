import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar'
import BannerCarousel from './components/shared/BannerCarousel'
import ProductCard from './components/cards/ProductCard'
import ProductPage from './pages/ProductPage'

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <Navbar />

      <Routes>
        <Route path="/" element={
          <>
            <main className="relative mt-[10vh]">
              <BannerCarousel />
            </main>
            <ProductCard />
          </>
        } />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </div>
  )
}

export default App
