
import { Link } from 'react-router-dom'
import { products } from '../../data/products'

const ProductCard = () => {
  return (
    // Added md:justify-start and px-2 for better desktop alignment
    <div className='h-auto w-full flex flex-wrap justify-center md:justify-start md:px-10'>
      {products.map((item) => {
        return (
          <Link 
            to={`/product/${item.id}`} 
            key={item.id} 
            // Mobile: 45vw | Desktop: Fixed 250px width and auto height
            className='h-[35vh] md:h-80 w-[45vw] md:w-64 bg-black m-[2.5vw] md:m-4 block overflow-hidden rounded-lg'
          >
            <img
              className='h-[90%] w-full object-cover'
              src={item.img} 

            />
            <div className='flex gap-2 justify-center items-center h-[10%] bg-black text-white'>
              <div className='font-bold'>{item.price}</div>
              <p className='line-through text-gray-500 text-sm'>{item.oldPrice}</p>
              <p className='text-cyan-600 text-sm font-semibold'>{item.discount}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default ProductCard