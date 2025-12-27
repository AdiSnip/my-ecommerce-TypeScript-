import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, User, Menu, X, Zap } from 'lucide-react'
import CategoryBar from './CategoryBar'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  /** Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* NAVBAR */}
      <nav className="bg-indigo-900 shadow-md relative z-[110]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1">
              <motion.h1
                className="text-3xl font-black tracking-tight text-white"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Mall<span className="text-red-500">X</span>
              </motion.h1>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full px-4 py-2.5 pl-11 pr-24 rounded-lg bg-indigo-800 border-2 border-transparent text-white placeholder-indigo-300 focus:bg-indigo-700 focus:border-red-500 focus:outline-none transition"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                  Search
                </button>
              </div>
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-6">
              <NavIcon to="/deals" label="Deals">
                <Zap />
              </NavIcon>

              <NavIcon to="/account" label="Account">
                <User />
              </NavIcon>

              <NavIcon to="/cart" label="Cart" badge="2">
                <ShoppingCart />
              </NavIcon>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(v => !v)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className="md:hidden p-2 text-white hover:bg-indigo-800 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* CATEGORY BAR */}
      <CategoryBar />

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black z-[105]"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="
                fixed
                top-20
                left-0
                right-0
                z-[110]
                bg-indigo-900
                border-t border-indigo-800
                px-4
                pb-safe
              "
            >
              <div className="py-5 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2.5 pl-10 rounded-lg bg-indigo-800 text-white placeholder-indigo-300 focus:bg-indigo-700 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <MobileLink to="/deals" onClick={closeMenu}>
                  <Zap /> Deals
                </MobileLink>

                <MobileLink to="/account" onClick={closeMenu}>
                  <User /> Account
                </MobileLink>

                <MobileLink to="/cart" onClick={closeMenu}>
                  <div className="relative">
                    <ShoppingCart />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      2
                    </span>
                  </div>
                  Cart
                </MobileLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Helper Components ---------- */

const NavIcon = ({
  to,
  label,
  badge,
  children
}: {
  to: string
  label: string
  badge?: string
  children: React.ReactNode
}) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition"
  >
    <div className="relative p-2 rounded-full hover:bg-indigo-800">
      {children}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {badge}
        </span>
      )}
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </Link>
)

const MobileLink = ({
  to,
  onClick,
  children
}: {
  to: string
  onClick: () => void
  children: React.ReactNode
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-lg text-white hover:bg-indigo-800 transition font-semibold"
  >
    {children}
  </Link>
)

export default Navbar
