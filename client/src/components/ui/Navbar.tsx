import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, User, Menu, X, Zap } from 'lucide-react'
import CategoryBar from './CategoryBar'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='flex flex-col fixed top-0 left-0 right-0 z-50'>
            <nav className='bg-indigo-900 shadow-md relative z-50'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-20'>
                        {/* Logo */}
                        <Link to="/" className='flex items-center gap-1 group'>
                            <motion.h1
                                className='text-3xl font-black tracking-tight text-white'
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                Mall<span className='text-red-500'>X</span>
                            </motion.h1>
                        </Link>

                        {/* Desktop Search */}
                        <div className='hidden md:flex flex-1 max-w-lg mx-8'>
                            <div className='relative w-full'>
                                <input
                                    type="text"
                                    placeholder='Search for products...'
                                    className='w-full px-4 py-2.5 pl-11 pr-4 rounded-lg bg-indigo-800 border-2 border-transparent text-white placeholder-indigo-300 focus:bg-indigo-700 focus:border-red-500 focus:outline-none transition-all duration-300'
                                />
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300' />
                                <button className='absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition-colors duration-200 font-medium text-sm'>
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className='hidden md:flex items-center gap-6'>
                            <Link
                                to="/deals"
                                className='flex flex-col items-center gap-1 group text-white hover:text-red-400 transition-colors duration-200'
                            >
                                <div className='p-2 rounded-full group-hover:bg-indigo-800 transition-colors'>
                                    <Zap className='w-5 h-5' />
                                </div>
                                <span className='text-xs font-semibold'>Deals</span>
                            </Link>

                            <Link
                                to="/account"
                                className='flex flex-col items-center gap-1 group text-white hover:text-red-400 transition-colors duration-200'
                            >
                                <div className='p-2 rounded-full group-hover:bg-indigo-800 transition-colors'>
                                    <User className='w-5 h-5' />
                                </div>
                                <span className='text-xs font-semibold'>Account</span>
                            </Link>

                            <Link
                                to="/cart"
                                className='flex flex-col items-center gap-1 group text-white hover:text-red-400 transition-colors duration-200 relative'
                            >
                                <div className='p-2 rounded-full group-hover:bg-indigo-800 transition-colors relative'>
                                    <ShoppingCart className='w-5 h-5' />
                                    <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold'>
                                        2
                                    </span>
                                </div>
                                <span className='text-xs font-semibold'>Cart</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className='md:hidden p-2 text-white hover:bg-indigo-800 rounded-lg transition-colors'
                        >
                            {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='md:hidden border-t border-indigo-800 overflow-hidden'
                        >
                            <div className='px-4 py-4 space-y-3'>
                                {/* Mobile Search */}
                                <div className='relative'>
                                    <input
                                        type="text"
                                        placeholder='Search products...'
                                        className='w-full px-4 py-2.5 pl-10 rounded-lg bg-indigo-800 border-2 border-transparent text-white placeholder-indigo-300 focus:bg-indigo-700 focus:border-red-500 focus:outline-none transition-all'
                                    />
                                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300' />
                                </div>

                                {/* Mobile Links */}
                                <Link
                                    to="/deals"
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center gap-3 p-3 rounded-lg text-white hover:bg-indigo-800 transition-colors'
                                >
                                    <Zap className='w-5 h-5' />
                                    <span className='font-semibold'>Deals</span>
                                </Link>

                                <Link
                                    to="/account"
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center gap-3 p-3 rounded-lg text-white hover:bg-indigo-800 transition-colors'
                                >
                                    <User className='w-5 h-5' />
                                    <span className='font-semibold'>Account</span>
                                </Link>

                                <Link
                                    to="/cart"
                                    onClick={() => setIsOpen(false)}
                                    className='flex items-center gap-3 p-3 rounded-lg text-white hover:bg-indigo-800 transition-colors relative'
                                >
                                    <div className='relative'>
                                        <ShoppingCart className='w-5 h-5' />
                                        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold'>
                                            2
                                        </span>
                                    </div>
                                    <span className='font-semibold'>Cart</span>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <CategoryBar />
        </div>
    )
}

export default Navbar