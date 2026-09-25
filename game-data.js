/**
 * Dữ liệu 9 Đảo, 6 Quái/Boss Đảo Ngọn Cỏ & Bộ Huy Hiệu Thẻ Bài
 */

const ISLANDS_DATA = [
  { id: 1, name: "Đảo Ngọn Cỏ", status: "open", desc: "Khu vực thảo mộc: Tăng 50% hiệu quả toàn bộ kỹ năng và hiệu ứng hồi máu." },
  { id: 2, name: "Đảo Hỏa Diệm", status: "locked", desc: "Yêu cầu cấp 15." },
  { id: 3, name: "Đảo Băng Ngưng", status: "locked", desc: "Yêu cầu cấp 25." },
  { id: 4, name: "Đảo Sa Mạc", status: "locked", desc: "Yêu cầu cấp 35." },
  { id: 5, name: "Đảo Lôi Vân", status: "locked", desc: "Yêu cầu cấp 45." },
  { id: 6, name: "Đảo Thủy Triều", status: "locked", desc: "Yêu cầu cấp 55." },
  { id: 7, name: "Đảo Hắc Ám", status: "locked", desc: "Yêu cầu cấp 65." },
  { id: 8, name: "Đảo Hoàng Kim", status: "locked", desc: "Yêu cầu cấp 75." },
  { id: 9, name: "Đảo Tinh Không", status: "locked", desc: "Yêu cầu cấp 90." }
];

// 6 quái vật/Boss tại Đảo Ngọn Cỏ với hình động GIF Showdown
const MAP1_MONSTERS = [
  {
    id: "m1_1",
    slot: 1,
    name: "Chồi Non Tinh Nghịch",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/152.gif",
    hp: 220,
    atk: 18,
    def: 4,
    rewardGold: 30,
    petDrop: { name: "Chồi Non Nhỏ", hp: 50, atk: 4, def: 2 }
  },
  {
    id: "m1_2",
    slot: 2,
    name: "Bọ Gai Cỏ Xanh",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/10.gif",
    hp: 480,
    atk: 26,
    def: 8,
    rewardGold: 60,
    petDrop: { name: "Bọ Gai Nhỏ", hp: 90, atk: 8, def: 4 }
  },
  {
    id: "m1_3",
    slot: 3,
    name: "Hoa Gai Đầm Lầy",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/45.gif",
    hp: 950,
    atk: 36,
    def: 12,
    rewardGold: 110,
    petDrop: { name: "Hoa Gai Nhỏ", hp: 140, atk: 12, def: 6 }
  },
  {
    id: "m1_4",
    slot: 4,
    name: "Mộc Linh Thảo Cổ",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/182.gif",
    hp: 2100,
    atk: 52,
    def: 18,
    rewardGold: 190,
    petDrop: { name: "Tiểu Mộc Linh", hp: 220, atk: 17, def: 9 }
  },
  {
    id: "m1_5",
    slot: 5,
    name: "Hộ Vệ Thụ Tinh",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/389.gif",
    hp: 4500,
    atk: 74,
    def: 26,
    rewardGold: 320,
    petDrop: { name: "Thụ Tinh Vệ", hp: 350, atk: 24, def: 15 }
  },
  {
    id: "m1_6",
    slot: 6,
    isBoss: true,
    name: "Boss Qing (Chúa Tể Ngọn Cỏ)",
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/254.gif",
    hp: 10000,
    atk: 100,
    def: 10,
    rewardGold: 1000,
    rewardTickets: 3,
    rewardPoints: 80,
    skill: {
      type: "grass_fund",
      name: "Quỹ Ngọn Cỏ",
      rechargeTime: 20,
      healDuration: 5
    },
    petDrop: { name: "Hóa Thân Qing", hp: 600, atk: 38, def: 18 }
  }
];

// Danh sách Huy Hiệu Thẻ Bài (Rune/Biểu tượng, không để hình Pet)
const CARDS_DATABASE = [
  {
    id: "card_fire_strike",
    name: "Huy Hiệu Liệt Hỏa",
    elementClass: "elem-fire",
    icon: "fa-fire-flame-curved",
    color: "#ef4444",
    desc: "+10 ATK uy lực",
    statBonus: { atk: 10, def: 0, hp: 0 }
  },
  {
    id: "card_earth_wall",
    name: "Huy Hiệu Nham Thạch",
    elementClass: "elem-earth",
    icon: "fa-shield",
    color: "#f59e0b",
    desc: "+10 DEF kiên cố",
    statBonus: { atk: 0, def: 10, hp: 0 }
  },
  {
    id: "card_life_bloom",
    name: "Huy Hiệu Sinh Mệnh",
    elementClass: "elem-grass",
    icon: "fa-clover",
    color: "#22c55e",
    desc: "+150 Max HP",
    statBonus: { atk: 0, def: 0, hp: 150 }
  },
  {
    id: "card_wind_slash",
    name: "Huy Hiệu Phong Kích",
    elementClass: "elem-grass",
    icon: "fa-wind",
    color: "#10b981",
    desc: "+15 ATK & +5 DEF",
    statBonus: { atk: 15, def: 5, hp: 0 }
  },
  {
    id: "card_qing_grass",
    name: "Huy Hiệu Boss Qing",
    elementClass: "elem-gold",
    icon: "fa-crown",
    color: "#eab308",
    desc: "+350 HP, +20 ATK, +15 DEF. Ban tặng uy áp thảo mộc.",
    statBonus: { atk: 20, def: 15, hp: 350 }
  }
];
