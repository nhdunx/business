// baidata.js (dữ liệu bài học từ vựng tiếng Trung)
// Cấu trúc: [hanzi, pinyin, meaning, ex_hanzi, ex_pinyin, ex_viet, tu_loai]

const _BAI_RAW = {
    
  "bai1": [
    ["刷卡", "shuā kǎ", "quẹt thẻ", "如果你没有带现金，刷卡也可以。", "Rúguǒ nǐ méiyǒu dài xiànjīn, shuākǎ yě kěyǐ.", "Nếu bạn không mang theo tiền mặt, quẹt thẻ cũng được.", "Động từ"],
    ["付", "fù", "trả / thanh toán", "这顿饭我已经付过钱了，你别跟我客气。", "Zhè dùn fàn wǒ yǐjīng fù guò qián le, nǐ bié gēn wǒ kèqi.", "Bữa ăn này tôi đã trả tiền rồi, bạn đừng khách sáo với tôi.", "Động từ"],
    ["现金", "xiànjīn", "tiền mặt", "现在很多人出门都不带现金了。", "Xiànzài hěn duō rén chūmén dōu búdài xiànjīn le.", "Bây giờ rất nhiều người ra khỏi nhà đều không mang theo tiền mặt nữa.", "Danh từ"],
    ["微信", "wēixìn", "WeChat", "我们加个微信吧，以后方便联系。", "Wǒmen jiā gè wēixìn ba, yǐhòu fāngbiàn liánxì.", "Chúng ta kết bạn WeChat đi, sau này thuận tiện liên lạc.", "Danh từ"],
    ["支付宝", "zhīfùbǎo", "Alipay", "你可以用支付宝或者微信支付，都很方便。", "Nǐ kěyǐ yòng zhīfùbǎo huòzhě wēixìn zhīfù, dōu hěn fāngbiàn.", "Bạn có thể dùng Alipay hoặc WeChat Pay, đều rất tiện lợi.", "Danh từ"],
    ["先生", "xiānsheng", "ông / ngài", "这位先生，请问您需要点什么喝的？", "Zhè wèi xiānsheng, qǐngwèn nín xūyào diǎn shénme hē de?", "Thưa ngài, xin hỏi ngài cần uống chút gì không?", "Danh từ"],
    ["余额", "yú'é", "số dư", "你的银行卡余额好像不够买这台电脑。", "Nǐ de yínhángkǎ yú'é hǎoxiàng bú gòu mǎi zhè tái diànnǎo.", "Số dư thẻ ngân hàng của bạn hình như không đủ để mua chiếc máy tính này.", "Danh từ"],
    ["足", "zú", "đủ", "因为准备时间不足，这个节目表现得不太好。", "Yīnwèi zhǔnbèi shíjiān bù zú, zhège jiémù biǎoxiàn de bú tài hǎo.", "Bởi vì thời gian chuẩn bị không đủ, tiết mục này biểu diễn không được tốt lắm.", "Tính từ"],
    ["会员", "huìyuán", "hội viên", "如果你办一张会员卡，就能打八折。", "Rúguǒ nǐ bàn yì zhāng huìyuánkǎ, jiù néng dǎ bā zhé.", "Nếu bạn làm một tấm thẻ hội viên, thì có thể được giảm giá 20%.", "Danh từ"],
    ["当天", "dàngtiān", "trong ngày", "买完东西后，他们会保证当天给你送过来。", "Mǎi wán dōngxi hòu, tāmen huì bǎozhèng dàngtiān gěi nǐ sòng guòlái.", "Sau khi mua đồ xong, họ sẽ đảm bảo giao hàng đến cho bạn ngay trong ngày.", "Danh từ"],
    ["购物", "gòuwù", "mua sắm", "相比在网上购物，她更喜欢去大商场买东西。", "Xiāngbǐ zài wǎngshàng gòuwù, tā gèng xǐhuan qù dà shāngchǎng mǎi dōngxi.", "So với việc mua sắm trên mạng, cô ấy càng thích đến trung tâm thương mại lớn mua đồ hơn.", "Động từ"],
    ["累计", "lěijì", "tích lũy / cộng dồn", "只要你在我们店累计消费满一千元，就能得到一个小礼物。", "Zhǐyào nǐ zài wǒmen diàn lěijì xiāofèi mǎn yì qiān yuán, jiù néng dédào yí gè xiǎo lǐwù.", "Chỉ cần bạn chi tiêu tích lũy tại cửa hàng chúng tôi đủ 1000 tệ, liền có thể nhận được một món quà nhỏ.", "Động từ"],
    ["凭", "píng", "dựa vào / căn cứ vào", "顾客可以凭今天的购物小票去一楼换取礼品。", "Gùkè kěyǐ píng jīntiān de gòuwù xiǎopiào qù yī lóu huànqǔ lǐpǐn.", "Khách hàng có thể dựa vào hóa đơn mua sắm ngày hôm nay để đến tầng một đổi lấy quà tặng.", "Động từ"],
    ["小票", "xiǎopiào", "hóa đơn / biên lai", "先生，请拿好您的小票，欢迎下次再来！", "Xiānsheng, qǐng ná hǎo nín de xiǎopiào, huānyíng xià cì zài lái!", "Thưa ngài, xin hãy giữ kỹ hóa đơn, hoan nghênh lần sau lại đến!", "Danh từ"],
    ["可以", "kěyǐ", "có thể", "虽然天气不太好，但我们还是可以出去散步。", "Suīrán tiānqì bú tài hǎo, dàn wǒmen háishi kěyǐ chūqù sànbù.", "Mặc dù thời tiết không tốt lắm, nhưng chúng ta vẫn có thể ra ngoài đi dạo.", "Động từ năng nguyện"],
    ["免费", "miǎnfèi", "miễn phí", "这家酒店不仅环境好，而且提供免费的早餐。", "Zhè jiā jiǔdiàn bùjǐn huánjìng hǎo, érqiě tígōng miǎnfèi de zǎocān.", "Khách sạn này không những môi trường tốt, mà còn cung cấp bữa sáng miễn phí.", "Động từ / Tính từ"],
    ["享受", "xiǎngshòu", "tận hưởng / hưởng thụ", "周末的时候，我喜欢一边喝咖啡，一边享受安静的时间。", "Zhōumò de shíhou, wǒ xǐhuan yìbiān hē kāfēi, yìbiān xiǎngshòu ānjìng de shíjiān.", "Vào dịp cuối tuần, tôi thích vừa uống cà phê, vừa tận hưởng khoảng thời gian yên tĩnh.", "Động từ"]
  ],
  "bai2": [],
  "bai3": [],
  "bai4": [],
  "bai5": [],
  "bai6": [],
  "bai7": [],
  "bai8": [],
  "bai9": [],
  "bai10": [],
  "bai11": [],
  "bai12": [],
  "bai13": [],
  "bai14": [],


}
const BAI_DATA = Object.fromEntries(Object.entries(_BAI_RAW).map( ([k,v]) => [k, v.map( ([hanzi,pinyin,meaning,ex_hanzi,ex_pinyin,ex_viet,tu_loai]) => ({
    hanzi,
    pinyin,
    meaning,
    ex_hanzi,
    ex_pinyin,
    ex_viet,
    tu_loai
}))]));

if (typeof module !== "undefined")
    module.exports = {
        BAI_DATA
    };
