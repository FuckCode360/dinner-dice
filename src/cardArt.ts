export interface CardArtwork {
  id: string;
  label: string;
  keywords: RegExp;
}

export const defaultArtworkId = "curry-rice";

export const cardArtworks: CardArtwork[] = [
  { id: "curry-rice", label: "咖喱饭", keywords: /咖喱|盖饭|米饭|饭|拌饭/ },
  { id: "bento", label: "便当", keywords: /便当|盒饭|套餐/ },
  { id: "beef-noodles", label: "牛肉面", keywords: /牛肉面|面|拉面|乌冬|拌面/ },
  { id: "rice-noodle", label: "米粉", keywords: /粉|米线|河粉|粉丝|酸辣粉/ },
  { id: "hotpot", label: "火锅", keywords: /火锅|冒菜|麻辣烫|关东煮|锅/ },
  { id: "stir-fry", label: "小炒", keywords: /小炒|炒菜|炒|下饭/ },
  { id: "salad", label: "轻食沙拉", keywords: /轻食|沙拉|健康|低卡|蔬菜/ },
  { id: "sushi", label: "寿司", keywords: /寿司|日料|日式|刺身|丼/ },
  { id: "dumplings", label: "饺子", keywords: /饺子|水饺|馄饨|云吞|锅贴/ },
  { id: "dim-sum", label: "早茶", keywords: /早茶|早餐|早点|包子|烧卖|烧麦|豆浆|虾饺/ },
  { id: "burger", label: "汉堡", keywords: /汉堡|麦当劳|肯德基|塔可/ },
  { id: "pizza", label: "披萨", keywords: /披萨|pizza|意式/ },
  { id: "bbq", label: "烧烤", keywords: /烧烤|烤串|烤肉|串/ },
  { id: "fried-chicken", label: "炸鸡", keywords: /炸鸡|炸|鸡排|鸡腿|鸡翅/ },
  { id: "seafood", label: "海鲜", keywords: /海鲜|鱼|虾|蟹|贝|生蚝/ },
  { id: "soup", label: "汤羹", keywords: /汤|羹|炖|砂锅/ },
  { id: "porridge", label: "粥", keywords: /粥|稀饭/ },
  { id: "dessert", label: "甜品", keywords: /甜品|蛋糕|奶茶|冰淇淋|糖水/ },
  { id: "coffee", label: "咖啡", keywords: /咖啡|拿铁|美式|茶饮|饮品/ },
  { id: "mala", label: "麻辣碗", keywords: /麻辣|川菜|水煮|辣子|钵钵/ },
  { id: "home-cooking", label: "家常菜", keywords: /家常|粤菜|湘菜|小馆/ },
];

export function getArtwork(artworkId?: string) {
  return cardArtworks.find((item) => item.id === artworkId) ?? cardArtworks[0];
}

export function artworkSrc(artworkId?: string) {
  return `${import.meta.env.BASE_URL}card-art/${getArtwork(artworkId).id}.jpg`;
}

export function inferArtworkId(input: { name?: string; category?: string; artworkId?: string }) {
  if (cardArtworks.some((item) => item.id === input.artworkId)) return input.artworkId as string;
  const text = `${input.name || ""}${input.category || ""}`;
  return cardArtworks.find((item) => item.keywords.test(text))?.id ?? defaultArtworkId;
}
