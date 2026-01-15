import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const CategoryBar = () => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const categories = [
        "Electronics",
        "Fashion",
        "Home & Kitchen",
        "Books",
        "Sports"
    ]

    const moreOptions = [
        "Toys & Games",
        "Automotive",
        "Beauty",
        "Pet Supplies",
        "Health",
        "Office Products"
    ]

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm relative z-40 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8 h-10 overflow-visible">
                    {/* Main Categories */}
                    {categories.map((category) => (
                        <Link
                            key={category}
                            to={`/category/${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                            className="text-sm font-medium text-gray-700 hover:text-indigo-900 transition-colors whitespace-nowrap"
                        >
                            {category}
                        </Link>
                    ))}

                    {/* More Dropdown */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setActiveDropdown("more")}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-900 transition-colors bg-transparent border-none outline-none cursor-pointer h-10">
                            More
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "more" ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                            {activeDropdown === "more" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full right-0 w-48 bg-white shadow-xl rounded-b-lg border border-gray-100 py-2 z-50 origin-top"
                                >
                                    {moreOptions.map((option) => (
                                        <Link
                                            key={option}
                                            to={`/category/${option.toLowerCase().replace(/ /g, '-')}`}
                                            className="block px-4 py-2 text-sm text-gray-600 hover:text-indigo-900 hover:bg-gray-50 transition-colors"
                                        >
                                            {option}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryBar
