import { ChangeEvent, CSSProperties, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  BookOpen,
  ChefHat,
  Clock3,
  Dice5,
  Download,
  Flame,
  History,
  Leaf,
  ListPlus,
  MapPin,
  Pencil,
  RefreshCcw,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  WalletCards,
} from "lucide-react";
import { matchesFilters, rollDinner } from "./dice";
import {
  createBackup,
  loadHistory,
  loadRestaurants,
  parseBackup,
  saveHistory,
  saveRestaurants,
} from "./storage";
import type { DinnerHistory, Filters, MealMode, Restaurant, SpicePreference } from "./types";
import tavernBg from "./assets/theme-tavern.png";
import candyBg from "./assets/theme-candy.png";
import cosmicBg from "./assets/theme-cosmic.png";

type View = "roll" | "library" | "history" | "settings";
type ThemeId = "tavern" | "candy" | "cosmic";
type Draft = Omit<Restaurant, "id" | "createdAt" | "updatedAt" | "lastEatenAt">;

interface ThemeConfig {
  id: ThemeId;
  name: string;
  nav: string;
  subtitle: string;
  sourceLabel: string;
  action: string;
  cost: string;
  cardWord: string;
  background: string;
}

const themes: ThemeConfig[] = [
  {
    id: "tavern",
    name: "食运占卜",
    nav: "占卜",
    subtitle: "今日食运占卜",
    sourceLabel: "食源池",
    action: "揭晓今日任务",
    cost: "今日剩余 1 次",
    cardWord: "任务",
    background: tavernBg,
  },
  {
    id: "candy",
    name: "午晚餐命运",
    nav: "扭蛋",
    subtitle: "今天的午晚餐命运",
    sourceLabel: "收藏夹",
    action: "抽取推荐",
    cost: "每日 0/3",
    cardWord: "推荐",
    background: candyBg,
  },
  {
    id: "cosmic",
    name: "今日饭运",
    nav: "召唤",
    subtitle: "抽一张今日饭运",
    sourceLabel: "来源池",
    action: "召唤今日晚餐",
    cost: "我的饭运卡：3 张",
    cardWord: "饭运卡",
    background: cosmicBg,
  },
];

const emptyDraft: Draft = {
  name: "",
  category: "",
  mode: "dine-in",
  budget: 35,
  distanceMinutes: 15,
  health: 3,
  spice: 1,
  weight: 3,
  note: "",
  enabled: true,
};

const demoRestaurants: Restaurant[] = [
  makeRestaurant({ name: "楼下盖饭", category: "快饭", budget: 28, distanceMinutes: 8, health: 2, spice: 1, weight: 4 }),
  makeRestaurant({ name: "清爽轻食碗", category: "轻食", mode: "delivery", budget: 42, distanceMinutes: 25, health: 5, spice: 0, weight: 3 }),
  makeRestaurant({ name: "川味小炒", category: "川菜", budget: 55, distanceMinutes: 18, health: 2, spice: 3, weight: 5 }),
  makeRestaurant({ name: "牛肉粉", category: "粉面", budget: 32, distanceMinutes: 12, health: 3, spice: 2, weight: 4 }),
  makeRestaurant({ name: "日式便当", category: "便当", mode: "delivery", budget: 48, distanceMinutes: 30, health: 4, spice: 0, weight: 3 }),
];

const defaultFilters: Filters = {
  maxBudget: 60,
  maxDistance: 30,
  minHealth: 1,
  spicePreference: "any",
  mode: "either",
};

export default function App() {
  const [view, setView] = useState<View>("roll");
  const [themeId, setThemeId] = useState<ThemeId>(() => (localStorage.getItem("dinner-dice:v1:theme") as ThemeId) || "tavern");
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => loadRestaurants());
  const [history, setHistory] = useState<DinnerHistory[]>(() => loadHistory());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [isSummoning, setIsSummoning] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);
  const summonTimer = useRef<number | null>(null);

  const theme = themes.find((item) => item.id === themeId) ?? themes[0];
  const isRollView = view === "roll";
  const themeStyle = {
    "--theme-bg": isRollView ? `url(${theme.background})` : "linear-gradient(180deg, #171019, #09070d)",
  } as CSSProperties;
  const candidates = useMemo(() => restaurants.filter((item) => matchesFilters(item, filters)), [filters, restaurants]);
  const picked = restaurants.find((item) => item.id === pickedId) ?? null;
  const recent = history.slice(0, 6);

  useEffect(() => saveRestaurants(restaurants), [restaurants]);
  useEffect(() => saveHistory(history), [history]);
  useEffect(() => localStorage.setItem("dinner-dice:v1:theme", themeId), [themeId]);
  useEffect(() => {
    return () => {
      if (summonTimer.current) window.clearTimeout(summonTimer.current);
    };
  }, []);

  function handleRoll() {
    if (isSummoning) return;
    if (summonTimer.current) window.clearTimeout(summonTimer.current);
    const result = rollDinner(restaurants, filters);
    setIsSummoning(true);
    setNotice(result.restaurant ? "饭运召唤中..." : "正在翻找卡池...");
    summonTimer.current = window.setTimeout(() => {
      setPickedId(result.restaurant?.id ?? null);
      setNotice(result.restaurant ? `${result.candidates.length} 个候选里抽到了它` : "没有符合条件的选项");
      setIsSummoning(false);
      summonTimer.current = null;
    }, 860);
  }

  function markEaten(restaurant: Restaurant) {
    const eatenAt = new Date().toISOString();
    setRestaurants((items) =>
      items.map((item) => (item.id === restaurant.id ? { ...item, lastEatenAt: eatenAt, updatedAt: eatenAt } : item)),
    );
    setHistory((items) => [
      {
        id: crypto.randomUUID(),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        eatenAt,
      },
      ...items,
    ]);
    setNotice("已记入最近抽到");
  }

  function submitRestaurant(event: FormEvent) {
    event.preventDefault();
    const clean = { ...draft, name: draft.name.trim(), category: draft.category.trim(), note: draft.note.trim() };
    if (!clean.name) {
      setNotice("先写一个名字");
      return;
    }

    const now = new Date().toISOString();
    if (editingId) {
      setRestaurants((items) => items.map((item) => (item.id === editingId ? { ...item, ...clean, updatedAt: now } : item)));
      setEditingId(null);
      setNotice("已更新卡册");
    } else {
      setRestaurants((items) => [makeRestaurant(clean), ...items]);
      setNotice("已加入卡册");
    }
    setDraft(emptyDraft);
  }

  function editRestaurant(item: Restaurant) {
    setDraft({
      name: item.name,
      category: item.category,
      mode: item.mode,
      budget: item.budget,
      distanceMinutes: item.distanceMinutes,
      health: item.health,
      spice: item.spice,
      weight: item.weight,
      note: item.note,
      enabled: item.enabled,
    });
    setEditingId(item.id);
    setView("library");
  }

  function removeRestaurant(id: string) {
    setRestaurants((items) => items.filter((item) => item.id !== id));
    if (pickedId === id) setPickedId(null);
    setNotice("已删除");
  }

  function fillDemo() {
    setRestaurants((items) => [...demoRestaurants, ...items]);
    setNotice("已填入 5 张示例卡");
  }

  function relaxFilters() {
    setFilters({ maxBudget: 120, maxDistance: 60, minHealth: 1, spicePreference: "any", mode: "either" });
    setNotice("已放宽抽卡条件");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(createBackup(restaurants, history), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dinner-dice-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = parseBackup(await file.text());
      setRestaurants(payload.restaurants);
      setHistory(payload.history);
      setPickedId(null);
      setNotice("备份已导入");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "导入失败");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className={`app-shell ${isRollView ? `theme-${theme.id}` : "theme-neutral"}`} style={themeStyle}>
      <section className="draw-stage">
        <header className="hero-bar">
          <div className="title-lockup">
            <h1>今天吃什么</h1>
            <p>
              <Sparkles size={15} />
              {isRollView ? theme.subtitle : subtitleForView(view)}
              <Sparkles size={15} />
            </p>
          </div>
        </header>

        {notice && <div className="notice">{notice}</div>}

        {view === "roll" && (
          <>
            <section className="filter-console">
              <div className="filter-grid">
                <FilterChip icon={<WalletCards size={18} />} label="预算" value={`¥${filters.maxBudget}内`} />
                <FilterChip icon={<MapPin size={18} />} label="距离" value={`${filters.maxDistance}分钟内`} />
                <FilterChip icon={<Leaf size={18} />} label="健康度" value={filters.minHealth <= 1 ? "不限" : `${filters.minHealth}/5起`} />
                <FilterChip icon={<Flame size={18} />} label="辣度" value={spicePreferenceLabel(filters.spicePreference)} />
              </div>
              <Segmented
                label={theme.sourceLabel}
                value={filters.mode}
                options={[
                  ["either", "全部"],
                  ["dine-in", "堂食"],
                  ["delivery", "外卖"],
                ]}
                onChange={(value) => setFilters({ ...filters, mode: value as MealMode })}
              />
            </section>

            <section className={isSummoning ? "summon-panel is-summoning" : "summon-panel"}>
              <div className="side-card left-card">
                <span>{restaurants[1]?.name || "寿司拼盘"}</span>
              </div>
              <div className="side-card right-card">
                <span>{restaurants[2]?.name || "番茄意面"}</span>
              </div>
              <div className="summon-burst" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <FoodPrizeCard restaurant={picked} theme={theme} restaurantsCount={restaurants.length} />

              <button className="summon-button" type="button" onClick={handleRoll} disabled={isSummoning}>
                <RefreshCcw size={24} />
                <span>{isSummoning ? "召唤中" : theme.action}</span>
                <small>{isSummoning ? "饭运正在展开" : theme.cost}</small>
              </button>

              <div className="summon-actions">
                <button type="button" onClick={handleRoll} disabled={isSummoning}>
                  <RefreshCcw size={18} />
                  {isSummoning ? "抽取中" : "再抽一次"}
                </button>
                <button type="button" onClick={picked ? () => markEaten(picked) : () => setView("library")}>
                  <Star size={18} />
                  {picked ? "记入历史" : "去卡册"}
                </button>
              </div>
            </section>

            <section className="recent-strip">
              <div className="section-title">
                <Clock3 size={18} />
                <h2>最近抽过</h2>
                <button type="button" onClick={() => setView("history")}>全部记录</button>
              </div>
              {recent.length === 0 ? (
                <EmptyState title="还没有抽卡记录" text="抽到结果后点“记入历史”，这里会出现最近饭运。" />
              ) : (
                <div className="mini-card-row">
                  {recent.map((item) => (
                    <article className="mini-card" key={item.id}>
                      <span>{rarityForName(item.restaurantName)}</span>
                      <strong>{item.restaurantName}</strong>
                      <time>{formatDate(item.eatenAt)}</time>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {view === "library" && (
          <section className="management-grid">
            <form className="glass-panel" onSubmit={submitRestaurant}>
              <div className="section-title">
                <ListPlus size={18} />
                <h2>{editingId ? "编辑卡牌" : "添加卡牌"}</h2>
              </div>
              <label className="field">
                <span>名称</span>
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="比如：楼下牛肉粉" />
              </label>
              <label className="field">
                <span>类型</span>
                <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="粉面、轻食、川菜" />
              </label>
              <div className="grid-two">
                <NumberField label="预算" value={draft.budget} min={1} onChange={(value) => setDraft({ ...draft, budget: value })} />
                <NumberField label="距离分钟" value={draft.distanceMinutes} min={1} onChange={(value) => setDraft({ ...draft, distanceMinutes: value })} />
              </div>
              <Slider label="健康程度" value={draft.health} min={1} max={5} step={1} unit="/5" onChange={(value) => setDraft({ ...draft, health: value })} />
              <Slider label="辣度" value={draft.spice} min={0} max={3} step={1} unit="/3" onChange={(value) => setDraft({ ...draft, spice: value })} />
              <Slider label="偏好权重" value={draft.weight} min={1} max={5} step={1} unit="/5" onChange={(value) => setDraft({ ...draft, weight: value })} />
              <Segmented
                label="方式"
                value={draft.mode}
                options={[
                  ["dine-in", "堂食"],
                  ["delivery", "外卖"],
                ]}
                onChange={(value) => setDraft({ ...draft, mode: value as Restaurant["mode"] })}
              />
              <label className="field">
                <span>备注</span>
                <textarea value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} placeholder="比如：下雨天别去，排队久" />
              </label>
              <label className="toggle-line">
                <input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />
                参与抽卡
              </label>
              <button className="primary-button full" type="submit">
                <Save size={18} />
                {editingId ? "保存修改" : "加入卡册"}
              </button>
            </form>

            <section className="glass-panel">
              {restaurants.length === 0 ? (
                <EmptyState title="卡册为空" text="先加 10 到 20 个常吃选项，这个工具就开始有用了。" />
              ) : (
                restaurants.map((item) => (
                  <article className={item.enabled ? "food-card" : "food-card disabled"} key={item.id}>
                    <div className="food-thumb">{dishEmoji(item)}</div>
                    <div>
                      <p>{rarityFor(item)} · {item.category || modeLabel(item.mode)}</p>
                      <h3>{item.name}</h3>
                      <div className="meta-line">
                        <span>¥{item.budget}</span>
                        <span>{item.distanceMinutes} 分钟</span>
                        <span>{spiceLabel(item.spice)}</span>
                        <span>权重 {item.weight}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button className="icon-button" type="button" title="编辑" onClick={() => editRestaurant(item)}>
                        <Pencil size={18} />
                      </button>
                      <button className="icon-button" type="button" title="删除" onClick={() => removeRestaurant(item.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
          </section>
        )}

        {view === "history" && (
          <section className="glass-panel">
            <div className="section-title">
              <Archive size={18} />
              <h2>最近抽到</h2>
            </div>
            {history.length === 0 ? (
              <EmptyState title="还没有记录" text="抽到结果后点“记入历史”，这里会帮你挡掉短期重复。" />
            ) : (
              history.map((item) => (
                <article className="history-row" key={item.id}>
                  <span>{item.restaurantName}</span>
                  <time>{formatDate(item.eatenAt)}</time>
                </article>
              ))
            )}
          </section>
        )}

        {view === "settings" && (
          <section className="settings-stack">
            <div className="glass-panel">
              <div className="section-title">
                <Settings size={18} />
                <h2>抽卡设置</h2>
              </div>
              <Slider label="最高预算" value={filters.maxBudget} min={15} max={150} step={5} unit="元" onChange={(value) => setFilters({ ...filters, maxBudget: value })} />
              <Slider label="最远距离" value={filters.maxDistance} min={5} max={60} step={5} unit="分钟" onChange={(value) => setFilters({ ...filters, maxDistance: value })} />
              <Slider label="最低健康" value={filters.minHealth} min={1} max={5} step={1} unit="/5" onChange={(value) => setFilters({ ...filters, minHealth: value })} />
              <Segmented
                label="辣度"
                value={filters.spicePreference}
                options={[
                  ["any", "不限"],
                  ["spicy", "想吃辣"],
                  ["mild", "不吃辣"],
                ]}
                onChange={(value) => setFilters({ ...filters, spicePreference: value as SpicePreference })}
              />
              <div className="candidate-row">
                <span>当前候选 {candidates.length}</span>
                <button type="button" onClick={relaxFilters}>放宽条件</button>
              </div>
            </div>

            <div className="glass-panel">
              <div className="section-title">
                <Sparkles size={18} />
                <h2>抽卡皮肤</h2>
              </div>
              <div className="theme-switcher" aria-label="抽卡页面样式">
                {themes.map((item) => (
                  <button className={item.id === theme.id ? "active" : ""} key={item.id} type="button" onClick={() => setThemeId(item.id)}>
                    {item.nav}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel">
              <div className="section-title">
                <Archive size={18} />
                <h2>数据备份</h2>
              </div>
              <div className="toolbar">
                <button type="button" onClick={exportBackup}>
                  <Download size={16} />
                  导出备份
                </button>
                <button type="button" onClick={() => fileInput.current?.click()}>
                  <Upload size={16} />
                  导入备份
                </button>
              </div>
              <p className="settings-hint">导出的 JSON 是本机数据备份，饭店卡册和历史仍保存在当前浏览器里。</p>
              <input ref={fileInput} className="hidden" type="file" accept="application/json" onChange={importBackup} />
            </div>

            <div className="glass-panel">
              <div className="section-title">
                <ChefHat size={18} />
                <h2>调试模式</h2>
              </div>
              <div className="toolbar">
                <button type="button" onClick={fillDemo}>填入示例</button>
              </div>
            </div>
          </section>
        )}
      </section>

      <nav className="bottom-nav">
        <button className={view === "roll" ? "active" : ""} type="button" onClick={() => setView("roll")}>
          <Dice5 size={19} />
          抽卡
        </button>
        <button className={view === "library" ? "active" : ""} type="button" onClick={() => setView("library")}>
          <BookOpen size={19} />
          卡册
        </button>
        <button className={view === "history" ? "active" : ""} type="button" onClick={() => setView("history")}>
          <History size={19} />
          历史
        </button>
        <button className={view === "settings" ? "active" : ""} type="button" onClick={() => setView("settings")}>
          <Settings size={19} />
          设置
        </button>
      </nav>
    </main>
  );
}

function FoodPrizeCard({ restaurant, theme, restaurantsCount }: { restaurant: Restaurant | null; theme: ThemeConfig; restaurantsCount: number }) {
  const emptyTitle = restaurantsCount ? "等待抽卡" : "卡池为空";
  const name = restaurant?.name ?? emptyTitle;
  return (
    <article className="prize-card">
      <div className="rarity-row">
        <strong>{restaurant ? rarityFor(restaurant) : "SSR"}</strong>
        <span>
          <Star size={16} />
          {theme.cardWord}
        </span>
      </div>
      <div className="dish-visual">
        <span>{restaurant ? dishEmoji(restaurant) : "🍱"}</span>
      </div>
      <div className="card-copy">
        <h2>{name}</h2>
        <p>{restaurant?.note || restaurant?.category || (restaurantsCount ? "设好条件，抽一张今日饭运" : "先去卡册放几家常吃的店")}</p>
      </div>
      <div className="stat-grid">
        <Stat icon={<WalletCards size={16} />} label="价格" value={restaurant ? `¥${restaurant.budget}` : "--"} />
        <Stat icon={<MapPin size={16} />} label="距离" value={restaurant ? `${restaurant.distanceMinutes}分` : "--"} />
        <Stat icon={<Leaf size={16} />} label="健康" value={restaurant ? `${restaurant.health * 20}分` : "--"} />
        <Stat icon={<Flame size={16} />} label="辣度" value={restaurant ? spiceLabel(restaurant.spice) : "--"} />
      </div>
    </article>
  );
}

function FilterChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="filter-chip">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="slider-field">
      <span>
        {label}
        <strong>{value}{unit}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function NumberField({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (value: number) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" min={min} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <div className="segmented-wrap">
      <span>{label}</span>
      <div className="segmented">
        {options.map(([key, text]) => (
          <button className={value === key ? "selected" : ""} key={key} type="button" onClick={() => onChange(key)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function makeRestaurant(input: Partial<Draft> & Pick<Draft, "name">): Restaurant {
  const now = new Date().toISOString();
  return {
    ...emptyDraft,
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

function modeLabel(mode: Restaurant["mode"]) {
  return mode === "delivery" ? "外卖" : "堂食";
}

function subtitleForView(view: View) {
  if (view === "library") return "我的卡册";
  if (view === "history") return "最近抽到";
  return "设置与备份";
}

function spicePreferenceLabel(value: SpicePreference) {
  if (value === "spicy") return "想吃辣";
  if (value === "mild") return "不吃辣";
  return "不限";
}

function spiceLabel(spice: number) {
  if (spice === 0) return "不辣";
  if (spice === 1) return "微辣";
  if (spice === 2) return "中辣";
  return "很辣";
}

function rarityFor(item: Restaurant) {
  if (item.weight >= 5 || item.health >= 5) return "SSR";
  if (item.weight >= 3 || item.health >= 3) return "SR";
  return "R";
}

function rarityForName(name: string) {
  if (name.length >= 5) return "SR";
  return "R";
}

function dishEmoji(item: Restaurant) {
  const text = `${item.name}${item.category}`;
  if (/粉|面|拉面|意面/.test(text)) return "🍜";
  if (/饭|盖饭|便当|米/.test(text)) return "🍛";
  if (/轻食|沙拉|健康/.test(text)) return "🥗";
  if (/寿司|日式/.test(text)) return "🍣";
  if (/火锅|锅/.test(text)) return "🍲";
  if (/鸡|鸭|肉|牛/.test(text)) return "🍗";
  return "🍱";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
