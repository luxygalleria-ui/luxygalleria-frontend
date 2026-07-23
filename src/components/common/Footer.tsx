import Link from "next/link";

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BLZJWnKyP/?mibextid=wwXIfr",
    hoverClass: "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  {
    label: "Instagram (Luxy Galleria)",
    href: "https://www.instagram.com/luxygalleria?igsh=aDhpM2Zoc3FvejQw",
    hoverClass: "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.055 1.81.25 2.235.415.564.22.962.48 1.383.896.417.42.678.82.897 1.382.164.425.358 1.065.413 2.227.057 1.266.07 1.646.07 4.85s-.013 3.584-.07 4.85c-.055 1.172-.25 1.81-.415 2.235-.22.564-.48 1.383-.896 1.383-.42.417-.82.678-1.382.897-.425.164-1.065.358-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.013-4.85-.07c-1.172-.055-1.81-.25-2.235-.415-.564-.22-.962-.48-1.383-.896-.42-.417-.678-.82-.897-1.382-.164-.425-.358-1.065-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.013-3.584.07-4.85c.055-1.172.25-1.81.415-2.235.22-.564.48-1.383.896-1.383.417-.42.82-.678 1.382-.897.425-.164 1.065-.358 2.227-.413 1.266-.057 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.277.06-2.148.26-2.913.558-.787.306-1.459.717-2.126 1.384-.666.667-1.078 1.335-1.384 2.126-.297.765-.499 1.636-.558 2.913-.058 1.28-.072 1.687-.072 4.947s.014 3.667.072 4.947c.06 1.277.26 2.148.558 2.913.306.787.717 1.459 1.384 2.126.667.666 1.335 1.078 2.126 1.384.765.297 1.636.499 2.913.558 1.28.058 1.687.072 4.947.072s3.667-.014 4.947-.072c1.277-.06 2.148-.26 2.913-.558.787-.306 1.459-.717 2.126-1.384.667-.667 1.079-1.335 1.384-2.126.297-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.26-2.148-.558-2.913-.306-.787-.717-1.459-1.384-2.126-.667-.667-1.335-1.078-2.126-1.384-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0z"/>
        <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
        <path d="M18.406 5.594a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
      </svg>
    )
  },
  {
    label: "Instagram (Luxy Snack Station)",
    href: "https://www.instagram.com/luxysnackstation?igsh=MXAyNWQwZmZtaHoydQ==",
    hoverClass: "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.055 1.81.25 2.235.415.564.22.962.48 1.383.896.417.42.678.82.897 1.382.164.425.358 1.065.413 2.227.057 1.266.07 1.646.07 4.85s-.013 3.584-.07 4.85c-.055 1.172-.25 1.81-.415 2.235-.22.564-.48 1.383-.896 1.383-.42.417-.82.678-1.382.897-.425.164-1.065.358-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.013-4.85-.07c-1.172-.055-1.81-.25-2.235-.415-.564-.22-.962-.48-1.383-.896-.42-.417-.678-.82-.897-1.382-.164-.425-.358-1.065-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.013-3.584.07-4.85c.055-1.172.25-1.81.415-2.235.22-.564.48-1.383.896-1.383.417-.42.82-.678 1.382-.897.425-.164 1.065-.358 2.227-.413 1.266-.057 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.277.06-2.148.26-2.913.558-.787.306-1.459.717-2.126 1.384-.666.667-1.078 1.335-1.384 2.126-.297.765-.499 1.636-.558 2.913-.058 1.28-.072 1.687-.072 4.947s.014 3.667.072 4.947c.06 1.277.26 2.148.558 2.913.306.787.717 1.459 1.384 2.126.667.666 1.335 1.078 2.126 1.384.765.297 1.636.499 2.913.558 1.28.058 1.687.072 4.947.072s3.667-.014 4.947-.072c1.277-.06 2.148-.26 2.913-.558.787-.306 1.459-.717 2.126-1.384.667-.667 1.079-1.335 1.384-2.126.297-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.26-2.148-.558-2.913-.306-.787-.717-1.459-1.384-2.126-.667-.667-1.335-1.078-2.126-1.384-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0z"/>
        <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
        <path d="M18.406 5.594a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
      </svg>
    )
  },
  {
    label: "Snapchat",
    href: "https://www.snapchat.com/add/luxygalleria",
    hoverClass: "hover:text-[#F7C948] hover:border-[#F7C948]/40 hover:bg-[#FFFC00]/10",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.872 21.7645C10.6817 21.7645 9.88811 21.2027 9.17926 20.7079C8.67548 20.3512 8.20292 20.0124 7.64564 19.9188C7.37369 19.8697 7.09729 19.8519 6.84317 19.8519C6.3706 19.8519 5.99612 19.9232 5.72863 19.9767C5.55922 20.0079 5.41655 20.0347 5.3051 20.0347C5.18919 20.0347 5.04207 20.0035 4.98411 19.8073C4.93507 19.6468 4.90386 19.4953 4.87266 19.3481C4.79241 18.9781 4.72554 18.7507 4.58733 18.7285C3.0983 18.5011 2.20667 18.1578 2.0328 17.7521C2.01942 17.7075 2.00159 17.6629 2.00159 17.6273C1.99267 17.5025 2.08184 17.3999 2.20667 17.3776C3.38808 17.1815 4.44913 16.5529 5.34522 15.5186C6.0407 14.7161 6.37952 13.9404 6.41073 13.8557C6.41073 13.8467 6.41964 13.8467 6.41964 13.8467C6.58906 13.4946 6.62472 13.1959 6.52218 12.9507C6.33048 12.4915 5.69742 12.2953 5.26498 12.1616C5.15352 12.1303 5.0599 12.0947 4.97965 12.0679C4.60962 11.9208 3.9944 11.6087 4.07464 11.1763C4.1326 10.8642 4.54721 10.6413 4.88603 10.6413C4.97965 10.6413 5.0599 10.6547 5.12677 10.6904C5.50572 10.8642 5.849 10.9534 6.14324 10.9534C6.50881 10.9534 6.68268 10.8152 6.72726 10.7706C6.71834 10.5744 6.70497 10.3694 6.69159 10.1777C6.60243 8.81346 6.49989 7.11936 6.93234 6.14747C8.22967 3.24074 10.9848 3.00892 11.8007 3.00892C11.823 3.00892 12.1573 3 12.1573 3C12.1707 3 12.1885 3 12.2064 3C13.0222 3 15.7774 3.22737 17.0747 6.13856C17.5116 7.11044 17.4046 8.80901 17.3154 10.1687L17.3065 10.2356C17.2976 10.4184 17.2842 10.5923 17.2753 10.7706C17.3199 10.8063 17.4804 10.94 17.8103 10.9445C18.0956 10.9356 18.4077 10.8419 18.7643 10.6814C18.8758 10.6324 18.9917 10.6146 19.0764 10.6146C19.2012 10.6146 19.3261 10.6458 19.4331 10.6814H19.442C19.7407 10.7929 19.9368 11.0024 19.9368 11.2209C19.9458 11.426 19.7853 11.738 19.0229 12.0456C18.9427 12.0768 18.849 12.1125 18.7376 12.1393C18.3141 12.2686 17.681 12.4736 17.4804 12.9284C17.3689 13.1691 17.4135 13.4767 17.5829 13.8245C17.5829 13.8334 17.5918 13.8334 17.5918 13.8334C17.6409 13.9582 18.9293 16.8828 21.7959 17.3598C21.9207 17.3821 22.001 17.4846 22.001 17.6094C22.001 17.654 21.9921 17.6986 21.9698 17.7387C21.7959 18.1489 20.9132 18.4833 19.4152 18.7151C19.277 18.7374 19.2102 18.9647 19.1299 19.3348C19.0987 19.4863 19.063 19.6335 19.0185 19.794C18.9739 19.9411 18.8803 20.0213 18.7198 20.0213H18.6975C18.5949 20.0213 18.4567 20.0079 18.2739 19.9723C17.953 19.9054 17.6008 19.8564 17.1594 19.8564C16.8964 19.8564 16.6244 19.8787 16.3569 19.9232C15.8041 20.0124 15.3271 20.3557 14.8233 20.7123C14.1055 21.2027 13.3075 21.7645 12.1261 21.7645C12.1261 21.7645 11.9077 21.7645 11.872 21.7645Z"/>
      </svg>
    )
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@luxysnackstation?si=oqzX6swsa1f5hYBz",
    hoverClass: "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
];

const footerLinks = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const deliveryCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore",
  "Bhopal", "Patna", "Visakhapatnam", "Kochi", "Thiruvananthapuram", "Kozhikode",
  "Coimbatore", "Madurai", "Tiruchirappalli", "Mysuru", "Mangaluru", "Vijayawada",
  "Guntur", "Warangal", "Bhubaneswar", "Cuttack", "Guwahati", "Shillong", "Ranchi",
  "Jamshedpur", "Raipur", "Bilaspur", "Chandigarh", "Amritsar", "Ludhiana",
  "Jalandhar", "Dehradun", "Haridwar", "Agra", "Varanasi", "Prayagraj", "Noida",
  "Gurugram", "Faridabad", "Udaipur", "Jodhpur",
];

export default function Footer() {
  const leadingCities = deliveryCities.slice(0, -1).join(", ");
  const lastCity = deliveryCities[deliveryCities.length - 1];

  return (
    <footer className="bg-slate-100 text-slate-900 w-full border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-x-12 gap-y-10">

          {/* Brand column */}
          <div className="lg:col-span-6 flex flex-col">
            <Link href="/" className="inline-flex items-center mb-4 group" aria-label="Luxy Galleria home">
              <img
                src="/luxy_logo_footer.png"
                alt="Luxy Galleria"
                width={654}
                height={393}
                className="h-auto w-40 md:w-44 max-w-[180px] object-contain mix-blend-multiply group-hover:drop-shadow-lg transition-all duration-300"
              />
            </Link>

            {/* Delivered To */}
            <p className="max-w-[540px] text-[15px] md:text-base leading-[1.8] text-slate-600">
              Delivered To : {leadingCities}, and {lastCity}.
            </p>

            {/* Socials */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {socials.map(({ svg, label, href, hoverClass }) => (
                <a
                  key={label + href}
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer"
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-white border-2 border-[#A68B5B]/20 transition-all text-[#A68B5B] ${hoverClass} shadow-sm hover:shadow-md`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  title={label}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links column */}
          <div className="lg:col-span-3 lg:mt-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A68B5B] mb-6 leading-none">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {footerLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-600 hover:text-[#A68B5B] transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="lg:col-span-3 lg:mt-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A68B5B] mb-6 leading-none">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a href="mailto:infoluxygalleria@gmail.com" className="text-slate-600 hover:text-[#A68B5B] transition-colors font-medium">
                  infoluxygalleria@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+919074881551" className="text-slate-600 hover:text-[#A68B5B] transition-colors font-medium">
                  +91 9074881551
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-slate-200 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} <span className="font-bold text-[#A68B5B]">Luxy Galleria</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
