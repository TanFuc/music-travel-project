import { PrismaClient } from '@prisma/client';

export async function seedStaticPages(prisma: PrismaClient) {
  console.log('📄 Seeding static pages...');

  const pages = [
    {
      title: 'Điều khoản giao dịch',
      slug: 'dieu-khoan-giao-dich',
      category: 'POLICY',
      content: `
        <div class="rich-content">
          <h2>1. Chấp nhận các Điều khoản</h2>
          <p>Bằng cách truy cập và sử dụng website Mãi Cho Hành Tinh Xanh, bạn đồng ý tuân thủ các điều khoản và điều kiện giao dịch này.</p>
          <h2>2. Quy định đặt vé</h2>
          <p>Mọi giao dịch đặt vé show hoặc tour du lịch phải được thực hiện thông qua hệ thống thanh toán chính thức của chúng tôi. Vé sau khi mua thành công sẽ được gửi qua email hoặc hiển thị trong mục "Vé của tôi".</p>
          <h2>3. Trách nhiệm của khách hàng</h2>
          <p>Khách hàng có trách nhiệm cung cấp thông tin cá nhân chính xác và bảo mật tài khoản cá nhân của mình.</p>
        </div>
      `,
    },
    {
      title: 'Chính sách thanh toán',
      slug: 'chinh-sach-thanh-toan',
      category: 'POLICY',
      content: `
        <div class="rich-content">
          <h2>Các phương thức thanh toán</h2>
          <p>Chúng tôi hỗ trợ các phương thức thanh toán sau:</p>
          <ul>
            <li>Thanh toán qua ví điện tử (MoMo, ZaloPay).</li>
            <li>Thanh toán qua cổng VNPAY (Thẻ ATM, Visa, Mastercard).</li>
            <li>Chuyển khoản ngân hàng trực tiếp qua QR Code.</li>
            <li>Sử dụng số dư ví FSell (nếu có).</li>
          </ul>
          <p>Giao dịch được coi là hoàn tất khi hệ thống nhận được xác nhận thanh toán từ ngân hàng/cổng thanh toán.</p>
        </div>
      `,
    },
    {
      title: 'Chính sách bảo mật',
      slug: 'chinh-sach-bao-mat',
      category: 'POLICY',
      content: `
        <div class="rich-content">
          <h2>Thu thập thông tin</h2>
          <p>Chúng tôi thu thập các thông tin cá nhân cơ bản như họ tên, số điện thoại, email để phục vụ việc đặt vé và hỗ trợ khách hàng.</p>
          <h2>Sử dụng thông tin</h2>
          <p>Thông tin của bạn được bảo mật tuyệt đối và chỉ sử dụng cho các mục đích liên quan đến dịch vụ của Mãi Cho Hành Tinh Xanh.</p>
          <h2>Bảo mật dữ liệu</h2>
          <p>Chúng tôi sử dụng các công nghệ mã hóa hiện đại để bảo vệ dữ liệu cá nhân của bạn khỏi các truy cập trái phép.</p>
        </div>
      `,
    },
    {
      title: 'Chính sách đổi trả',
      slug: 'chinh-sach-doi-tra',
      category: 'POLICY',
      content: `
        <div class="rich-content">
          <h2>Quy định chung</h2>
          <p>Mãi Cho Hành Tinh Xanh hỗ trợ đổi trả vé trong các trường hợp sự cố từ phía nhà tổ chức hoặc các điều kiện bất khả kháng.</p>
          <h2>Điều kiện hoàn vé</h2>
          <p>Yêu cầu hoàn vé phải được gửi trước ít nhất 48 giờ so với giờ biểu diễn hoặc khởi hành tour.</p>
          <p>Phí hoàn vé (nếu có) sẽ được quy định cụ thể cho từng loại sản phẩm.</p>
        </div>
      `,
    },
    {
      title: 'Câu hỏi thường gặp',
      slug: 'faq',
      category: 'SUPPORT',
      content: `
        <div class="rich-content">
          <h2>1. Làm sao để mua vé?</h2>
          <p>Bạn chỉ cần chọn show hoặc tour yêu thích, nhấn "Đặt vé ngay", chọn loại vé và tiến hành thanh toán.</p>
          <h2>2. Tôi có thể đổi ngày tham gia tour không?</h2>
          <p>Có, vui lòng liên hệ hotline 0902 348 452 để được hỗ trợ đổi ngày (tùy thuộc vào tình trạng chỗ trống).</p>
          <h2>3. Vé điện tử có cần in ra không?</h2>
          <p>Không cần. Bạn chỉ cần xuất trình mã QR trên điện thoại tại quầy check-in.</p>
        </div>
      `,
    },
    {
      title: 'Hướng dẫn đặt vé',
      slug: 'huong-dan-dat-ve',
      category: 'SUPPORT',
      content: `
        <div class="rich-content">
          <p>Các bước đặt vé đơn giản:</p>
          <ol>
            <li><strong>Bước 1:</strong> Tìm kiếm Show hoặc Tour trên trang chủ.</li>
            <li><strong>Bước 2:</strong> Xem chi tiết và chọn "Đặt vé".</li>
            <li><strong>Bước 3:</strong> Điền thông tin người mua và chọn phương thức thanh toán.</li>
            <li><strong>Bước 4:</strong> Hoàn tất thanh toán và nhận vé điện tử.</li>
          </ol>
        </div>
      `,
    },
    {
      title: 'Liên hệ',
      slug: 'lien-he',
      category: 'SUPPORT',
      content: `
        <div class="rich-content">
          <p>Văn phòng đại diện:</p>
          <p><strong>CÔNG TY CỔ PHẦN BIZ MALL VIỆT NAM</strong></p>
          <p>Địa chỉ: Tòa nhà IC, Số 82 phố Duy Tân, phường Cầu Giấy, TP. Hà Nội</p>
          <p>Điện thoại: 0902 348 452</p>
          <p>Email: Vietnam.bizmall@gmail.com</p>
        </div>
      `,
    },
    {
      title: 'Đăng ký biểu diễn',
      slug: 'dang-ky-bieu-dien',
      category: 'SUPPORT',
      content: `
        <div class="rich-content">
          <p>Bạn là nghệ sĩ và muốn biểu diễn tại các sân khấu của chúng tôi?</p>
          <p>Vui lòng gửi thông tin profile, demo giọng hát hoặc link trình diễn về email: <strong>Vietnam.bizmall@gmail.com</strong></p>
          <p>Chúng tôi sẽ liên hệ lại với bạn trong vòng 3-5 ngày làm việc.</p>
        </div>
      `,
    },
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log(`✅ Seeded ${pages.length} static pages.`);
}
