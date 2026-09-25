/**
 * Cấu hình dữ liệu trò chơi: 9 Đảo, Boss, Thẻ Bài và Hệ thống Pet
 */

const ISLANDS_DATA = [
  { id: 1, name: "Đảo Ngọn Cỏ", status: "open", desc: "Hiệu ứng khu vực: Khi hồi máu sẽ nhận thêm 50% hiệu quả hồi phục." },
  { id: 2, name: "Đảo Hỏa Diệm", status: "locked", desc: "Yêu cầu cấp độ 15. Khu vực thiêu đốt." },
  { id: 3, name: "Đảo Băng Ngưng", status: "locked", desc: "Yêu cầu cấp độ 25. Khu vực làm chậm." },
  { id: 4, name: "Đảo Sa Mạc", status: "locked", desc: "Yêu cầu cấp độ 35. Bão cát cản trở." },
  { id: 5, name: "Đảo Lôi Vân", status: "locked", desc: "Yêu cầu cấp độ 45. Thiên lôi kích động." },
  { id: 6, name: "Đảo Thủy Triều", status: "locked", desc: "Yêu cầu cấp độ 55. Kháng hiệu ứng tiêu cực." },
  { id: 7, name: "Đảo Hắc Ám", status: "locked", desc: "Yêu cầu cấp độ 65. Hút sinh lực." },
  { id: 8, name: "Đảo Hoàng Kim", status: "locked", desc: "Yêu cầu cấp độ 75. Uy lực nguyên tố." },
  { id: 9, name: "Đảo Tinh Không", status: "locked", desc: "Yêu cầu cấp độ 90. Trận chung kết Cửu Giới." }
];

// Danh sách 6 đối thủ tại Đảo 1 (Đảo Ngọn Cỏ)
const MAP1_MONSTERS = [
  {
    id: "m1_1",
    slot: 1,
    name: "Chồi Non Tinh Nghịch",
    icon: "fa-leaf",
    color: "#22c55e",
    hp: 220,
    atk: 18,
    def: 4,
    rewardGold: 30,
    petDrop: { name: "Chồi Non Bé Nhỏ", hp: 45, atk: 4, def: 2 }
  },
  {
    id: "m1_2",
    slot: 2,
    name: "Bọ Gai Cỏ Xanh",
    icon: "fa-bug",
    color: "#16a34a",
    hp: 480,
    atk: 26,
    def: 8,
    rewardGold: 60,
    petDrop: { name: "Bọ Gai Nhỏ", hp: 80, atk: 7, def: 4 }
  },
  {
    id: "m1_3",
    slot: 3,
    name: "Hoa Gai Đầm Lầy",
    icon: "fa-seedling",
    color: "#ec4899",
    hp: 950,
    atk: 36,
    def: 12,
    rewardGold: 100,
    petDrop: { name: "Hoa Gai Con", hp: 130, atk: 11, def: 6 }
  },
  {
    id: "m1_4",
    slot: 4,
    name: "Mộc Linh Thảo Cổ",
    icon: "fa-tree",
    color: "#84cc16",
    hp: 2100,
    atk: 52,
    def: 18,
    rewardGold: 180,
    petDrop: { name: "Mộc Linh Con", hp: 200, atk: 16, def: 9 }
  },
  {
    id: "m1_5",
    slot: 5,
    name: "Hộ Vệ Thụ Tinh",
    icon: "fa-shield-cat",
    color: "#15803d",
    hp: 4500,
    atk: 74,
    def: 26,
    rewardGold: 300,
    petDrop: { name: "Thụ Tinh Vệ", hp: 320, atk: 22, def: 14 }
  },
  {
    id: "m1_6",
    slot: 6,
    isBoss: true,
    name: "Chúa Tể Thảo Mộc - Qing",
    icon: "fa-crown",
    color: "#eab308",
    hp: 10000,
    atk: 100,
    def: 10,
    rewardGold: 1000,
    rewardTickets: 3,
    rewardPoints: 80,
    // Kỹ năng đặc biệt của Boss Qing
    skill: {
      type: "grass_fund",
      name: "Quỹ Ngọn Cỏ",
      rechargeTime: 20, // 20s cooldown
      healDuration: 5   // 5s duration
    },
    petDrop: { name: "Tiểu Qing", hp: 550, atk: 35, def: 18 }
  }
];

// Hệ thống thẻ bài ma pháp huy hiệu (Dùng ký hiệu và màu nguyên tố)
const CARDS_DATABASE = [
  {
    id: "card_basic_atk",
    name: "Huy Hiệu Trảm Kích",
    element: "fire",
    color: "#f87171",
    icon: "fa-bolt",
    desc: "+8 ATK khi xung trận",
    statBonus: { atk: 8, def: 0, hp: 0 }
  },
  {
    id: "card_basic_def",
    name: "Huy Hiệu Khiên Đất",
    element: "earth",
    color: "#fbbf24",
    icon: "fa-shield",
    desc: "+8 DEF kiên cố",
    statBonus: { atk: 0, def: 8, hp: 0 }
  },
  {
    id: "card_basic_hp",
    name: "Huy Hiệu Thảo Mộc",
    element: "grass",
    color: "#4ade80",
    icon: "fa-clover",
    desc: "+120 Max HP",
    statBonus: { atk: 0, def: 0, hp: 120 }
  },
  {
    id: "card_qing_grass",
    name: "Huy Hiệu Qing: Quỹ Ngọn Cỏ",
    element: "grass_gold",
    color: "#eab308",
    icon: "fa-wand-magic-sparkles",
    desc: "Khi bị đánh tích 10-35% Quỹ. Đủ 100% hồi 5% HP/s trong 5s (+20% ATK, +40% DEF). CD: 20s.",
    special: "qing_passive",
    statBonus: { atk: 15, def: 10, hp: 300 }
  }
];
