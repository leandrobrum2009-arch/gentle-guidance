import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Campaign } from "@/hooks/useData";
import { Link } from "react-router-dom";

interface HeroModel4Props {
  campaigns: Campaign[];
  delay?: number;
}

const HeroModel4 = ({ campaigns, delay = 5000 }: HeroModel4Props) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, duration: 50 }, [
    Autoplay({ delay, stopOnInteraction: false })
  ]);

  return (
    <section className="relative overflow-hidden w-full h-[400px] md:h-[500px] lg:h-[600px]">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {campaigns.map((campaign) => (
            <Link 
              key={campaign.id} 
              to={`/campanha/${campaign.id}`}
              className="relative min-w-full flex-[0_0_100%] h-full cursor-pointer block"
            >
              <img 
                src={campaign.image_url || "/placeholder.svg"} 
                className="h-full w-full object-cover" 
                alt={campaign.title}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroModel4;
