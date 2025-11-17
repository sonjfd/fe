import { useEffect, useState } from "react";
import { Container } from "@/components/client/AppHeader";

type Testimonial = {
  id: number;
  name: string;
  location: string;
  avatar: string;
  content: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Hoàng Tú",
    location: "Hà Nội",
    avatar:
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Thương hiệu uy tín và đáng tin cậy, sản phẩm luôn làm tôi hài lòng về chất lượng và dịch vụ hậu mãi.",
  },
  {
    id: 2,
    name: "Minh Châu",
    location: "Hồ Chí Minh",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Gia đình tôi tin dùng sản phẩm ở đây nhiều năm, chăm sóc sức khỏe tốt hơn rất nhiều.",
  },
  {
    id: 3,
    name: "Lê Hải",
    location: "Đà Nẵng",
    avatar:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Dịch vụ tư vấn tận tình, nhân viên hỗ trợ nhanh chóng, dễ chịu, tôi rất yên tâm khi mua sắm.",
  },
  {
    id: 4,
    name: "Trần Hà",
    location: "Hà Nội",
    avatar:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Được bạn bè giới thiệu và thực sự hài lòng với chất lượng, tôi sẽ tiếp tục ủng hộ lâu dài.",
  },
  {
    id: 5,
    name: "Quang Dũng",
    location: "Nha Trang",
    avatar:
      "https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Chính sách bảo hành rõ ràng, giao hàng nhanh, đóng gói cẩn thận, rất đáng tiền.",
  },
  {
    id: 6,
    name: "Lan Anh",
    location: "Hải Phòng",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Mẫu mã hiện đại, nhiều lựa chọn, mức giá hợp lý so với chất lượng nhận được.",
  },
  {
    id: 7,
    name: "Nhật Minh",
    location: "Cần Thơ",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Website dễ dùng, đặt hàng nhanh, thanh toán tiện lợi, có nhiều chương trình khuyến mãi.",
  },
  {
    id: 8,
    name: "Bích Ngọc",
    location: "Bình Dương",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Tôi rất ấn tượng với phong cách chăm sóc khách hàng chủ động, luôn hỏi han, nhắc bảo hành.",
  },
  {
    id: 9,
    name: "Tuấn Kiệt",
    location: "Đà Lạt",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Ghế massage dùng rất êm, sau khi làm việc về nằm thư giãn là khỏi mỏi lưng, ngủ ngon hơn.",
  },
  {
    id: 10,
    name: "Thanh Hằng",
    location: "Huế",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
    content:
      "Từ lúc biết tới thương hiệu này, cả nhà đều thay đổi thói quen chăm sóc sức khỏe tích cực hơn.",
  },
];

const PER_SLIDE = 3;

export const TestimonialsSection: React.FC = () => {
  const [slide, setSlide] = useState(0);

  const totalSlides = Math.ceil(TESTIMONIALS.length / PER_SLIDE);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % totalSlides);
    }, 8000); // 8s đổi slide
    return () => clearInterval(timer);
  }, [totalSlides]);

  // lấy 3 item cho slide hiện tại, xoay vòng nếu hết list
  const visible = Array.from({ length: PER_SLIDE }, (_, idx) => {
    const realIndex = (slide * PER_SLIDE + idx) % TESTIMONIALS.length;
    return TESTIMONIALS[realIndex];
  });

  return (
    <div className="bg-white py-10 sm:py-12">
      <Container>
        {/* tiêu đề */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">
            KHÁCH HÀNG NÓI VỀ CHÚNG TÔI
          </h2>
          <div className="mt-3 flex justify-center">
            <span className="h-[3px] w-24 bg-indigo-600 rounded-full" />
          </div>
        </div>

        {/* slide 3 đánh giá */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {visible.map((t) => (
            <div
              key={t.id}
              className="flex flex-col items-center text-center px-4 sm:px-6"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-indigo-500"
              />
              <div className="text-yellow-400 mb-2 text-lg">
                {"★".repeat(5)}
              </div>
              <div className="font-semibold text-base sm:text-lg">
                {t.name}
              </div>
              <div className="text-xs text-slate-500 mb-3">{t.location}</div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.content}
              </p>
            </div>
          ))}
        </div>

        {/* dots điều hướng */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === slide ? "bg-indigo-600" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </Container>
    </div>
  );
};
