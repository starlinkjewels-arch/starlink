import { Settings, Award, Users, Truck, Globe, Headphones } from 'lucide-react';

const services = [
  { icon: Settings, title: 'Customization Services' },
  { icon: Award, title: 'Certified Quality' },
  { icon: Users, title: 'Free Consultation' },
  { icon: Truck, title: 'Fast Delivery' },
  { icon: Globe, title: 'Global Shipping' },
  { icon: Headphones, title: 'After-Sales Support' },
];

const ServicesSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif italic">
            Our Best Service for You
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from our happy customers about their experience
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-foreground/20 flex items-center justify-center mb-4 group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                <service.icon className="h-7 w-7 md:h-8 md:w-8 text-foreground/70 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm md:text-base font-medium text-foreground/80">
                {service.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
