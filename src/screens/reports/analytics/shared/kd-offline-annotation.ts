import { AnnotationData } from "./kd-online-annotation";

const annotationOffline = {
  data: [
    {
      key: 1,
      name: "A. Doanh thu",
      data: [
        {
          key: 1,
          name: "A. Doanh thu",
          description: "Tổng doanh thu của các đơn hàng được tạo qua giao diện POS.",
          formula:
            "= Doanh thu bán lẻ + Doanh thu online facebook + Doanh thu online zalo + Doanh thu đơn đồng phục",
        },
        {
          key: 2,
          name: "Số đơn",
          description: "Số lượng đơn hàng được tạo qua giao diện POS.",
          formula: "Tổng đơn hàng thành công - Tổng đơn trả trong thời gian xét",
        },
        {
          key: 3,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn hàng.",
          formula: "= Doanh thu / Số đơn",
        },
        {
          key: 4,
          name: "Số KM",
          description: "Số lượng khách hàng có đơn mua từ cửa hàng.",
          formula: "Khách mua với đơn hàng có kênh = POS",
        },
        {
          key: 5,
          name: "GTTB/KM",
          description: "Trung bình doanh thu mang lại trên mỗi khách mua.",
          formula: "= Doanh thu / tổng khách mua",
        },
        {
          key: 6,
          name: "A1. DT bán lẻ",
          description: "Tổng doanh thu của các đơn hàng bán lẻ.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 7,
          name: "Số đơn",
          description: "Số lượng đơn hàng bán lẻ được tạo qua giao diện POS.",
          formula: "Tổng đơn hàng thành công - Tổng đơn trả trong thời gian xét",
        },
        {
          key: 8,
          name: "GTTB/KM",
          description: "Trung bình doanh thu mang lại trên mỗi khách mua.",
          formula: "= Doanh thu bán lẻ / tổng khách mua đơn bán lẻ",
        },
        {
          key: 9,
          name: "GTTB/Đơn",
          description: "Trung bình doanh thu mang lại trên mỗi đơn hàng bán lẻ.",
          formula: "= Doanh thu bán lẻ / Số đơn hàng bán lẻ",
        },
        {
          key: 10,
          name: "Khách vào",
          description: "Số lượng khách vào cửa hàng, được nhập lên Unicorn bởi nhân viên.",
          formula: "Số lượng khách vào cửa hàng, được nhập lên Unicorn bởi nhân viên.",
        },
        {
          key: 11,
          name: "TLCĐ",
          description: "Tỉ lệ khách mua hàng trên tổng số khách vào cửa hàng.",
          formula: "= Tổng khách mua / Tổng khách vào",
        },
        {
          key: 12,
          name: "Tổng KM",
          description: "Số lượng khách hàng có đơn mua lẻ tại cửa hàng.",
          formula: "Khách mua với đơn hàng có kênh = POS",
        },
        {
          key: 13,
          name: "A2. DT online Facebook",
          description: "Tổng doanh thu của các đơn hàng đến từ trang Facebook cửa hàng.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 14,
          name: "Lượt follow fanpage",
          description: "Lượt theo dõi của trang Facebook.",
          formula: "Số follow fanpage của cửa hàng tương ứng",
        },
        {
          key: 15,
          name: "A3. DT online Zalo",
          description: "Tổng doanh thu của các đơn hàng đến từ Zalo cửa hàng.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 16,
          name: "A4. DT đồng phục",
          description: "Tổng doanh thu của các đơn hàng được phân loại Đơn đồng phục.",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 17,
          name: "A5. DT đóng hàng Onl",
          description: "Tổng doanh thu của các đơn hàng online lấy kho là tại cửa hàng.",
          formula:
            "= Doanh thu - tiêu điểm - chiết khấu - trả hàng + hoàn điểm + phí ship báo khách",
        },
      ],
    },
    {
      key: 2,
      name: "B. Doanh thu theo khách hàng",
      data: [
        {
          key: 1,
          name: "B. Doanh thu theo khách hàng",
          description:
            '<span data-renderer-mark="true">Tổng doanh thu đến từ khách mua mới và khách mua cũ</span>',
          formula:
            '<p data-renderer-start-pos="6374"><strong data-renderer-mark="true"><span data-renderer-mark="true" data-text-custom-color="#ffffff" class="fabric-text-color-mark" style="--custom-text-color:#ffffff;">= DT KM mới + DT KM cũ</span></strong></p>',
        },
        {
          key: 2,
          name: "B1. DT KM mới",
          description: "Tổng doanh thu đến từ khách mua mới",
          formula:
            '<p data-renderer-start-pos="6479">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="6516">Xét đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="6540">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul>',
        },
        {
          key: 3,
          name: "Số KM mới (HĐ &gt; 0đ)",
          description:
            "Số lượng khách hàng chưa có đơn mua hàng trên hệ thống, đến cửa hàng mua đơn đầu tiên.",
          formula:
            '<p data-renderer-start-pos="6750">Trong khoảng thời gian xét có:</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="6784">Đơn đầu tiên của khách hàng trong hệ thống</p></li><li><p data-renderer-start-pos="6830">[và] Đơn đầu tiên có kênh = POS</p></li><li><p data-renderer-start-pos="6865">[và] Đơn đầu tiên &gt; 0 đồng (Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm)</p></li></ul><p data-renderer-start-pos="6959"><em data-renderer-mark="true">(Số khách mua là unique (duy nhất) trên 1 cửa hàng và trong 1 ngày, cộng dồn hàng ngày và các cửa hàng.)</em></p>',
        },
        {
          key: 4,
          name: "GTTB/KM mới",
          description: "Trung bình doanh thu mang lại trên mỗi khách mua mới",
          formula: '<p data-renderer-start-pos="7161">= DT KM mới / Số KM mới (HĐ &gt; 0đ)</p>',
        },
        {
          key: 5,
          name: "B1.1. CH dưới 1 năm",
          description: "Tổng doanh thu đến từ khách mua mới tại cửa hàng khai trương dưới 1 năm",
          formula:
            '<p data-renderer-start-pos="7319">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="7386">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="2"><li><p data-renderer-start-pos="7423">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="7461">Xét những hoá đơn tại cửa hàng có thời gian khai trương &lt; 1 năm</p></li></ul></li><li><p data-renderer-start-pos="7530">Ví dụ:</p><ul class="ak-ul" data-indent-level="2"><li><p data-renderer-start-pos="7540">CH A khai trương tháng 09/2021<br>CH B khai trương tháng 10/2021<br>CH C khai trương tháng 11/2021</p></li><li><p data-renderer-start-pos="7636">Báo cáo đang xem trong tháng 10/2022 → CH dưới 1 năm bao gồm CH C</p></li></ul></li></ul>',
        },
        {
          key: 6,
          name: "Số KM mới",
          description: "Số lượng khách hàng đến cửa hàng khai trương dưới 1 năm mua đơn đầu tiên.",
          formula:
            '<p data-renderer-start-pos="7827">Tính trên tất cả khách hàng có đơn đầu tiên là đơn kênh POS trong khoảng thời gian xét.</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="7918">Xét trên khách có đơn mua &gt; 0 đồng</p></li></ul>',
        },
        {
          key: 7,
          name: "GTTB/KM mới",
          description:
            "Trung bình doanh thu mang lại trên mỗi khách mua mới từ cửa hàng khai trương dưới 1 năm",
          formula: '<p data-renderer-start-pos="8087">= CH dưới 1 năm / Số KH mới</p>',
        },
        {
          key: 8,
          name: "B1.2. CH 1-2 năm",
          description: "Tổng doanh thu đến từ khách mua mới tại cửa hàng khai trương từ 1-2 năm",
          formula:
            '<p data-renderer-start-pos="8236">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="8303">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="2"><li><p data-renderer-start-pos="8340">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="8378">Xét những hoá đơn tại cửa hàng có thời gian khai trương &gt;= 1 năm và =&lt; 2 năm</p></li></ul></li></ul>',
        },
        {
          key: 9,
          name: "Số KM mới",
          description: "Số lượng khách hàng đến cửa hàng khai trương từ 1-3 năm mua đơn đầu tiên.",
          formula:
            '<p data-renderer-start-pos="8580">Tính trên tất cả khách hàng có đơn đầu tiên là đơn kênh POS trong khoảng thời gian xét.</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="8671">Xét trên khách có đơn mua &gt; 0 đồng</p></li></ul>',
        },
        {
          key: 10,
          name: "GTTB/KM mới",
          description:
            "Trung bình doanh thu mang lại trên mỗi khách mua mới từ cửa hàng khai trương từ 1-3 năm",
          formula: '<p data-renderer-start-pos="8840">= CH 1-2 năm / Số KH mới</p>',
        },
        {
          key: 11,
          name: "B1.3. CH trên 2 năm",
          description: "Tổng doanh thu đến từ khách mua mới tại cửa hàng khai trương trên 3 năm",
          formula:
            '<p data-renderer-start-pos="8989">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="9056">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="2"><li><p data-renderer-start-pos="9093">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="9131">Xét những hoá đơn tại cửa hàng có thời gian khai trương &gt; 2 năm</p></li></ul></li></ul>',
        },
        {
          key: 12,
          name: "Số KM mới",
          description: "Số lượng khách hàng đến cửa hàng khai trương trên 3 năm mua đơn đầu tiên.",
          formula:
            '<p data-renderer-start-pos="9320">Tính trên tất cả khách hàng có đơn đầu tiên là đơn kênh POS trong khoảng thời gian xét.</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="9411">Xét trên khách có đơn mua &gt; 0 đồng</p></li></ul>',
        },
        {
          key: 13,
          name: "GTTB/KM mới",
          description:
            "Trung bình doanh thu mang lại trên mỗi khách mua mới từ cửa hàng khai trương trên 3 năm",
          formula: '<p data-renderer-start-pos="9580">= CH trên 2 năm / Số KH mới</p>',
        },
        {
          key: 14,
          name: "B2. DT KM cũ",
          description: "Tổng doanh thu đến từ khách mua cũ",
          formula:
            '<p data-renderer-start-pos="9688">Doanh thu KM cũ= VIP + Cận VIP + Customer + Shopper + Vãng lai</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="9754">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="2"><li><p data-renderer-start-pos="9791">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="9829">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul></li></ul>',
        },
        {
          key: 15,
          name: "Số KM cũ (HĐ &gt; 0đ)",
          description: "Số lượng khách hàng đã từng mua hàng tại YODY, đến cửa hàng mua thêm.",
          formula:
            '<p data-renderer-start-pos="10023">Trong khoảng thời gian xét có:</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="10057">Đơn = kênh POS, không có đơn đầu tiên của khách hàng</p></li><li><p data-renderer-start-pos="10113">[và] Có ít nhất 1 đơn &gt; 0 đồng (Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm)</p></li></ul><p data-renderer-start-pos="10211"><em data-renderer-mark="true">(Số khách mua là unique (duy nhất) trên 1 cửa hàng và trong 1 ngày, cộng dồn hàng ngày và các cửa hàng.)</em></p>',
        },
        {
          key: 16,
          name: "GTTB/KM cũ",
          description: "Trung bình doanh thu mang lại trên mỗi khách mua cũ",
          formula: '<p data-renderer-start-pos="10411">= DT KM cũ / Số KM cũ</p>',
        },
        {
          key: 17,
          name: "B2.1. DT VIP",
          description: "Tổng doanh thu của các khách hạng VIP",
          formula:
            '<p data-renderer-start-pos="10516">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="10553">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="10591">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul><p data-renderer-start-pos="10658"><strong data-renderer-mark="true">Nhóm VIP:</strong> Tổng Doanh thu tích luỹ &gt;= 10 triệu</p>',
        },
        {
          key: 18,
          name: "DT VIP sinh nhật",
          description: "Tổng doanh thu của các khách hạng VIP sinh nhật",
          formula: '<p data-renderer-start-pos="10801">&nbsp;</p>',
        },
        {
          key: 19,
          name: "Số VIP sinh nhật",
          description: "Số lượng khách hạng VIP có đơn hàng và có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="10920">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="10938">Khách có tổng tiền tích luỹ &gt;= 10 triệu VNĐ</p></li><li><p data-renderer-start-pos="10985">Khách có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 20,
          name: "GTTB/VIP sinh nhật",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng VIP sinh nhật",
          formula: '<p data-renderer-start-pos="11134">= DT VIP sinh nhật / Số VIP sinh nhật</p>',
        },
        {
          key: 21,
          name: "DT VIP thường",
          description: "Tổng doanh thu của các khách hạng VIP thường",
          formula: '<p data-renderer-start-pos="11263">&nbsp;</p>',
        },
        {
          key: 22,
          name: "Số VIP thường",
          description: "Số lượng khách hạng VIP có đơn hàng và không có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="11385">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="11403">Khách có tổng tiền tích luỹ &gt;= 10 triệu VNĐ</p></li><li><p data-renderer-start-pos="11450">Khách không có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 23,
          name: "GTTB/VIP thường",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng VIP thường",
          formula: '<p data-renderer-start-pos="11598">= DT VIP thường / Số VIP thường</p>',
        },
        {
          key: 24,
          name: "B2.2. DT Cận VIP",
          description: "Tổng doanh thu của các khách hạng Cận VIP",
          formula:
            '<p data-renderer-start-pos="11721">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="11758">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="11796">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul><p data-renderer-start-pos="11863"><strong data-renderer-mark="true">Nhóm Cận VIP: </strong>3 triệu =&lt;Tổng Doanh thu tích luỹ &lt; 10 triệu</p>',
        },
        {
          key: 25,
          name: "DT Cận VIP sinh nhật",
          description: "Tổng doanh thu của các khách hạng Cận VIP sinh nhật",
          formula: '<p data-renderer-start-pos="12027">&nbsp;</p>',
        },
        {
          key: 26,
          name: "Số Cận VIP sinh nhật",
          description: "Số lượng khách hạng Cận VIP có đơn hàng và có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="12154">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="12172">Khách có tổng tiền tích luỹ &gt;= 3 triệu VNĐ và &lt; 10 triệu VNĐ</p></li><li><p data-renderer-start-pos="12236">Khách có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 27,
          name: "GTTB/Cận VIP sinh nhật",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Cận VIP sinh nhật",
          formula:
            '<p data-renderer-start-pos="12393">= DT Cận VIP sinh nhật / Số Cận VIP sinh nhật</p>',
        },
        {
          key: 28,
          name: "DT Cận VIP thường",
          description: "Tổng doanh thu của các khách hạng Cận VIP thường",
          formula: '<p data-renderer-start-pos="12538">&nbsp;</p>',
        },
        {
          key: 29,
          name: "Số Cận VIP thường",
          description: "Số lượng khách hạng Cận VIP có đơn hàng và không có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="12668">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="12686">Khách có tổng tiền tích luỹ &gt;= 3 triệu VNĐ và &lt; 10 triệu VNĐ</p></li><li><p data-renderer-start-pos="12750">Khách không có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 30,
          name: "GTTB/Cận VIP thường",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Cận VIP thường",
          formula: '<p data-renderer-start-pos="12906">= DT Cận VIP thường / Số Cận VIP thường</p>',
        },
        {
          key: 31,
          name: "B2.3. DT Customer",
          description: "Tổng doanh thu của các khách hạng Customer",
          formula:
            '<p data-renderer-start-pos="13039">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="13076">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="13114">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul><p data-renderer-start-pos="13181"><strong data-renderer-mark="true">Nhóm Customer:</strong> 1 đồng =&lt; tổng doanh thu &lt; 3 triệu &amp; tổng SL đơn hàng &gt;= 2 (chỉ xét đơn hàng &gt; 0đ)</p>',
        },
        {
          key: 32,
          name: "DT Customer sinh nhật",
          description: "Tổng doanh thu của các khách hạng Customer sinh nhật",
          formula: '<p data-renderer-start-pos="13386">&nbsp;</p>',
        },
        {
          key: 33,
          name: "Số Customer sinh nhật",
          description: "Số lượng khách hạng Customer có đơn hàng và có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="13515">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="13533">Khách có tổng tiền tích luỹ &gt;= 1 VNĐ và &lt; 3 triệu VNĐ</p></li><li><p data-renderer-start-pos="13590">Khách có số đơn hàng (trừ đơn trả) &gt;= 2  (chỉ xét đơn hàng &gt; 0đ)</p></li><li><p data-renderer-start-pos="13658">Khách có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 34,
          name: "GTTB/Customer sinh nhật",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Customer sinh nhật",
          formula:
            '<p data-renderer-start-pos="13817">= DT Customer sinh nhật / Số Customer sinh nhật</p>',
        },
        {
          key: 35,
          name: "DT Customer thường",
          description: "Tổng doanh thu của các khách hạng Customer thường",
          formula: '<p data-renderer-start-pos="13966">&nbsp;</p>',
        },
        {
          key: 36,
          name: "Số Customer thường",
          description: "Số lượng khách hạng Customer có đơn hàng và không có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="14098">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="14116">Khách có tổng tiền tích luỹ &gt;= 1 VNĐ và &lt; 3 triệu VNĐ</p></li><li><p data-renderer-start-pos="14173">Khách có số đơn hàng (trừ đơn trả) &gt;= 2  (chỉ xét đơn hàng &gt; 0đ)</p></li><li><p data-renderer-start-pos="14241">Khách không có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 37,
          name: "GTTB/Customer thường",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Customer thường",
          formula:
            '<p data-renderer-start-pos="14399">= DT Customer thường / Số Customer thường</p>',
        },
        {
          key: 38,
          name: "B2.4. DT Shopper",
          description: "Tổng doanh thu của các khách hạng Shopper",
          formula:
            '<p data-renderer-start-pos="14532">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="14569">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="14607">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul><p data-renderer-start-pos="14674"><strong data-renderer-mark="true">Nhóm Shopper:</strong> 1 đồng =&lt; tổng doanh thu &lt; 3 triệu &amp; tổng SL đơn hàng = 1 (xét đơn hàng &gt; 0đ)</p>',
        },
        {
          key: 39,
          name: "DT Shopper sinh nhật",
          description: "Tổng doanh thu của các khách hạng Shopper sinh nhật",
          formula: '<p data-renderer-start-pos="14871">&nbsp;</p>',
        },
        {
          key: 40,
          name: "Số Shopper sinh nhật",
          description: "Số lượng khách hạng Shopper có đơn hàng và có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="14998">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="15016">Khách có tổng tiền tích luỹ &gt;= 1 VNĐ và &lt; 3 triệu VNĐ</p></li><li><p data-renderer-start-pos="15073">Khách có số đơn hàng (trừ đơn trả) = 1 hoá đơn</p></li><li><p data-renderer-start-pos="15123">Khách có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 41,
          name: "GTTB/Shopper sinh nhật",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Shopper sinh nhật",
          formula:
            '<p data-renderer-start-pos="15280">= DT Shopper sinh nhật / Số Shopper sinh nhật</p>',
        },
        {
          key: 42,
          name: "DT Shopper thường",
          description: "Tổng doanh thu của các khách hạng Shopper thường",
          formula: '<p data-renderer-start-pos="15425">&nbsp;</p>',
        },
        {
          key: 43,
          name: "Số Shopper thường",
          description: "Số lượng khách hạng Shopper có đơn hàng và không có sinh nhật trong tháng",
          formula:
            '<p data-renderer-start-pos="15555">Điều kiện [và]</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="15573">Khách có tổng tiền tích luỹ &gt;= 1 VNĐ và &lt; 3 triệu VNĐ</p></li><li><p data-renderer-start-pos="15630">Khách có số đơn hàng (trừ đơn trả) = 1 hoá đơn</p></li><li><p data-renderer-start-pos="15680">Khách không có sinh nhật trong tháng</p></li></ul>',
        },
        {
          key: 44,
          name: "GTTB/Shopper thường",
          description: "Trung bình doanh thu mang lại trên mỗi khách hạng Shopper thường",
          formula: '<p data-renderer-start-pos="15836">= DT Shopper thường / Số Shopper thường</p>',
        },
        {
          key: 45,
          name: "B2.5. DT vãng lai",
          description: "Tổng doanh thu của các khách vãng lai",
          formula:
            '<p data-renderer-start-pos="15964">Tính trên tất cả đơn tạo kênh POS</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="16001">Xét trên khách có đơn mua &gt; 0 đồng</p></li><li><p data-renderer-start-pos="16039">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p></li></ul>',
        },
        {
          key: 46,
          name: "Số khách vãng lai",
          description:
            "Số khách hàng có lần mua cuối ở vùng khác hoặc ở chi nhánh, trong tháng này đến mua hàng tại vùng mình.",
          formula:
            '<p data-renderer-start-pos="16264">Trong khoảng thời gian xét có:</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="16298">Đơn = kênh POS, không có đơn đầu tiên của khách hàng</p></li><li><p data-renderer-start-pos="16354">Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm &gt; 0 đồng</p></li></ul>',
        },
        {
          key: 47,
          name: "GTTB/Khách vãng lai",
          description: "Trung bình doanh thu mang lại trên mỗi khách vãng lai",
          formula: '<p data-renderer-start-pos="16533">= DT vãng lai / Số khách vãng lai</p>',
        },
      ],
    },
    {
      key: 3,
      name: "C. Doanh thu theo sản phẩm",
      data: [
        {
          key: 1,
          name: "C. Doanh thu theo sản phẩm",
          description: "Tổng doanh thu của các đơn hàng được tạo qua giao diện POS",
          formula: "= Tổng doanh thu của các nhóm sản phẩm thành phần",
        },
        {
          key: 2,
          name: "Kid",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Kid",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 3,
          name: "Basic nam",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Basic nam",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 4,
          name: "Basic nữ",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Basic nữ",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 5,
          name: "Phao gió",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Phao gió",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 6,
          name: "Yody Good",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Yody Good",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 7,
          name: "Polo",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Polo",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 8,
          name: "Phụ kiện",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Phụ kiện",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 9,
          name: "Office nữ",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Office nữ",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 10,
          name: "Office nam",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Office nam",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 11,
          name: "Jean",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Jean",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
        {
          key: 12,
          name: "Yo sport",
          description: "Tổng doanh thu của các sản phẩm trong nhóm Yo sport",
          formula: "= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm",
        },
      ],
    },
    {
      key: 4,
      name: "D. Lợi nhuận",
      data: [
        {
          key: 1,
          name: "D. Lợi nhuận",
          description: "Lợi nhuận gộp tính trên doanh thu thành công và tiền vốn.",
          formula:
            '<p data-renderer-start-pos="922">= Doanh thu thành công - Tiền vốn</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="959">Xét trên các đơn hàng kênh POS và đơn đóng hàng online</p></li></ul>',
        },
        {
          key: 2,
          name: "Doanh thu thành công",
          description:
            "Tổng doanh thu của các đơn hàng được tạo qua giao diện POS và đơn hàng online lấy kho là tại cửa hàng.",
          formula:
            '<p data-renderer-start-pos="1210">= Tổng bán - tổng chiết khấu - tiêu điểm - tổng trả + hoàn điểm</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="1277">Xét trên các đơn hàng kênh POS và đơn đóng hàng online</p></li></ul>',
        },
        {
          key: 3,
          name: "Tiền vốn",
          description: "Tổng giá vốn tính trên số lượng sản phẩm thực bán.",
          formula:
            '<p data-renderer-start-pos="1449">= Giá vốn * SL hàng thực bán</p><ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="1481">Xét trên các đơn hàng kênh POS và đơn đóng hàng online</p></li></ul>',
        },
      ],
    },
    {
      key: 5,
      name: "E. Điểm NPS",
      data: [
        {
          key: 1,
          name: "Điểm NPS",
          description: "Chỉ số đánh giá mức độ hài lòng của khách hàng.",
          formula:
            '<ul class="ak-ul" data-indent-level="1"><li><p data-renderer-start-pos="1429">NPS = (“Số người đánh giá 9-10” - “Số người đánh giá 0-6”) / “Tổng số người đánh giá” * 100%</p></li><li><p data-renderer-start-pos="1525">NPS có thể âm </p></li></ul>',
        },
        {
          key: 2,
          name: "Số người đánh giá 9-10",
          description: "Số khách hàng đánh giá dịch vụ từ 9 đến 10 điểm.",
          formula: "",
        },
        {
          key: 3,
          name: "Số người đánh giá 0-6",
          description: "Số khách hàng đánh giá dịch vụ từ 0 đến 6 điểm.",
          formula: "",
        },
        {
          key: 4,
          name: "Số người đánh giá 7-8",
          description: "Số khách hàng đánh giá dịch vụ từ 7 đến 8 điểm.",
          formula: "",
        },
      ],
    },
  ],
  documentLink:
    "https://yody.atlassian.net/wiki/spaces/YODY/pages/387153921/Keydriver+Online+M+t+ch+s",
};

export const initialAnnotationOffline: AnnotationData = {
  ...annotationOffline,
  data: annotationOffline.data.map((item) => {
    return {
      ...item,
      data: item.data.map((i) => {
        return {
          ...i,
          normalize: i.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase(),
        };
      }),
    };
  }),
};
