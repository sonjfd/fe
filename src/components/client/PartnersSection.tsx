import { Container } from "./AppHeader";

type Partner = {
  id: number;
  name: string;
  logo: string;
};

const PARTNERS: Partner[] = [
  { id: 1, name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { id: 2, name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { id: 3, name: "Puma", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Puma_complete_logo.svg/560px-Puma_complete_logo.svg.png" },
  { id: 4, name: "Mizuno", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Mizuno_logo.svg" },
  { id: 5, name: "Li-Ning", logo: "https://upload.wikimedia.org/wikipedia/en/9/9c/Li-Ning-logo.png" },
  { id: 6, name: "Asics", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Asics_Logo.svg" },
  { id: 7, name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Sony_logo.svg" },
  { id: 8, name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { id: 9, name: "Panasonic", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Panasonic_logo_(Blue).svg" },
  { id: 10, name: "Philips", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Philips_logo.svg" },
];


export const PartnersSection: React.FC = () => {
  return (
    <div className="bg-white py-10 sm:py-12">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Đối tác của chúng tôi</h2>
          <div className="mt-3 flex justify-center">
            <span className="h-[3px] w-24 bg-indigo-600 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
  {PARTNERS.map((p) => (
    <div key={p.id} className="h-10 sm:h-12 flex items-center">
      <img
        src={p.logo}
        alt={p.name}
        className="h-full w-auto object-contain opacity-80 hover:opacity-100 transition"
      />
    </div>
  ))}
</div>

      </Container>
    </div>
  );
};
