'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCards, EffectCoverflow } from 'swiper/modules';
import { getAppTheme } from '@/lib/colors';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-coverflow';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  image?: string;
  link: string;
}

export default function FeatureSlider() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const appTheme = getAppTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const features: FeatureItem[] = [
    {
      title: "Upload Your Books",
      description: "Import your EPUB books or choose from our collection of public domain classics.",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      color: "bg-black",
      gradient: "bg-black",
      image: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      link: "/about#upload-books"
    },
    {
      title: "Track Characters",
      description: "Keep track of characters as they appear, with descriptions limited to what you know so far.",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: "bg-black",
      gradient: "bg-black",
      image: "url(\"data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      link: "/about#track-characters"
    },
    {
      title: "Get Summaries",
      description: "Generate AI-powered summaries of what you've read, perfect for picking up where you left off.",
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: "bg-black",
      gradient: "bg-black",
      image: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      link: "/about#get-summaries"
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 px-4">
      <div className="text-center mb-10">
        <h2 className={`text-2xl font-bold ${appTheme.primary} ${appTheme.darkPrimary}`}>
          Powerful Features
        </h2>
        <div className="w-20 h-1 mx-auto mt-2 bg-black rounded-full"></div>
      </div>
      
      <div className="hidden md:block">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          modules={[Pagination, Autoplay, EffectCoverflow]}
          className="mySwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div 
                className="relative overflow-hidden rounded-xl shadow-lg p-8 h-72 bg-black transition-all duration-300 hover:shadow-xl"
                style={{ backgroundImage: feature.image }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-white bg-opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 rounded-full bg-white bg-opacity-10 blur-xl"></div>
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm mb-4 shadow-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-white text-opacity-90">{feature.description}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link 
                      href={feature.link} 
                      className="inline-flex items-center text-white text-sm font-medium bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-opacity-30"
                    >
                      Learn more
                      <svg className="ml-1 w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <div className="md:hidden">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          modules={[Pagination, Autoplay, EffectCards]}
          className="mySwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div 
                className="relative overflow-hidden rounded-xl shadow-lg p-6 h-64 bg-black transition-all duration-300"
                style={{ backgroundImage: feature.image }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-white bg-opacity-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 rounded-full bg-white bg-opacity-10 blur-xl"></div>
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className="inline-flex items-center justify-center p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-white text-opacity-90 text-sm">{feature.description}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link 
                      href={feature.link}
                      className="inline-flex items-center text-white text-xs font-medium bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm"
                    >
                      Learn more
                      <svg className="ml-1 w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style jsx global>{`
        .swiper {
          width: 100%;
          padding-top: 20px;
          padding-bottom: 50px;
        }
        
        .swiper-slide {
          background-position: center;
          background-size: cover;
          width: 300px;
          height: auto;
          margin: 0 15px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .swiper-slide-active {
          transform: scale(1.05);
        }
        
        .swiper-pagination-bullet {
          background: #000;
          opacity: 0.5;
        }
        
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #000;
        }
        
        @media (max-width: 640px) {
          .swiper-slide {
            width: 85%;
          }
        }
        
        /* Add animation for the cards */
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .swiper-slide-active {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}