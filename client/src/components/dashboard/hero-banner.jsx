import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const HeroBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const slides = [
    {
      id: 1,
      badge: "Trusted by 1.6M+ Developers Worldwide",
      title: "Consistency and Community",
      subtitle: "Content is everywhere. We provide what is rare",
      highlight: "An Unmatched, Community-Driven Learning Experience",
      description:
        "with peer learning, bounties, code reviews, doubt sessions, alumni network.",
      primaryCTA: "Start Learning",
      secondaryCTA: "See The Impact",
      primaryLink: "/courses",
      secondaryLink: "/courses",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop",
    },
    {
      id: 2,
      badge: "Join 50,000+ Students",
      title: "Learn. Build. Succeed.",
      subtitle: "Your journey to excellence starts here",
      highlight: "World-Class Education at Your Fingertips",
      description:
        "with cutting-edge curriculum, practical assignments, community support, and more.",
      primaryCTA: "Start Now",
      secondaryCTA: "Learn More",
      primaryLink: "/courses",
      secondaryLink: "/courses",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop",
    },
    {
      id: 3,
      badge: "Industry-Leading Platform",
      title: "Master Skills That Matter",
      subtitle: "Learn from the best, build real projects",
      highlight: "Transform Your Career with Expert-Led Learning",
      description:
        "with hands-on projects, mentorship, career guidance, and lifetime access.",
      primaryCTA: "Get Started",
      secondaryCTA: "Explore Courses",
      primaryLink: "/courses",
      secondaryLink: "/courses",
      image:
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=800&fit=crop",
    },
  ];

  return (
    <div
      className={`w-full mb-8 transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={600}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50",
          bulletActiveClass: "swiper-pagination-bullet-active !bg-white",
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        loop={true}
        className="hero-banner-swiper group"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] rounded-2xl overflow-hidden">
              <div className="relative h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative flex items-center justify-center !p-4 sm:!p-8 md:!p-10 lg:!p-16 z-20">
                  <div className="w-full max-w-xl rounded-3xl !p-4 sm:!p-8 md:!p-10">
                    <div className="mb-4 sm:mb-5">
                      <span className="inline-block px-4 py-1.5 bg-gray-800/80 rounded-full text-white/80 text-xs sm:text-sm font-medium border border-white/[0.12]">
                        {slide.badge}
                      </span>
                    </div>

                    <h1 className="!text-2xl sm:!text-3xl md:!text-4xl lg:!text-5xl font-bold text-white !mb-3 sm:!mb-4 !leading-tight">
                      {slide.title}
                    </h1>

                    <p className="!text-sm sm:!text-base md:!text-lg text-white/70 !mb-3 sm:!mb-4 !leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <p className="!text-xs sm:!text-sm md:!text-base text-white/60 !mb-4 sm:!mb-6 !leading-relaxed">
                      Content is everywhere. We provide what is rare{" "}
                      <span className="text-white font-semibold">
                        {slide.highlight}
                      </span>{" "}
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => navigate(slide.primaryLink)}
                        className="inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-4 !bg-[#0055ff] !text-white rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                      >
                        {slide.primaryCTA}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => navigate(slide.secondaryLink)}
                        className="inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-4 bg-transparent text-white border-2 border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 hover:border-white/40 transition-all duration-300"
                      >
                        {slide.secondaryCTA}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <img
                    src={slide.image}
                    alt="Learning experience"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent" />
                </div>
              </div>

              <div className="absolute inset-0 lg:hidden">
                <img
                  src={slide.image}
                  alt="Background"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/70" />
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="swiper-button-prev-custom absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 border border-white/20">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="swiper-button-next-custom absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 border border-white/20">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Swiper>

      <style>{`
        .hero-banner-swiper {
          --swiper-pagination-bottom: 20px;
          --swiper-pagination-bullet-size: 10px;
          --swiper-pagination-bullet-horizontal-gap: 6px;
        }

        @media (min-width: 640px) {
          .hero-banner-swiper {
            --swiper-pagination-bottom: 24px;
            --swiper-pagination-bullet-size: 12px;
          }
        }

        .hero-banner-swiper .swiper-pagination-bullet {
          transition: all 0.3s ease;
          opacity: 0.4;
          background: white !important;
        }

        .hero-banner-swiper .swiper-pagination-bullet-active {
          width: 32px;
          border-radius: 6px;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
