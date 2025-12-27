export interface Product {
    id: number;
    img: string;
    price: string;
    oldPrice: string;
    discount: string;
}

export const products: Product[] = [
    {
        id: 1,
        img: "https://rukminim2.flixcart.com/image/480/580/xif0q/t-shirt/r/x/i/xxl-08-black-spoonker-original-imagnsnzwxgjqzgn.jpeg?q=90",
        price: "$999",
        oldPrice: "$1500",
        discount: "33% Off"
    },
    {
        id: 2,
        img: "https://triprindia.com/cdn/shop/files/3.1_e5dffbdb-a071-4248-a973-fd919300796e.jpg?v=1758184028&width=1200",
        price: "$499",
        oldPrice: "$1200",
        discount: "58% Off"
    },
    {
        id: 3,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAV9nn9cDeOLiAs_65405er6ol6ja2AwtRsQ&s",
        price: "$749",
        oldPrice: "$999",
        discount: "25% Off"
    },
    {
        id: 4,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu104s9h02EFmItqShrDuG45Y5AEZ8jvn-Eg&s",
        price: "$1200",
        oldPrice: "$2000",
        discount: "40% Off"
    },
    {
        id: 5,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU3p7m5EHe00VZz5p1OtlTQSdIDeDv2ZNPxw&s",
        price: "$599",
        oldPrice: "$850",
        discount: "30% Off"
    },
    {
        id: 6,
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6y3RyWvIjA80SabsrkbYxDsdS5TKvvc0uCQ&s",
        price: "$349",
        oldPrice: "$1199",
        discount: "70% Off"
    }
];
