import { useNavigate } from "react-router-dom";

const Footer = () => {

  const navigate = useNavigate();

  const services = [
    {
      name: "Plumber",
      icon: "🔧"
    },
    {
      name: "Electrician",
      icon: "⚡"
    },
    {
      name: "Painter",
      icon: "🎨"
    },
    {
      name: "Mechanic",
      icon: "🚗"
    },
    {
      name: "Cook",
      icon: "👨‍🍳"
    }
  ];

  const handleServiceClick = (service) => {

    navigate(
      `/search?q=${encodeURIComponent(service)}`
    );

  };

  return (

<footer className="workshop-panel mt-12">

<div className="container">

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

{/* ABOUT */}

<div>

<h4
className="
text-sm
font-bold
uppercase
tracking-widest
mb-4
text-secondary-foreground
"
>

SEVA
<span className="text-primary">
.
</span>

WEBSITE

</h4>

<p
className="
font-body
text-sm
text-secondary-foreground/70
leading-6
"
>

Connecting customers with skilled workers quickly and safely.

Trusted service marketplace for plumbers, electricians, painters, mechanics, cooks and more.

</p>

</div>


{/* SERVICES */}

<div>

<h4
className="
text-sm
font-bold
uppercase
tracking-widest
mb-4
text-secondary-foreground
"
>

Services

</h4>

<ul
className="
space-y-3
"
>

{

services.map((service)=>(

<li
key={service.name}
>

<button

onClick={()=>

handleServiceClick(
service.name
)

}

className="

flex
items-center
gap-2

font-body
text-sm

text-secondary-foreground/70

hover:text-primary

transition-all

hover:translate-x-1

"

>

<span>

{service.icon}

</span>

<span>

{service.name}

</span>

</button>

</li>

))

}

</ul>

</div>


{/* CONTACT */}

<div>

<h4
className="
text-sm
font-bold
uppercase
tracking-widest
mb-4
text-secondary-foreground
"
>

Contact

</h4>

<ul
className="
space-y-3
font-body
text-sm
text-secondary-foreground/70
"
>

<li>

📧 info@sevawebsite.com

</li>

<li>

📞 +91 8065147502

</li>

<li>

📍 Garhi Harsaru,
Gurugram,
Haryana

</li>

<li>

🕒 Support:
9 AM - 8 PM

</li>

</ul>

</div>

</div>


<div
className="
mt-8
pt-6
border-t
border-secondary-foreground/10
text-center
"
>

<p
className="
font-mono
text-xs
text-secondary-foreground/50
uppercase
tracking-widest
"
>

© 2026 Seva Website

All Rights Reserved

</p>

<p
className="
text-xs
text-secondary-foreground/40
mt-2
"
>

Reliable Services • Trusted Workers • Transparent Pricing

</p>

</div>

</div>

</footer>

);

};

export default Footer;