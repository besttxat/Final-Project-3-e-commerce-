import { Search } from "lucide-react";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, icon, ...props }, ref) => {
        return (
            <div className={`flex items-center bg-shop-gray-200 rounded-[62px] px-4 py-3 gap-3 w-full max-w-[577px] ${className || ""}`}>
                {icon && <span className="text-shop-gray-500">{icon}</span>}
                <input
                    ref={ref}
                    className="border-none bg-transparent outline-none w-full text-base text-shop-black placeholder:text-shop-gray-500"
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
