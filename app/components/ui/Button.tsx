import React from "react";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg" | "full";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {

        // Base classes
        let classes = "rounded-[62px] font-medium cursor-pointer transition-all duration-200 font-sans border border-transparent flex items-center justify-center";

        // Variants
        if (variant === "primary") {
            classes += " bg-shop-black text-shop-white hover:bg-black/80";
        } else if (variant === "secondary") {
            classes += " bg-shop-white text-shop-black border-shop-border hover:bg-shop-gray-100";
        } else if (variant === "outline") {
            classes += " bg-transparent border-shop-border text-shop-black hover:bg-shop-gray-100";
        }

        // Sizes
        if (size === "sm") {
            classes += " px-4 py-2 text-sm";
        } else if (size === "md") {
            classes += " px-6 py-3 text-base";
        } else if (size === "lg") {
            classes += " px-[54px] py-[15px] text-base";
        } else if (size === "full") {
            classes += " p-4 w-full text-base";
        }

        return (
            <button
                ref={ref}
                className={`${classes} ${className || ""}`}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export default Button;
