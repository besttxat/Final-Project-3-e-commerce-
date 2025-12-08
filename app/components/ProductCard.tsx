import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface ProductCardProps {
    id: string | number;
    title: string;
    price: string | number;
    rating: number;
    imageUrl: string;
    discount?: number;
    originalPrice?: string | number;
}

const ProductCard = ({ id, title, price, rating, imageUrl, discount, originalPrice }: ProductCardProps) => {
    return (
        <Link href={`/product/${id}`} className="flex flex-col gap-2.5 w-full max-w-[295px]">
            <div className="bg-shop-gray-200 rounded-[20px] overflow-hidden relative h-[298px] flex items-center justify-center">
                {/* Placeholder for image if not valid URL, but assuming valid for now or Next/Image handling */}
                <Image src={imageUrl} alt={title} width={295} height={298} className="object-cover w-full h-full" />
            </div>

            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <div className="flex items-center gap-1.5 my-1.5">
                    {/* Simple Rating Logic */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16}
                            className={i < Math.floor(rating) ? "fill-[#FFC633] text-[#FFC633]" : "text-transparent fill-transparent"}
                        />
                    ))}
                    <span className="text-sm text-shop-black">{rating}/5</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-bold">${price}</span>
                    {originalPrice && (
                        <span className="text-2xl font-bold text-shop-gray-500 line-through">
                            ${originalPrice}
                        </span>
                    )}
                    {discount && (
                        <span className="bg-[#FF33331A] text-shop-red text-xs px-3.5 py-1.5 rounded-[62px] font-medium">
                            -{discount}%
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
