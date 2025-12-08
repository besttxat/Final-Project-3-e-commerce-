import { Facebook, Twitter, Instagram, Github, Mail } from "lucide-react";
import Button from "./ui/Button";
import { Input } from "./ui/Input";

const Footer = () => {
    return (
        <footer className="bg-shop-gray-200 pt-[50px] pb-[20px] mt-[100px] relative">
            {/* Newsletter Section */}
            <div className="container relative -top-[120px] -mb-[80px]">
                <div className="bg-black rounded-[20px] py-9 px-16 flex flex-wrap justify-between items-center gap-5 max-w-[1240px] mx-auto">
                    <h2 className="text-white w-full max-w-[551px] text-[40px] font-black font-sans leading-tight">
                        STAY UPTO DATE ABOUT OUR LATEST OFFERS
                    </h2>
                    <div className="flex flex-col gap-3.5 w-full max-w-[349px]">
                        <Input
                            placeholder="Enter your email address"
                            icon={<Mail size={20} />}
                            className="bg-white text-black rounded-[62px]"
                        />
                        <Button variant="secondary" size="full" className="rounded-[62px]">Subscribe to Newsletter</Button>
                    </div>
                </div>
            </div>

            <div className="container pt-[50px] grid grid-cols-2 md:grid-cols-5 gap-10 pb-10 border-b border-black/10">
                <div className="col-span-2 md:col-span-1.5 pr-5">
                    <h2 className="text-[33px] font-black mb-6 font-sans">SHOP.CO</h2>
                    <p className="text-shop-gray-500 text-sm leading-[22px] mb-9">
                        We have clothes that suits your style and which you're proud to wear. From women to men.
                    </p>
                    <div className="flex gap-3">
                        <SocialIcon><Twitter size={18} /></SocialIcon>
                        <SocialIcon><Facebook size={18} /></SocialIcon>
                        <SocialIcon><Instagram size={18} /></SocialIcon>
                        <SocialIcon><Github size={18} /></SocialIcon>
                    </div>
                </div>

                <FooterColumn
                    title="COMPANY"
                    links={["About", "Features", "Works", "Career"]}
                />
                <FooterColumn
                    title="HELP"
                    links={["Customer Support", "Delivery Details", "Terms & Conditions", "Privacy Policy"]}
                />
                <FooterColumn
                    title="FAQ"
                    links={["Account", "Manage Deliveries", "Orders", "Payments"]}
                />
                <FooterColumn
                    title="RESOURCES"
                    links={["Free eBooks", "Development Tutorial", "How to - Blog", "Youtube Playlist"]}
                />
            </div>

            <div className="container pt-5 flex flex-col md:flex-row justify-between items-center text-shop-gray-500 text-sm gap-4">
                <p>Shop.co © 2000-2023, All Rights Reserved</p>
                <div className="flex gap-2.5">
                    {/* Payment badges */}
                    <Badge>Visa</Badge>
                    <Badge>Mastercard</Badge>
                    <Badge>Paypal</Badge>
                    <Badge>ApplePay</Badge>
                    <Badge>G Pay</Badge>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="w-7 h-7 rounded-full border border-black/20 flex items-center justify-center cursor-pointer bg-white hover:bg-black hover:text-white transition-colors">
        {children}
    </div>
);

const FooterColumn = ({ title, links }: { title: string, links: string[] }) => (
    <div>
        <h3 className="text-base font-medium tracking-[3px] mb-6 uppercase">{title}</h3>
        <ul className="flex flex-col gap-5">
            {links.map(link => (
                <li key={link}>
                    <a href="#" className="text-shop-gray-500 text-base hover:text-black transition-colors">{link}</a>
                </li>
            ))}
        </ul>
    </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-[#D6DCE5] rounded-[5px] px-2.5 py-1.5 text-[10px] font-bold text-black">
        {children}
    </div>
);

export default Footer;
