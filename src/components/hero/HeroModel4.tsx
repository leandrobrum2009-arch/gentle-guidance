import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Campaign } from "@/hooks/useData";
import Fade from "embla-carousel-fade";
import { Link } from "react-router-dom";

interface HeroModel4Props {
  campaigns: Campaign[];
  delay?: number;
  transitionType?: 'slide' | 'fade';
}

const HeroModel4 = ({ campaigns, delay = 5000, transitionType = 'slide' }: HeroModel4Props) => {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, duration: 50 }, 
    transitionType === 'fade' 
      ? [Autoplay({ delay, stopOnInteraction: false }), Fade()] 
      : [Autoplay({ delay, stopOnInteraction: false })]
  );

  return (
    <section className="relative overflow-hidden w-full aspect-video md:aspect-[21/9] lg:aspect-[25/9] min-h-[250px] md:min-h-[500px] lg:min-h-[600px]">
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
